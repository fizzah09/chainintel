"""
Train the illicit-probability classifier and export it for the in-browser engine.

Output
  src/engine/models/illicit-classifier.json   trees + metadata, read by src/engine/classifier.js
  src/engine/models/parity-fixture.json       sample rows + sklearn probabilities (JS must match)
  ml/reports/classifier-metrics.json          evaluation on a held-out test set
"""
import json
import math
from datetime import date

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (average_precision_score, brier_score_loss, confusion_matrix,
                             f1_score, precision_score, recall_score, roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from config import DATASET_FILE, ENGINE_MODELS, FEATURE_LABELS, FEATURES, REPORTS, SEED

PARAMS = dict(n_estimators=200, max_depth=3, learning_rate=0.1, subsample=0.8, random_state=SEED)


def load():
    df = pd.read_csv(DATASET_FILE)
    df = df.drop_duplicates(subset="Address")
    X = df[list(FEATURES.values())].apply(pd.to_numeric, errors="coerce").fillna(0.0)
    X.columns = list(FEATURES.keys())
    y = df["FLAG"].astype(int).to_numpy()
    return X, y


def export_tree(est):
    t = est.tree_
    return {
        "left": t.children_left.tolist(),
        "right": t.children_right.tolist(),
        "feature": t.feature.tolist(),
        "threshold": [round(float(v), 9) for v in t.threshold],
        "value": [round(float(v), 9) for v in t.value[:, 0, 0]],
    }


def metrics_at(y, p, thr):
    yp = (p >= thr).astype(int)
    tn, fp, fn, tp = confusion_matrix(y, yp).ravel()
    return {"threshold": thr, "precision": round(precision_score(y, yp), 4), "recall": round(recall_score(y, yp), 4),
            "f1": round(f1_score(y, yp), 4), "confusion": {"tp": int(tp), "fp": int(fp), "tn": int(tn), "fn": int(fn)}}


def main():
    X, y = load()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)

    model = GradientBoostingClassifier(**PARAMS).fit(X_tr, y_tr)
    p = model.predict_proba(X_te)[:, 1]

    baseline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000)).fit(X_tr, y_tr)
    pb = baseline.predict_proba(X_te)[:, 1]

    cv = cross_val_score(GradientBoostingClassifier(**PARAMS), X, y, cv=StratifiedKFold(5, shuffle=True, random_state=SEED), scoring="roc_auc")

    # threshold that maximises F1 on the test set, reported alongside 0.5
    grid = np.linspace(0.05, 0.95, 91)
    best = max(grid, key=lambda t: f1_score(y_te, (p >= t).astype(int)))

    prior = y_tr.mean()
    init = math.log(prior / (1 - prior))
    trees = [export_tree(e[0]) for e in model.estimators_]

    # parity check: re-implement prediction exactly as the JS engine does
    def js_like(row):
        raw = init
        for tr in trees:
            n = 0
            while tr["left"][n] != -1:
                n = tr["left"][n] if row[tr["feature"][n]] <= tr["threshold"][n] else tr["right"][n]
            raw += PARAMS["learning_rate"] * tr["value"][n]
        return 1 / (1 + math.exp(-raw))
    sample = X_te.iloc[:60]
    mine = np.array([js_like(r) for r in sample.to_numpy()])
    sk = model.predict_proba(sample)[:, 1]
    max_diff = float(np.max(np.abs(mine - sk)))
    assert max_diff < 1e-6, f"export does not reproduce sklearn (max diff {max_diff})"

    importance = sorted(zip(FEATURES.keys(), model.feature_importances_), key=lambda x: -x[1])
    report = {
        "trained": date.today().isoformat(),
        "dataset": {"rows": int(len(y)), "positives": int(y.sum()), "negatives": int((y == 0).sum()), "test_rows": int(len(y_te))},
        "model": {"type": "GradientBoostingClassifier", **{k: v for k, v in PARAMS.items()}},
        "test": {
            "roc_auc": round(roc_auc_score(y_te, p), 4),
            "pr_auc": round(average_precision_score(y_te, p), 4),
            "brier": round(brier_score_loss(y_te, p), 4),
            "at_0_5": metrics_at(y_te, p, 0.5),
            "best_f1": metrics_at(y_te, p, round(float(best), 2)),
        },
        "cv_roc_auc": {"mean": round(float(cv.mean()), 4), "std": round(float(cv.std()), 4), "folds": 5},
        "baseline_logistic_regression": {"roc_auc": round(roc_auc_score(y_te, pb), 4), "pr_auc": round(average_precision_score(y_te, pb), 4)},
        "feature_importance": [{"feature": f, "label": FEATURE_LABELS[f], "importance": round(float(v), 4)} for f, v in importance],
        "export_parity_max_abs_diff": max_diff,
    }

    ENGINE_MODELS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(exist_ok=True)
    artifact = {
        "name": "illicit-classifier",
        "version": f"gbm-{date.today().isoformat()}",
        "features": list(FEATURES.keys()),
        "featureLabels": FEATURE_LABELS,
        "featureMedians": {"illicit": X[y == 1].median().round(6).to_dict(), "licit": X[y == 0].median().round(6).to_dict()},
        "init": init,
        "learningRate": PARAMS["learning_rate"],
        "trees": trees,
        "metrics": {k: report["test"][k] for k in ("roc_auc", "pr_auc", "brier")} | {"cv_roc_auc": report["cv_roc_auc"]["mean"], "rows": report["dataset"]["rows"]},
        "notes": "Trained on public labelled Ethereum accounts (fraud/scam vs normal). Probability is a model estimate, not a legal finding.",
    }
    json.dump(artifact, open(ENGINE_MODELS / "illicit-classifier.json", "w"), separators=(",", ":"))
    json.dump({"features": list(FEATURES.keys()), "rows": sample.to_numpy().round(9).tolist(), "probabilities": sk.round(9).tolist()},
              open(ENGINE_MODELS / "parity-fixture.json", "w"), separators=(",", ":"))
    json.dump(report, open(REPORTS / "classifier-metrics.json", "w"), indent=2)
    print(json.dumps(report["test"], indent=2))
    print("cv auc", report["cv_roc_auc"], "baseline", report["baseline_logistic_regression"])


if __name__ == "__main__":
    main()
