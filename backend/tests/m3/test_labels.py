"""M3.4 labels: parsers (offline) and versioned imports against PostgreSQL (integration)."""

import json
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select

from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.lookup import labels_for
from app.modules.m3_data.labels.sources import SOURCES, parse_etherscan_labels, parse_mew_darklist, parse_ofac
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

OFAC = SOURCES["ofac_sdn"]
MEW = SOURCES["mew_darklist"]
COMMUNITY = SOURCES["etherscan_labels_community"]
T0 = datetime(2026, 11, 17, 9, 0, tzinfo=UTC)


def a(n: int) -> str:
    return "0x" + format(n, "040x")


def ofac_csv(rows: list[tuple[str, str]]) -> bytes:
    return ("address,name\n" + "".join(f"{addr},{name}\n" for addr, name in rows)).encode()


# ---- parsers (offline) ----------------------------------------------------------------------------


def test_parse_ofac_normalises_and_skips_bad_rows():
    raw = b"\xef\xbb\xbfaddress,name\n0x" + b"A" * 40 + b",LAZARUS GROUP\nnot-an-address,X\n"
    p = parse_ofac(raw, OFAC)
    assert p.skipped == 1
    (r,) = p.records
    assert r.address == "0x" + "a" * 40 and r.category == "sanctions" and r.confidence == 0.99 and r.chain_id == 0


def test_parse_darklist_detects_phishing():
    raw = json.dumps([
        {"address": a(1), "comment": "Phishing site myetherwallet.co", "date": "2018-01-01"},
        {"address": a(2), "comment": "Fake ICO", "date": "2018-02-01"},
        {"comment": "no address"},
    ]).encode()
    p = parse_mew_darklist(raw, MEW)
    assert [r.category for r in p.records] == ["phishing", "scam"] and p.skipped == 1
    assert p.records[0].source_ref == "2018-01-01"


def test_parse_community_labels_maps_tags_risk_first():
    raw = json.dumps({
        a(1): {"name": "Tornado.Cash: Router", "labels": ["tornado-cash", "ofac-sanctions-lists"]},
        a(2): {"name": "Binance 14", "labels": ["binance"]},
        a(3): {"name": "Multichain Hack Alert 1", "labels": ["take-action"]},
        a(4): {"name": "Some pool", "labels": ["sushiswap"]},
        a(5): {"name": "", "labels": ["meme"]},
    }).encode()
    cats = {r.address: r.category for r in parse_etherscan_labels(raw, COMMUNITY).records}
    # Community "ofac-sanctions-lists" tags are not trusted as sanctions; the mixer tag decides.
    assert cats == {a(1): "mixer", a(2): "exchange", a(3): "hack", a(4): "defi", a(5): "other"}


# ---- versioned import (PostgreSQL) ----------------------------------------------------------------


def importer(db, at):
    clock = {"now": at}
    return LabelImporter(db, clock=lambda: clock["now"]), clock


@pytest.mark.integration
def test_import_versions_changes_and_keeps_removed_labels_as_history(db):
    imp, clock = importer(db, T0)
    r1 = imp.run(OFAC, ofac_csv([(a(1), "ALPHA"), (a(2), "BRAVO"), (a(3), "CHARLIE")]), "test")
    assert (r1.status, r1.added) == ("applied", 3)

    clock["now"] = T0 + timedelta(days=1)
    r2 = imp.run(OFAC, ofac_csv([(a(1), "ALPHA"), (a(2), "BRAVO RENAMED"), (a(4), "DELTA")]), "test")
    assert (r2.added, r2.changed, r2.removed, r2.unchanged) == (1, 1, 1, 1)

    # Nothing deleted: 3 original rows + 1 changed + 1 added.
    assert db.scalar(select(func.count()).select_from(AddressLabel)) == 5
    current = labels_for(db, [a(1), a(2), a(3), a(4)], chain_id=1)
    assert [v.name for v in current[a(2)]] == ["BRAVO RENAMED"]
    assert current[a(3)] == []  # removed from the list: inactive now
    old = labels_for(db, [a(2), a(3)], chain_id=1, as_of=T0 + timedelta(hours=1))
    assert [v.name for v in old[a(2)]] == ["BRAVO"] and [v.name for v in old[a(3)]] == ["CHARLIE"]

    closed = db.scalar(select(AddressLabel).where(AddressLabel.address == a(3)))
    assert closed.valid_to == clock["now"] and closed.ended_by_import_id == r2.import_id


@pytest.mark.integration
def test_identical_content_is_logged_but_not_reapplied(db):
    imp, clock = importer(db, T0)
    raw = ofac_csv([(a(1), "ALPHA")])
    imp.run(OFAC, raw, "test")
    clock["now"] = T0 + timedelta(days=1)
    r = imp.run(OFAC, raw, "test")
    assert r.status == "unchanged" and "same content" in r.message
    assert db.scalar(select(func.count()).select_from(LabelImport)) == 2
    assert db.scalar(select(func.count()).select_from(AddressLabel)) == 1


@pytest.mark.integration
def test_truncated_download_is_rejected_not_applied(db):
    imp, clock = importer(db, T0)
    imp.run(OFAC, ofac_csv([(a(i), f"E{i}") for i in range(1, 41)]), "test")
    clock["now"] = T0 + timedelta(days=1)
    r = imp.run(OFAC, ofac_csv([(a(1), "E1")]), "test")
    assert r.status == "rejected" and "refused" in r.message
    assert len([v for vs in labels_for(db, [a(i) for i in range(1, 41)], 1).values() for v in vs]) == 40

    forced = imp.run(OFAC, ofac_csv([(a(1), "E1")]), "test", force=True)
    assert forced.status == "applied" and forced.removed == 39


@pytest.mark.integration
def test_lookup_returns_provenance_and_filters_by_licence_and_chain(db):
    imp, _ = importer(db, T0)
    imp.run(OFAC, ofac_csv([(a(1), "LAZARUS")]), "https://example.test/ofac.csv")
    imp.run(COMMUNITY, json.dumps({a(1): {"name": "Lazarus Group", "labels": ["ofac-sanctions-lists"]}}).encode(), "file:x")

    views = labels_for(db, [a(1).upper().replace("0X", "0x")], chain_id=1)[a(1)]
    assert [v.source_key for v in views] == ["ofac_sdn", "etherscan_labels_community"]  # by confidence
    assert views[0].licence.startswith("US government") and views[0].import_id > 0
    assert [v.source_key for v in labels_for(db, [a(1)], 1, commercial_only=True)[a(1)]] == ["ofac_sdn"]
    # Community labels are Ethereum-only (chain_id 1); OFAC applies on every EVM chain.
    assert [v.source_key for v in labels_for(db, [a(1)], 137)[a(1)]] == ["ofac_sdn"]

    reg = db.get(LabelSource, "etherscan_labels_community")
    assert reg.commercial_use == "unverified"
    log = db.scalar(select(LabelImport).where(LabelImport.source_key == "ofac_sdn"))
    assert log.commercial_use == "allowed" and log.retrieved_from == "https://example.test/ofac.csv"
    assert len(log.content_sha256) == 64
