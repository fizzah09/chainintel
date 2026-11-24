"""M4.1: the Python engine reproduces the JavaScript prototype (rule set 1) exactly.

Golden outputs come from running src/engine on 13 wallets (tests/m4/js/export_golden.mjs).
Strings, integers, scores, tiers and factor points must match exactly. Floats may differ only in the
last bits (exp/pow come from different maths libraries in V8 and CPython).
"""

import hashlib
import json
import math
from pathlib import Path

import pytest

from app.modules.m4_risk.engine import RULESET_V1, assess_from_data, load_model, predict_illicit
from app.modules.m4_risk.engine.classifier import DEFAULT_MODEL
from app.modules.m4_risk.engine.jscompat import js_round, js_str, js_sum, parse_ms, to_fixed, to_iso

FIXTURES = Path(__file__).parent / "fixtures"
GOLDEN = json.loads((FIXTURES / "golden.json").read_text(encoding="utf-8"))
REPO = Path(__file__).resolve().parents[3]
PY_ONLY = {"modelVersion", "modelSha256"}  # added by the port for the audit trail


def assert_same(js, py, path="report"):
    if isinstance(js, dict):
        assert isinstance(py, dict), f"{path}: expected object, got {type(py).__name__}"
        extra = set(py) - set(js) - PY_ONLY
        # JSON.stringify drops undefined; the port uses None for the same "no value".
        assert all(py[k] is None for k in extra), f"{path}: unexpected keys {sorted(extra)}"
        for k, v in js.items():
            assert k in py, f"{path}.{k}: missing"
            assert_same(v, py[k], f"{path}.{k}")
    elif isinstance(js, list):
        assert isinstance(py, list) and len(py) == len(js), f"{path}: length {len(js)} vs {len(py) if isinstance(py, list) else py}"
        for i, (a, b) in enumerate(zip(js, py)):
            assert_same(a, b, f"{path}[{i}]")
    elif isinstance(js, float) or isinstance(py, float):
        assert isinstance(py, (int, float)) and not isinstance(py, bool), f"{path}: {js!r} vs {py!r}"
        assert math.isclose(js, py, rel_tol=1e-9, abs_tol=1e-12), f"{path}: {js!r} vs {py!r}"
    else:
        assert js == py, f"{path}: {js!r} vs {py!r}"


@pytest.mark.parametrize("case", GOLDEN["cases"], ids=[c["name"] for c in GOLDEN["cases"]])
def test_python_engine_matches_javascript(case):
    inp = case["input"]
    labels = {k.lower(): v for k, v in inp["labels"].items()}
    out = assess_from_data(
        address=inp["address"], txs=inp["txs"], edges=inp["edges"], as_of=inp["asOf"], mode=inp["mode"],
        labels=lambda a: labels.get(a.lower()),
    )
    js = case["output"]
    # The headline numbers first, for a readable failure.
    assert (out["score"], out["tier"], out["floor"]) == (js["score"], js["tier"], js["floor"])
    assert [(f["id"], f["points"]) for f in out["factors"]] == [(f["id"], f["points"]) for f in js["factors"]]
    assert_same(js, out)


def test_golden_cases_cover_every_tier_and_factor():
    tiers = {c["output"]["tier"] for c in GOLDEN["cases"]}
    factors = {f["id"] for c in GOLDEN["cases"] for f in c["output"]["factors"]}
    assert tiers == {"low", "mod", "high", "crit"}
    assert factors >= {"sanctions", "mixer", "scam", "behaviour", "counterparties", "crossChain", "newWallet"}


def test_rule_set_1_is_the_prototype_config():
    assert RULESET_V1.as_dict() == GOLDEN["engine"]


def test_classifier_matches_scikit_learn():
    fx = json.loads((FIXTURES / "parity-fixture.json").read_text(encoding="utf-8"))
    model = load_model()
    for row, expected in zip(fx["rows"], fx["probabilities"]):
        p = predict_illicit(dict(zip(fx["features"], row)), model)["probability"]
        assert abs(p - expected) < 1e-6


def test_backend_model_artefact_is_the_trained_one():
    """The backend copy must not drift from the model the ML pipeline produced."""
    src = REPO / "src" / "engine" / "models" / "illicit-classifier.json"
    if not src.exists():
        pytest.skip("frontend sources not present")
    assert hashlib.sha256(src.read_bytes()).hexdigest() == load_model(DEFAULT_MODEL).sha256


def test_engine_is_deterministic():
    case = GOLDEN["cases"][0]["input"]
    labels = {k.lower(): v for k, v in case["labels"].items()}
    kw = dict(address=case["address"], txs=case["txs"], edges=case["edges"], as_of=case["asOf"], mode="live",
              labels=lambda a: labels.get(a.lower()))
    assert json.dumps(assess_from_data(**kw), sort_keys=True) == json.dumps(assess_from_data(**kw), sort_keys=True)


def test_js_compat_helpers():
    assert [js_round(x) for x in (0.5, 1.5, 2.5, -0.5, -1.5)] == [1, 2, 3, 0, -1]
    assert to_fixed(0.125, 2) == "0.13" and format(0.125, ".2f") == "0.12"  # the trap this helper avoids
    assert to_fixed(2.5, 0) == "3" and to_fixed(1.005, 2) == "1.00"  # 1.005 is really 1.00499... in binary
    assert js_str(35.0) == "35" and js_str(17.5) == "17.5" and js_str(0.25) == "0.25"
    xs = [0.1] * 10 + [1e16, 1.0, -1e16]
    plain = 0.0
    for x in xs:
        plain += x
    assert js_sum(xs) == plain
    assert parse_ms("2026-11-02T09:41:00Z") == parse_ms("2026-11-02T09:41:00.000Z") == 1793612460000
    assert to_iso(1793612460000) == "2026-11-02T09:41:00.000Z"
    assert parse_ms("2026-01-01") == parse_ms("2026-01-01T00:00:00Z")
