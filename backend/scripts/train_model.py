#!/usr/bin/env python
"""Train the illicit-wallet classifier and export it in the JSON format the engine reads.

Usage (from backend/):
    python scripts/train_model.py [--out artifacts/illicit-classifier-v2.json] [--register]

What it does:
1.  Joins ReviewedCase outcomes with the latest FeatureSnapshot for each wallet.
2.  Trains a GradientBoostingClassifier (sklearn).
3.  Exports the trained forest to the custom JSON format in engine/classifier.py.
4.  Optionally registers it via the API so governance can approve it.

Minimum data: 20 labelled cases per class (illicit / legitimate).  Below this threshold
the script exits early to avoid a meaningless model.
"""

import argparse
import hashlib
import json
import math
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# ---- path setup -------------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import numpy as np
from sqlalchemy import select

from app.core.config import get_settings
from app.core.db import _session_factory
from app.modules.m3_data.providers.base import normalize_address
from app.modules.m4_risk.engine.features import FEATURE_KEYS
from app.modules.m4_risk.models import FeatureSnapshot, ReviewedCase  # noqa: E402

ARTIFACTS = ROOT / "app" / "modules" / "m4_risk" / "artifacts"
MIN_PER_CLASS = 20


# ---- data loading -----------------------------------------------------------------------------

