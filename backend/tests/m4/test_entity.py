"""R3 entity classification: precedence, confidence, conflicts, and the endpoint over PostgreSQL."""

from datetime import UTC, datetime

import pytest

from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.lookup import LabelView
from app.modules.m4_risk.entity import classify
from tests.m3.test_r2_labels import EIP55, OFAC, TRON, sdn_entry, sdn_xml

T0 = datetime(2026, 11, 17, 9, 0, tzinfo=UTC)
ADDR = "0x" + "a" * 40


def view(category: str, source: str, confidence: float, name: str = "x", commercial: str = "allowed") -> LabelView:
    return LabelView(
        address=ADDR, network="evm", chain_id=0, category=category, name=name, confidence=confidence,
        source_key=source, source_name=source, licence="l", commercial_use=commercial, source_ref=None,
        attributes={}, valid_from=T0, valid_to=None, import_id=1,
    )


def test_no_label_is_unknown_not_clean():
    e = classify([])
    assert (e.entity_type, e.group, e.confidence, e.sources) == ("unknown", "unknown", 0.0, [])


def test_single_label_keeps_its_confidence_and_entity():
    e = classify([view("exchange", "etherscan_labels_community", 0.70, "Binance 14")])
    assert (e.entity_type, e.group, e.confidence, e.primary_source) == ("exchange", "service", 0.70, "etherscan_labels_community")
    assert e.name == "Binance 14" and not e.conflict


def test_sanctions_outrank_exchange_and_conflict_is_flagged():
    e = classify([
        view("exchange", "etherscan_labels_community", 0.70),
        view("sanctions", "ofac_sdn_official", 0.99, "GARANTEX"),
    ])
    assert e.entity_type == "sanctioned" and e.group == "risk"
    assert e.conflict is True and e.primary_source == "ofac_sdn_official"
    assert any("conservative" in r for r in e.reasons)


def test_agreement_between_sources_raises_confidence_capped_at_099():
    one = classify([view("mixer", "a", 0.80)])
    two = classify([view("mixer", "a", 0.80), view("mixer", "b", 0.80)])
    many = classify([view("mixer", s, 0.97) for s in "abcdef"])
    assert one.confidence == 0.80 and two.confidence == 0.82 and many.confidence == 0.99
    assert two.sources == ["a", "b"] and two.entity_type == "mixer"


def test_top_label_within_the_chosen_entity_supplies_source_and_name():
    e = classify([
        view("hack", "defihacklabs", 0.90, "attacker of X"),
        view("hack", "curated_law_enforcement", 0.95, "seized wallet"),
    ])
    assert e.primary_source == "curated_law_enforcement" and e.name == "seized wallet"
    assert e.confidence == 0.97  # 0.95 + one extra source


def test_non_commercial_top_source_is_noted():
    e = classify([view("scam", "etherscan_labels_community", 0.70, commercial="unverified")])
    assert any("commercial use (unverified)" in r for r in e.reasons)


def test_unrecognised_category_falls_back_to_other_service():
    e = classify([view("something_new", "x", 0.5)])
    assert (e.entity_type, e.group) == ("other", "service")


@pytest.mark.integration
def test_entity_endpoint_over_http(db):
    from tests.m3.test_api import client as make_client

    LabelImporter(db, clock=lambda: T0).run(
        OFAC, sdn_xml(sdn_entry("100", "LAZARUS GROUP", [
            ("Digital Currency Address - TRX", TRON), ("Digital Currency Address - ETH", EIP55),
        ])), "test",
    )
    c = make_client(db, [])
    r = c.get("/api/v1/entity", params={"address": TRON, "network": "tron"}).json()
    assert r["entity_type"] == "sanctioned" and r["group"] == "risk" and r["confidence"] == 0.99
    assert r["name"] == "LAZARUS GROUP" and r["sources"] == ["ofac_sdn_official"]

    r = c.get("/api/v1/entity", params={"address": "0x" + "b" * 40}).json()
    assert r["entity_type"] == "unknown" and r["confidence"] == 0.0

    assert c.get("/api/v1/entity", params={"address": "nope"}).status_code == 422
