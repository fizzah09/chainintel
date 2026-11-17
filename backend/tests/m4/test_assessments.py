"""M4.3: stored assessments are permanent, tamper-evident, tenant-scoped and reproducible."""

import json
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES
from app.modules.m3_data.models import AssetPrice, ChainTransfer
from app.modules.m3_data.providers.base import TransferKind
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.models import RiskAssessment
from app.modules.m4_risk.service import AssessmentError, RiskService, verify_chain
from tests.m3.test_sync import Scripted, tx

pytestmark = pytest.mark.integration

W = "0x" + "1" * 40
FRIEND = "0x" + "2" * 40
SDN = "0x" + "5" * 40
LATE = "0x" + "6" * 40
T0 = datetime(2026, 11, 17, 10, 0, tzinfo=UTC)
ALICE = Principal(user_id="alice@bank-a", tenant_id="bank-a", roles=["analyst"])


class Clock:
    def __init__(self, t):
        self.t = t

    def __call__(self):
        return self.t

    def advance(self, **kw):
        self.t += timedelta(**kw)


def world(db, clock):
    """A wallet that got ETH from FRIEND, who was paid by a sanctioned address."""
    chain = [
        tx(80, "0x80", frm=FRIEND, to=W, value=2 * 10**18),
        tx(95, "0x81", frm=W, to=LATE, value=10**18),  # recent: still unconfirmed, can be reorged away
        tx(70, "0x70", frm=SDN, to=FRIEND, value=10**18),
    ]
    provider = Scripted(head=100, chain=chain)
    LabelImporter(db, clock=lambda: clock() - timedelta(hours=1)).run(SOURCES["ofac_sdn"], f"address,name\n{SDN},TEST SDN\n".encode(), "file:t")
    db.add(AssetPrice(price_key="ETH", day=date(2026, 11, 17), source="chainlink", usd=Decimal("1779"),
                      observed_at=T0, source_ref="chainlink:test", fetched_at=clock() - timedelta(hours=1)))
    db.commit()
    return provider


def service(db, provider, clock, principal=ALICE, **settings):
    s = Settings(_env_file=None, **{"default_confirmations": 12, "risk_neighbours": 2, **settings})
    return RiskService(db, ProviderRouter([provider]), s, principal, clock=clock)


def test_assessment_is_stored_with_versions_inputs_and_hashes(db):
    clock = Clock(T0)
    provider = world(db, clock)
    row = service(db, provider, clock).assess(W, 1)

    assert (row.ruleset_version, row.tier, row.created_by, row.tenant_id) == (3, row.report["tier"], "alice@bank-a", "bank-a")
    assert row.model_sha256 == row.report["modelSha256"] and len(row.inputs_sha256) == 64
    assert row.prev_hash == "0" * 64 and row.as_of == T0
    sanctions = [f for f in row.report["factors"] if f["id"] == "sanctions"]
    assert sanctions and sanctions[0]["evidence"][0]["path"] == [W, FRIEND, SDN]
    m = row.manifest
    assert m["neighbours"] and m["neighbourLimit"] == 2 and m["priceSources"] == ["chainlink"] and m["labelImportIds"]


def test_database_refuses_to_edit_or_delete_an_assessment(db):
    clock = Clock(T0)
    row = service(db, world(db, clock), clock).assess(W, 1)
    for stmt in ("UPDATE risk_assessments SET score = 0", "DELETE FROM risk_assessments"):
        with pytest.raises(DBAPIError, match="append-only"):
            db.execute(text(stmt))
        db.rollback()
    assert db.get(RiskAssessment, row.id).score == row.score


def test_rerun_is_identical_after_the_world_moved_on(db):
    clock = Clock(T0)
    provider = world(db, clock)
    svc = service(db, provider, clock)
    original = svc.assess(W, 1)

    # Everything changes afterwards: new transfers, a reorg removing an old one, a new label on a
    # counterparty, a new price for the same day, and a different neighbour setting.
    clock.advance(days=2)
    provider.head = 130
    provider.chain = [t for t in provider.chain if t.tx_hash != "0x81"] + [tx(120, "0x120", frm=SDN, to=W, value=10**18)]
    svc.assess(W, 1)  # syncs the new data and marks 0x81 removed
    assert db.query(ChainTransfer).filter(ChainTransfer.tx_hash == "0x81").one().removed_at is not None
    LabelImporter(db, clock=clock).run(SOURCES["mew_darklist"], json.dumps([{"address": LATE, "comment": "Phishing"}]).encode(), "file:t")
    db.add(AssetPrice(price_key="ETH", day=date(2026, 11, 17), source="coingecko", usd=Decimal("9999"),
                      observed_at=clock(), source_ref="coingecko:test", fetched_at=clock()))
    db.commit()

    later = service(db, provider, clock, risk_neighbours=0)
    fresh = later.assess(W, 1, refresh_data=False)
    assert fresh.score != original.score  # today's view differs (direct sanctions now)

    rep = later.rerun(original.public_id)
    assert rep.identical and rep.inputs_match and rep.report_match and rep.differences == []
    assert rep.score_rerun == original.score
    stored = later.get(rep.reproduction_id)
    assert stored.trigger == "reproduction" and stored.reproduces_id == original.id


def test_hash_chain_detects_edits_and_deletions_even_with_the_trigger_off(db):
    clock = Clock(T0)
    svc = service(db, world(db, clock), clock)
    rows = []
    for _ in range(3):
        clock.advance(minutes=1)
        rows.append(svc.assess(W, 1, refresh_data=False))
    assert verify_chain(db, "bank-a").ok and verify_chain(db, "bank-a").checked == 3

    db.execute(text("ALTER TABLE risk_assessments DISABLE TRIGGER risk_assessments_append_only"))
    try:
        db.execute(text("UPDATE risk_assessments SET score = 1 WHERE id = :id"), {"id": rows[1].id})
        db.commit()
        check = verify_chain(db, "bank-a")
        assert not check.ok and check.first_bad_id == rows[1].id and "edited" in check.reason

        db.execute(text("UPDATE risk_assessments SET score = :s WHERE id = :id"), {"s": rows[1].score, "id": rows[1].id})
        db.execute(text("DELETE FROM risk_assessments WHERE id = :id"), {"id": rows[1].id})
        db.commit()
        check = verify_chain(db, "bank-a")
        assert not check.ok and check.first_bad_id == rows[2].id and "removed" in check.reason
    finally:
        db.rollback()
        db.execute(text("ALTER TABLE risk_assessments ENABLE TRIGGER risk_assessments_append_only"))
        db.commit()


def test_tenants_cannot_see_each_others_assessments(db):
    clock = Clock(T0)
    provider = world(db, clock)
    mine = service(db, provider, clock).assess(W, 1)
    bob = service(db, provider, clock, principal=Principal(user_id="bob", tenant_id="bank-b", roles=["analyst"]))
    with pytest.raises(AssessmentError, match="not found"):
        bob.get(mine.public_id)
    with pytest.raises(AssessmentError, match="not found"):
        bob.rerun(mine.public_id)
    other = bob.assess(W, 1, refresh_data=False)
    assert other.prev_hash == "0" * 64  # each tenant has its own chain
    assert verify_chain(db, "bank-a").checked == 1 and verify_chain(db, "bank-b").checked == 1


def test_unknown_rule_set_is_refused(db):
    clock = Clock(T0)
    with pytest.raises(AssessmentError, match="rule set 99"):
        service(db, world(db, clock), clock).assess(W, 1, ruleset_version=99)