def load_dataset(db) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Return (X, y, addresses) for all cases that have a feature snapshot."""
    cases = db.scalars(select(ReviewedCase)).all()
    if not cases:
        print("No reviewed cases found.  Import some first via POST /api/v1/reviewed-cases")
        sys.exit(1)

    rows_X, rows_y, addrs = [], [], []
    missing = 0

    for c in cases:
        addr = normalize_address(c.address)
        # Latest snapshot at or before the case decision time
        snap = db.scalar(
            select(FeatureSnapshot)
            .where(FeatureSnapshot.address == addr, FeatureSnapshot.chain_id == c.chain_id,
                   FeatureSnapshot.as_of <= c.decided_at)
            .order_by(FeatureSnapshot.id.desc())
            .limit(1)
        )
        if snap is None:
            missing += 1
            continue
        vec = [float(snap.features.get(k, 0) or 0) for k in FEATURE_KEYS]
        rows_X.append(vec)
        rows_y.append(1 if c.outcome == "illicit" else 0)
        addrs.append(addr)

    if missing:
        print(f"Skipped {missing} cases with no feature snapshot (run POST /features first)")

    X = np.array(rows_X, dtype=np.float64)
    y = np.array(rows_y, dtype=np.int32)
    return X, y, addrs


# ---- model training ---------------------------------------------------------------------------

def train(X: np.ndarray, y: np.ndarray) -> Any:
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.model_selection import cross_val_score

    clf = GradientBoostingClassifier(
        n_estimators=100, max_depth=4, learning_rate=0.1,
        subsample=0.8, min_samples_leaf=5, random_state=42,
    )
    # Quick cross-validation for the metrics block
    cv_auc = cross_val_score(clf, X, y, cv=5, scoring="roc_auc")
    clf.fit(X, y)
    return clf, {"roc_auc": float(cv_auc.mean()), "roc_auc_std": float(cv_auc.std()),
                 "rows": int(len(y)), "illicit": int(y.sum()), "legitimate": int((y == 0).sum())}


# ---- JSON export (must match engine/classifier.py format) ------------------------------------

def _export_tree(sk_tree) -> dict:
    """Convert one sklearn DecisionTreeRegressor to the flat-array format the engine reads."""
    t = sk_tree.tree_
    n = t.node_count
    left   = [int(t.children_left[i])  for i in range(n)]
    right  = [int(t.children_right[i]) for i in range(n)]
    feat   = [int(t.feature[i]) if t.children_left[i] != -1 else -1 for i in range(n)]
    thresh = [float(t.threshold[i]) for i in range(n)]
    value  = [float(t.value[i][0][0]) for i in range(n)]
    return {"left": left, "right": right, "feature": feat, "threshold": thresh, "value": value}


def to_json(clf, metrics: dict, X: np.ndarray, y: np.ndarray, version: str) -> dict:
    """Serialise the fitted GradientBoostingClassifier to our custom JSON format."""
    # Base prediction (log-odds of the prior)
    p = float(y.mean())
    init = math.log(p / (1 - p)) if 0 < p < 1 else 0.0

    trees = []
    for stage in clf.estimators_:          # shape (n_estimators, 1) for binary
        trees.append(_export_tree(stage[0]))

    # Feature medians per class (used for the "typical illicit / licit" display in UI)
    ill = X[y == 1]
    leg = X[y == 0]
    feature_medians = {
        "illicit": {k: float(np.median(ill[:, i])) if len(ill) else 0.0 for i, k in enumerate(FEATURE_KEYS)},
        "licit":   {k: float(np.median(leg[:, i])) if len(leg) else 0.0 for i, k in enumerate(FEATURE_KEYS)},
    }

    # Feature labels (human-readable, same as DESCRIPTIONS in feature_store.py)
    from app.modules.m4_risk.feature_store import DESCRIPTIONS
    feature_labels = {k: DESCRIPTIONS.get(k, k) for k in FEATURE_KEYS}

    return {
        "version": version,
        "trainedAt": datetime.now(UTC).isoformat(),
        "learningRate": float(clf.learning_rate),
        "init": init,
        "features": list(FEATURE_KEYS),
        "featureLabels": feature_labels,
        "featureMedians": feature_medians,
        "trees": trees,
        "metrics": metrics,
    }


# ---- main -------------------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(description="Train and export the illicit-wallet classifier")
    ap.add_argument("--out", default=None, help="Output JSON path (default: artifacts/illicit-classifier-<date>.json)")
    ap.add_argument("--register", action="store_true", help="Register the model via the API after export")
    ap.add_argument("--api", default="http://127.0.0.1:8002", help="API base URL for --register")
    args = ap.parse_args()

    version = datetime.now(UTC).strftime("v%Y%m%d")
    out_path = Path(args.out) if args.out else ARTIFACTS / f"illicit-classifier-{version}.json"

    print("Loading dataset…")
    with _session_factory()() as db:
        X, y, addrs = load_dataset(db)

    print(f"Dataset: {len(y)} rows  (illicit={y.sum()}, legitimate={(y==0).sum()})")

    illicit_count = int(y.sum())
    licit_count   = int((y == 0).sum())
    if illicit_count < MIN_PER_CLASS or licit_count < MIN_PER_CLASS:
        print(f"Need at least {MIN_PER_CLASS} per class — have illicit={illicit_count}, licit={licit_count}.")
        print("Import more reviewed cases and build feature snapshots, then retry.")
        sys.exit(1)

    print("Training…")
    clf, metrics = train(X, y)
    print(f"CV ROC-AUC: {metrics['roc_auc']:.4f} ± {metrics['roc_auc_std']:.4f}")

    model_dict = to_json(clf, metrics, X, y, version)
    raw = json.dumps(model_dict, indent=2).encode()
    sha = hashlib.sha256(raw).hexdigest()

    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(raw)
    print(f"Saved → {out_path}  (sha256={sha[:16]}…)")

    if args.register:
        import httpx
        payload = {
            "name": "illicit-classifier",
            "version": version,
            "sha256": sha,
            "trained_by": "scripts/train_model.py",
            "trained_at": datetime.now(UTC).isoformat(),
            "training_data": {
                "rows": metrics["rows"],
                "illicit": metrics["illicit"],
                "legitimate": metrics["legitimate"],
                "features": list(FEATURE_KEYS),
            },
            "metrics": {"roc_auc": metrics["roc_auc"]},
            "notes": f"Trained from {len(addrs)} reviewed cases. {version}",
        }
        r = httpx.post(f"{args.api}/api/v1/models",
                       json=payload, headers={"X-Dev-User": "train_script", "X-Dev-Roles": "model_owner"})
        if r.status_code == 201:
            print(f"Registered model id={r.json()['id']} status=registered")
            print("Next: validate → approve via POST /api/v1/models/{id}/validate then /approve")
        else:
            print(f"Registration failed: {r.status_code} {r.text}")


if __name__ == "__main__":
    main()
