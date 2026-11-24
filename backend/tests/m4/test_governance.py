"""M4.4 model governance, rules-first review flags and drift."""

import json
import random
import uuid
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.drift import drift_report, level, psi
from app.modules.m4_risk.engine.classifier import DEFAULT_MODEL
from app.modules.m4_risk.governance import GovernanceError, ModelRegistry
from app.modules.m4_risk.models import ModelVersion, RiskAssessment
from app.modules.m4_risk.service import AssessmentError, RiskService
from tests.m4.test_assessments import ALICE, T0, W, Clock, world

TRAINER = Principal(user_id="tina-trainer", tenant_id="platform", roles=["model_owner", "model_validator", "model_approver"])
VAL = Principal(user_id="victor-validator", tenant_id="platform", roles=["model_validator"])
APP = Principal(user_id="anna-approver", tenant_id="platform", roles=["model_approver"])
REPORT = json.loads((Path(__file__).resolve().parents[3] / "ml" / "reports" / "classifier-metrics.json").read_text(encoding="utf-8")) \
    if (Path(__file__).resolve().parents[3] / "ml" / "reports" / "classifier-metrics.json").exists() else None


def variant(tmp_path: Path, name: str, **changes) -> Path:
    """A copy of the trained model with some fields changed (gives a different fingerprint)."""
    data = json.loads(DEFAULT_MODEL.read_text(encoding="utf-8"))
    for k, v in changes.items():
        data[k] = {**data[k], **v} if isinstance(v, dict) and isinstance(data.get(k), dict) else v
    p = tmp_path / f"{name}.json"
    p.write_text(json.dumps(data), encoding="utf-8")
    return p


def settings(tmp_path, **kw):
    return Settings(_env_file=None, **{"model_store_dir": str(tmp_path / "store"), "default_confirmations": 12, "risk_neighbours": 2, **kw})


def approved(db, tmp_path, artefact=DEFAULT_MODEL, s=None):
    reg = ModelRegistry(db, s or settings(tmp_path))
    m = reg.register(artefact, trained_by="tina-trainer", actor=TRAINER, training_report=REPORT)
    reg.validate(m.id, VAL, "independent check done")
    reg.approve(m.id, APP, "approved for pilot")
    return m


# ---- lifecycle --------------------------------------------------------------------------------------


@pytest.mark.integration
def test_lifecycle_enforces_independence_and_order(db, tmp_path):
    reg = ModelRegistry(db, settings(tmp_path))
    m = reg.register(DEFAULT_MODEL, trained_by="tina-trainer", actor=TRAINER, training_report=REPORT)
    assert (m.status, m.training_data["rows"]) == ("registered", 9816) and (Path(reg.artefact_path(m.sha256))).exists()

    with pytest.raises(GovernanceError, match="already registered"):
        reg.register(DEFAULT_MODEL, trained_by="x", actor=TRAINER)
    with pytest.raises(GovernanceError, match="expected validated"):
        reg.approve(m.id, APP, "too early")
    with pytest.raises(GovernanceError, match="trained a model cannot validate"):
        reg.validate(m.id, TRAINER, "my own work")
    with pytest.raises(GovernanceError, match="requires role model_validator"):
        reg.validate(m.id, APP, "wrong role")

    review = reg.validate(m.id, VAL, "checked")
    assert review.evidence["passed"] and review.evidence["roc_auc"] == 0.9853
    both = Principal(user_id="victor-validator", tenant_id="platform", roles=["model_approver"])
    with pytest.raises(GovernanceError, match="fourth pair of eyes"):
        reg.approve(m.id, both, "I validated it too")
    reg.approve(m.id, APP, "ok")
    assert reg.active("illicit-classifier").id == m.id

    with pytest.raises(DBAPIError, match="append-only"):
        db.execute(text("UPDATE model_reviews SET comment = 'edited'"))
    db.rollback()


@pytest.mark.integration
def test_validation_refuses_a_weak_model_and_approval_retires_the_previous(db, tmp_path):
    reg = ModelRegistry(db, settings(tmp_path))
    weak = reg.register(variant(tmp_path, "weak", version="weak", metrics={"roc_auc": 0.61, "brier": 0.3}), trained_by="tina-trainer", actor=TRAINER)
    with pytest.raises(GovernanceError, match="ROC AUC 0.61 below"):
        reg.validate(weak.id, VAL, "no")
    reg.reject(weak.id, VAL, "too weak")

    first = approved(db, tmp_path)
    second = approved(db, tmp_path, variant(tmp_path, "v2", version="gbm-v2"))
    db.refresh(first)
    assert (first.status, second.status) == ("retired", "approved")


@pytest.mark.integration
def test_scoring_needs_an_approved_model_outside_development(db, tmp_path):
    reg = ModelRegistry(db, settings(tmp_path))
    model, status, mid = reg.model_for_assessment()
    assert (status, mid) == ("unapproved", None)
    with pytest.raises(GovernanceError, match="no approved model"):
        ModelRegistry(db, settings(tmp_path, env="production")).model_for_assessment()

    m = approved(db, tmp_path)
    model, status, mid = reg.model_for_assessment()
    assert (status, mid, model.sha256) == ("approved", m.id, m.sha256)
    reg.artefact_path(m.sha256).write_text("{}", encoding="utf-8")  # tampered store
    with pytest.raises(GovernanceError, match="does not match"):
        reg.model_for_assessment()


