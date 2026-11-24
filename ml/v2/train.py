"""Step 3: train and evaluate the model on data/dataset.csv.

Usage:  python train.py

Writes:
  models/risk_model.joblib   calibrated model + feature list (used by score.py)
  reports/metrics.json       test-set metrics and the limits of this run
"""
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from config import DATASET, MODELS, REPORTS
from features import FEATURE_NAMES

SEED = 42


def precision_recall_at_budget(y, p, budget: float) -> dict:
    """Review the top `budget` share of scores: how many flagged accounts are truly risky?"""
    k = max(1, int(round(len(p) * budget)))
    top = np.argsort(-p)[:k]
    tp = int(y[top].sum())
    return {"reviewed": k, "precision": tp / k, "recall": tp / max(1, int(y.sum()))}


def recall_at_fpr(y, p, max_fpr: float) -> float:
    neg = p[y == 0]
    if len(neg) == 0:
        return float("nan")
    thr = np.quantile(neg, 1 - max_fpr)          # threshold that allows max_fpr false alarms
    pos = p[y == 1]
    return float((pos > thr).mean()) if len(pos) else float("nan")


def evaluate(name, y, p) -> dict:
    return {
        "model": name,
        "roc_auc": roc_auc_score(y, p),
        "pr_auc": average_precision_score(y, p),
        "brier": brier_score_loss(y, p),
        "top10pct_review": precision_recall_at_budget(y, p, 0.10),
        "recall_at_5pct_false_alarms": recall_at_fpr(y, p, 0.05),
    }


def main() -> None:
    df = pd.read_csv(DATASET)
    total = len(df)
    df = df[df["abstained"] == 0].reset_index(drop=True)
    if df["label"].nunique() < 2:
        raise SystemExit("Need both classes with usable history. Run build_dataset.py first.")

    X = df[FEATURE_NAMES].astype(float).values
    y = df["label"].astype(int).values
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=SEED)

    baseline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, class_weight="balanced"))
    gbm = HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05, max_iter=300,
                                         class_weight="balanced", random_state=SEED)

    # Calibrate on training data only, so the test scores are honest probabilities.
    base_cal = CalibratedClassifierCV(baseline, method="sigmoid", cv=5).fit(X_tr, y_tr)
    gbm_cal = CalibratedClassifierCV(gbm, method="sigmoid", cv=5).fit(X_tr, y_tr)

    report = {
        "rows_total": total,
        "rows_used": int(len(df)),
        "rows_abstained": int(total - len(df)),
        "positives_used": int(y.sum()),
        "negatives_used": int((y == 0).sum()),
        "test_rows": int(len(y_te)),
        "features": FEATURE_NAMES,
        "results": [
            evaluate("logistic_regression", y_te, base_cal.predict_proba(X_te)[:, 1]),
            evaluate("gradient_boosting", y_te, gbm_cal.predict_proba(X_te)[:, 1]),
        ],
        "limits": [
            "Random split: not a time-based split, so future leakage is possible.",
            "Labels are public lists (Forta, Etherscan tags); they are noisy and not a sample of all accounts.",
            "Positives and negatives come from different sources, so the model may learn the source, not behaviour.",
            "Small sample: check the confidence intervals before trusting any single number.",
        ],
    }

    # Pick the model with the higher PR AUC on the test set (the metric that matters with rare fraud).
    best_name, best = max(
        [("logistic_regression", base_cal), ("gradient_boosting", gbm_cal)],
        key=lambda t: average_precision_score(y_te, t[1].predict_proba(X_te)[:, 1]),
    )
    report["selected_model"] = best_name

    MODELS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": best, "features": FEATURE_NAMES, "name": best_name}, MODELS / "risk_model.joblib")
    (REPORTS / "metrics.json").write_text(json.dumps(report, indent=2), encoding="utf-8")

    for r in report["results"]:
        print(f"{r['model']:22s} ROC AUC {r['roc_auc']:.3f}  PR AUC {r['pr_auc']:.3f}  "
              f"Brier {r['brier']:.3f}  recall@5%FP {r['recall_at_5pct_false_alarms']:.3f}")
    print("selected:", best_name, "-> models/risk_model.joblib, reports/metrics.json")


if __name__ == "__main__":
    main()
