import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODEL = ROOT / "src" / "engine" / "models" / "illicit-classifier.json"
METRICS = ROOT / "ml" / "reports" / "classifier-metrics.json"
LABELS = ROOT / "src" / "engine" / "data" / "labels.json"


def test_model_exported_with_expected_features():
    m = json.loads(MODEL.read_text())
    from config import FEATURES
    assert m["features"] == list(FEATURES.keys())
    assert len(m["trees"]) == 200


def test_model_beats_baseline_and_chance():
    r = json.loads(METRICS.read_text())
    assert r["test"]["roc_auc"] > 0.9
    assert r["test"]["roc_auc"] >= r["baseline_logistic_regression"]["roc_auc"]
    assert r["export_parity_max_abs_diff"] < 1e-6


def test_labels_have_sanctions_and_scams():
    labels = json.loads(LABELS.read_text())["labels"]
    cats = {v["cat"] for v in labels.values()}
    assert {"sanctions", "scam"} <= cats
    assert all(k == k.lower() and len(k) == 42 for k in labels)
