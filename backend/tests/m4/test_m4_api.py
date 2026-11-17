"""M4.5: HTTP API for assessments, governance and back-tests; back-test metrics."""

import json
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.main import create_app
from app.modules.m3_data.api import get_provider_router
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.api import get_coingecko
from app.modules.m4_risk.backtest import roc_auc, summarise
from app.modules.m4_risk.engine import RULESETS
from app.modules.m4_risk.engine.classifier import DEFAULT_MODEL
from app.modules.m4_risk.governance import ModelRegistry
from tests.m4.test_assessments import FRIEND, LATE, SDN, T0, W, Clock, world
from tests.m4.test_governance import REPORT, TRAINER

VICTOR = {"X-Dev-User": "victor-validator", "X-Dev-Roles": "model_validator"}
ANNA = {"X-Dev-User": "anna-approver", "X-Dev-Roles": "model_approver"}


def test_roc_auc_and_cutoffs():
    assert roc_auc([3, 4], [1, 2]) == 1.0 and roc_auc([1, 2], [3, 4]) == 0.0 and roc_auc([5], [5]) == 0.5
    assert roc_auc([], [1]) is None
    rows = [{"outcome": o, "score": s, "probability": p, "tier": RULESETS[3].tier_for(s), "category": c}
            for o, s, p, c in [("illicit", 80, 0.9, "sanctions"), ("illicit", 55, 0.2, "scam"), ("illicit", 10, 0.6, "scam"),
                               ("legitimate", 60, 0.1, None), ("legitimate", 5, 0.05, None)]]
    m = summarise(rows, RULESETS[3], excluded=1)
    high = m["rules"]["highOrAbove"]
    assert (high["tp"], high["fp"], high["fn"], high["tn"]) == (2, 1, 1, 1)
    assert high["precision"] == 0.6667 and high["recall"] == 0.6667
    assert m["byCategory"]["scam"] == {"cases": 2, "recallHighOrAbove": 0.5, "meanScore": 32.5}
    assert m["disagreementRate"] == 0.6 and m["excludedNoData"] == 1 and len(m["warnings"]) == 2


@pytest.fixture
def api(db, tmp_path):
    clock = Clock(T0)
    provider = world(db, clock)
    app = create_app()
    settings = Settings(_env_file=None, default_confirmations=12, risk_neighbours=2, model_store_dir=str(tmp_path / "store"))
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_provider_router] = lambda: ProviderRouter([provider])
    app.dependency_overrides[get_coingecko] = lambda: None
    return TestClient(app), settings


@pytest.mark.integration
def test_assess_read_reproduce_and_verify_over_http(api):
    c, _ = api
    r = c.post(f"/api/v1/chains/1/addresses/{W}/assessments", json={})
    assert r.status_code == 201, r.text
    a = r.json()
    assert a["ruleset_version"] == 3 and a["model_status"] == "unapproved" and a["review_required"]
    assert any(f["id"] == "sanctions" for f in a["report"]["factors"]) and FRIEND in a["manifest"]["neighbours"]

    listed = c.get(f"/api/v1/chains/1/addresses/{W}/assessments").json()
    assert [x["id"] for x in listed] == [a["id"]]
    rep = c.post(f"/api/v1/assessments/{a['id']}/reproduce").json()
    assert rep["identical"] is True
    again = c.get(f"/api/v1/assessments/{rep['reproduction_id']}").json()
    assert again["trigger"] == "reproduction" and again["reproduces"] == a["id"]
    assert c.get("/api/v1/assessments/verify-chain").json() == {"ok": True, "checked": 2, "first_bad_id": None, "reason": None}

    other = {"X-Dev-Tenant": "bank-z"}
    assert c.get(f"/api/v1/assessments/{a['id']}", headers=other).status_code == 404
    assert c.get(f"/api/v1/chains/1/addresses/{W}/assessments", headers=other).json() == []
    assert c.post(f"/api/v1/chains/1/addresses/{W}/assessments", json={"ruleset_version": 9}).status_code == 409

    rs = {x["version"]: x for x in c.get("/api/v1/rulesets").json()}
    assert sorted(rs) == [1, 2, 3] and rs[3]["default"] and rs[3]["score_own_label"] and rs[1]["eth_usd"] == 3000