# ---- rules first ------------------------------------------------------------------------------------


@pytest.mark.integration
def test_model_never_changes_the_score_and_disagreement_goes_to_review(db, tmp_path):
    clock = Clock(T0)
    provider = world(db, clock)
    s = settings(tmp_path)
    svc = RiskService(db, ProviderRouter([provider]), s, ALICE, clock=clock)
    baseline = svc.assess(W, 1)
    assert baseline.model_status == "unapproved" and any("not been validated" in r for r in baseline.review_reasons)

    # An extreme model that calls everything illicit (log-odds start at +20).
    approved(db, tmp_path, variant(tmp_path, "paranoid", version="paranoid", init=20.0), s)
    # Same knowledge time, same data: only the model differs.
    paranoid = svc.assess(W, 1, refresh_data=False)

    assert float(paranoid.ml_probability) > 0.99 and paranoid.model_status == "approved"
    assert (paranoid.score, paranoid.tier) == (baseline.score, baseline.tier)
    assert [f["points"] for f in paranoid.report["factors"]] == [f["points"] for f in baseline.report["factors"]]
    assert paranoid.review_required and any("Model estimates 100% illicit probability" in r for r in paranoid.review_reasons)
    assert not any("not been validated" in r for r in paranoid.review_reasons)

    rep = svc.rerun(paranoid.public_id)  # model loaded from the content-addressed store
    assert rep.identical


@pytest.mark.integration
def test_wallet_labelled_itself_flagged_in_v2_and_scored_in_v3(db, tmp_path):
    clock = Clock(T0)
    provider = world(db, clock)
    LabelImporter(db, clock=lambda: T0 - timedelta(hours=2)).run(
        SOURCES["mew_darklist"], json.dumps([{"address": W, "comment": "Phishing site"}]).encode(), "file:t")
    svc = RiskService(db, ProviderRouter([provider]), settings(tmp_path), ALICE, clock=clock)
    v2 = svc.assess(W, 1, ruleset_version=2)
    assert v2.report["entity"]["type"] == "phishing" and not any(f["id"] == "scam" for f in v2.report["factors"])
    assert any("wallet itself is labelled 'phishing'" in r for r in v2.review_reasons)

    v3 = svc.assess(W, 1, ruleset_version=3, refresh_data=False)
    scam = next(f for f in v3.report["factors"] if f["id"] == "scam")
    assert scam["points"] == 15 and scam["evidence"][0]["relationship"] == "Wallet itself"
    assert v3.score >= v2.score + 15 and not any("wallet itself" in r for r in v3.review_reasons)


# ---- drift -----------------------------------------------------------------------------------------


def test_psi_reads_stable_and_shifted_populations():
    rnd = random.Random(7)
    a = [rnd.gauss(0, 1) for _ in range(2000)]
    b = [rnd.gauss(0, 1) for _ in range(2000)]
    c = [rnd.gauss(1.5, 1) for _ in range(2000)]
    assert level(psi(a, b)) == "stable" and level(psi(a, c)) == "significant"
    assert psi([5.0] * 50, [5.0] * 50) == 0 and psi([5.0] * 50, [9.0] * 50) > 0.25


@pytest.mark.integration
def test_drift_report_compares_the_last_two_windows(db):
    now = datetime(2026, 11, 17, tzinfo=UTC)
    rnd = random.Random(1)

    def row(created, prob, received):
        return RiskAssessment(
            public_id=uuid.uuid4(), tenant_id="bank-a", chain_id=1, address=W, as_of=created, created_at=created, created_by="t",
            trigger="manual", ruleset_version=2, model_version="m", model_sha256="s" * 64, app_version="0", score=0, tier="low",
            confidence=50, ml_probability=Decimal(str(round(prob, 10))), report={"features": {"total_ether_received": received}},
            manifest={}, data_quality={}, inputs_sha256="i" * 64, report_sha256="r" * 64, model_status="approved",
            review_required=False, review_reasons=[], prev_hash="p" * 64, row_hash=uuid.uuid4().hex * 2,
        )

    for i in range(200):
        db.add(row(now - timedelta(days=45, minutes=i), rnd.uniform(0, 0.2), rnd.uniform(0, 10)))  # reference
        db.add(row(now - timedelta(days=10, minutes=i), rnd.uniform(0, 0.2), rnd.uniform(50, 90)))  # current: much larger inflows
    db.commit()
    rep = drift_report(db, "bank-a", "s" * 64, now)
    assert (rep.reference_count, rep.current_count, rep.status) == (200, 200, "significant")
    assert rep.items[0].name == "total_ether_received"
    probability = next(i for i in rep.items if i.name == "model probability")
    assert probability.level == "stable"
    assert drift_report(db, "bank-a", "s" * 64, now, min_samples=500).status == "insufficient data"
