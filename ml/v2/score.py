"""Score one address with the trained model, or abstain when history is too thin.

Usage:  python score.py 0xYourAddress

The probability is calibrated on held-out data. It is a triage signal for an analyst,
not a verdict, and it is never shown when the wallet has fewer than MIN_TX transactions.
"""
import sys

import joblib
import numpy as np

from blockscout import fetch_transactions
from config import MODELS
from features import compute


def load_model():
    return joblib.load(MODELS / "risk_model.joblib")


def score_features(bundle: dict, feats: dict | None) -> dict:
    if feats is None:
        return {"probability": None, "abstained": True, "reason": "Too little transaction history to score."}
    x = np.array([[feats[k] for k in bundle["features"]]], dtype=float)
    p = float(bundle["model"].predict_proba(x)[0, 1])
    return {"probability": round(p, 4), "abstained": False, "model": bundle["name"]}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("usage: python score.py 0xADDRESS")
    addr = sys.argv[1]
    print(score_features(load_model(), compute(addr, fetch_transactions(addr))))