@pytest.mark.integration
def test_four_eyes_approval_over_http(api, db):
    c, settings = api
    m = ModelRegistry(db, settings).register(DEFAULT_MODEL, trained_by="victor-validator", actor=TRAINER, training_report=REPORT)

    assert c.post(f"/api/v1/models/{m.id}/validate", json={"comment": "checked"}).status_code == 403  # no role
    r = c.post(f"/api/v1/models/{m.id}/validate", json={"comment": "my own model"}, headers=VICTOR)
    assert r.status_code == 409 and "trained a model cannot validate" in r.json()["detail"]

    other_validator = {"X-Dev-User": "val-2", "X-Dev-Roles": "model_validator"}
    assert c.post(f"/api/v1/models/{m.id}/validate", json={"comment": "independent check"}, headers=other_validator).status_code == 200
    r = c.post(f"/api/v1/models/{m.id}/approve", json={"comment": "self approve"}, headers={"X-Dev-User": "val-2", "X-Dev-Roles": "model_approver"})
    assert r.status_code == 409 and "fourth pair of eyes" in r.json()["detail"]
    assert c.post(f"/api/v1/models/{m.id}/approve", json={"comment": "approved"}, headers=ANNA).status_code == 200

    detail = c.get(f"/api/v1/models/{m.id}").json()
    assert detail["status"] == "approved" and [x["decision"] for x in detail["reviews"]] == ["registered", "validated", "approved"]
    a = c.post(f"/api/v1/chains/1/addresses/{W}/assessments", json={}).json()
    assert a["model_status"] == "approved"
    assert c.get("/api/v1/models/drift").json()["status"] == "insufficient data"


@pytest.mark.integration
def test_reviewed_cases_and_backtest_over_http(api, db):
    c, _ = api
    c.post(f"/api/v1/chains/1/addresses/{W}/assessments", json={})  # syncs W and FRIEND into M3
    LabelImporter(db, clock=lambda: T0 - timedelta(hours=3)).run(
        SOURCES["etherscan_labels_community"], json.dumps({SDN: {"name": "x", "labels": ["heist"]}}).encode(), "file:t")
    cases = [
        # FRIEND took funds directly from the sanctioned address; LATE only received from W.
        {"chain_id": 1, "address": FRIEND, "decided_at": (T0 + timedelta(days=1)).isoformat(), "outcome": "illicit", "category": "sanctions"},
        {"chain_id": 1, "address": LATE, "decided_at": (T0 + timedelta(days=1)).isoformat(), "outcome": "legitimate"},
        {"chain_id": 1, "address": "0x" + "7" * 40, "decided_at": (T0 + timedelta(days=1)).isoformat(), "outcome": "legitimate"},
    ]
    assert c.post("/api/v1/reviewed-cases", json=cases).json() == {"added": 3, "skipped": 0}
    assert c.post("/api/v1/reviewed-cases", json=cases[:1]).json() == {"added": 0, "skipped": 1}  # same decision twice
    assert c.post("/api/v1/reviewed-cases", json=cases, headers={"X-Dev-Roles": "analyst"}).status_code == 403

    run = c.post("/api/v1/backtests", json={"ruleset_version": 3}).json()
    m = run["metrics"]
    assert (run["cases"], m["evaluated"], m["excludedNoData"]) == (3, 2, 1)  # the never-synced wallet is excluded
    per = {r["address"]: r for r in run["per_case"]}
    assert per[FRIEND]["tier"] == "crit" and "sanctions" in per[FRIEND]["factors"] and per[FRIEND]["score"] > per[LATE]["score"]
    assert m["rules"]["critical"]["tp"] == 1 and m["rules"]["critical"]["fp"] == 0
    assert m["warnings"][0].startswith("Fewer than 20 cases") and m["pointInTime"] is True
    assert c.get("/api/v1/backtests").json()[0]["id"] == run["id"]
    assert c.post("/api/v1/backtests", json={"ruleset_version": 42}).status_code == 422
