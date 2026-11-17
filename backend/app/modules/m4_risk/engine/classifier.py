"""Illicit-probability model (port of src/engine/classifier.js).

The model is a gradient-boosted tree ensemble trained by ml/train_classifier.py and exported as JSON.
Prediction follows scikit-learn exactly (x <= threshold goes left). Per-feature contributions use the
tree-path method, so init + sum(contributions) = log-odds of the prediction.
"""

import hashlib
import json
import math
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

ARTIFACTS = Path(__file__).resolve().parents[1] / "artifacts"
DEFAULT_MODEL = ARTIFACTS / "illicit-classifier.json"


@dataclass(frozen=True)
class Model:
    data: dict
    sha256: str  # fingerprint of the exact artefact file, stored with every assessment

    @property
    def version(self) -> str:
        return self.data["version"]


@lru_cache
def load_model(path: Path = DEFAULT_MODEL) -> Model:
    raw = Path(path).read_bytes()
    return Model(data=json.loads(raw), sha256=hashlib.sha256(raw).hexdigest())


def model_by_sha(sha256: str) -> Model | None:
    """The artefact with this exact fingerprint, if this build ships it (needed to re-run old scores)."""
    for path in sorted(ARTIFACTS.glob("*.json")):
        m = load_model(path)
        if m.sha256 == sha256:
            return m
    return None


def _num(v) -> float:
    """Number(v) || 0"""
    try:
        x = float(v)
    except (TypeError, ValueError):
        return 0
    return 0 if math.isnan(x) or x == 0 else x


def predict_illicit(features: dict, model: Model) -> dict:
    M = model.data
    feats = M["features"]
    lr = M["learningRate"]
    x = [_num(features.get(f)) for f in feats]
    contrib = [0.0] * len(x)
    raw = M["init"]
    for t in M["trees"]:
        left, right, feature, threshold, value = t["left"], t["right"], t["feature"], t["threshold"], t["value"]
        n = 0
        raw += lr * value[0]
        while left[n] != -1:
            f = feature[n]
            nxt = left[n] if x[f] <= threshold[n] else right[n]
            contrib[f] += lr * (value[nxt] - value[n])
            raw += lr * (value[nxt] - value[n])
            n = nxt
    probability = 1 / (1 + math.exp(-raw))
    med = M["featureMedians"]
    reasons = [
        {
            "feature": f, "label": M["featureLabels"][f], "value": x[i], "impact": contrib[i],
            "typicalIllicit": med["illicit"][f], "typicalLicit": med["licit"][f],
        }
        for i, f in enumerate(feats)
        if abs(contrib[i]) > 0.01
    ]
    reasons.sort(key=lambda r: -abs(r["impact"]))
    band = "High" if probability >= 0.7 else "Elevated" if probability >= 0.4 else "Low" if probability >= 0.15 else "Very low"
    return {
        "probability": probability,
        "logOdds": raw,
        "band": band,
        "reasons": reasons,
        "model": {"version": M["version"], "rocAuc": M["metrics"]["roc_auc"], "trainedRows": M["metrics"]["rows"]},
    }
