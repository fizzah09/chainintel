"""Model drift: has the population the model scores moved away from what it saw before?

Population Stability Index (PSI) per input feature and for the model's output, comparing the last
window of assessments with the window before it (default 30 days each). Conventional reading:
< 0.10 stable, 0.10-0.25 moderate shift, > 0.25 significant shift (review the model).
Run monthly (M7 schedules it); the result is evidence for the model owner and validator.

Sampling noise alone gives an expected PSI of about (bins - 1) * (1/n_ref + 1/n_cur). With 40 wallets
per window and 10 bins that is ~0.45, a false "significant". So bins scale with the smaller sample
(one bin per 50 assessments, 2 to 10 bins) and a window needs at least 100 assessments.
"""

import math
from bisect import bisect_left
from datetime import datetime, timedelta

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.m4_risk.engine.features import FEATURE_KEYS
from app.modules.m4_risk.models import RiskAssessment

STABLE, MODERATE = 0.10, 0.25


def psi(reference: list[float], current: list[float], bins: int = 10, eps: float = 1e-4) -> float:
    """Bins are reference quantiles, so each reference bin holds about the same share."""
    if not reference or not current:
        return 0.0
    ref = sorted(reference)
    edges = sorted({ref[min(len(ref) - 1, (i * len(ref)) // bins)] for i in range(1, bins)}) or [ref[0]]
    n_bins = len(edges) + 1

    def shares(xs: list[float]) -> list[float]:
        counts = [0] * n_bins
        for x in xs:
            counts[bisect_left(edges, x)] += 1  # bin i holds values up to and including edges[i]
        return [max(c / len(xs), eps) for c in counts]

    r, c = shares(reference), shares(current)
    return sum((ci - ri) * math.log(ci / ri) for ri, ci in zip(r, c))


def level(value: float) -> str:
    return "stable" if value < STABLE else "moderate" if value < MODERATE else "significant"


class DriftItem(BaseModel):
    name: str
    psi: float
    level: str


class DriftReport(BaseModel):
    model_sha256: str
    reference_window: tuple[datetime, datetime]
    current_window: tuple[datetime, datetime]
    reference_count: int
    current_count: int
    status: str  # stable | moderate | significant | insufficient data
    action: str
    items: list[DriftItem]


def drift_report(
    db: Session, tenant_id: str, model_sha256: str, now: datetime, window_days: int = 30, min_samples: int = 100
) -> DriftReport:
    cur_from = now - timedelta(days=window_days)
    ref_from = cur_from - timedelta(days=window_days)

    def window(start: datetime, end: datetime) -> list[tuple[float, dict]]:
        rows = db.execute(
            select(RiskAssessment.ml_probability, RiskAssessment.report["features"]).where(
                RiskAssessment.tenant_id == tenant_id,
                RiskAssessment.model_sha256 == model_sha256,
                RiskAssessment.trigger != "reproduction",  # re-runs would count a wallet twice
                RiskAssessment.created_at >= start,
                RiskAssessment.created_at < end,
            )
        )
        return [(float(p), f or {}) for p, f in rows]

    ref, cur = window(ref_from, cur_from), window(cur_from, now)
    base = dict(
        model_sha256=model_sha256, reference_window=(ref_from, cur_from), current_window=(cur_from, now),
        reference_count=len(ref), current_count=len(cur),
    )
    if len(ref) < min_samples or len(cur) < min_samples:
        return DriftReport(**base, status="insufficient data", items=[],
                           action=f"Need at least {min_samples} assessments in each {window_days}-day window.")

    bins = max(2, min(10, min(len(ref), len(cur)) // 50))
    items = [DriftItem(name="model probability", psi=(v := psi([p for p, _ in ref], [p for p, _ in cur], bins)), level=level(v))]
    for k in FEATURE_KEYS:
        v = psi([float(f.get(k) or 0) for _, f in ref], [float(f.get(k) or 0) for _, f in cur], bins)
        items.append(DriftItem(name=k, psi=v, level=level(v)))
    items.sort(key=lambda i: -i.psi)
    worst = items[0].level
    action = {
        "stable": "No action.",
        "moderate": "Watch: compare the shifted features with recent case outcomes at the next review.",
        "significant": "Review the model: re-validate on recent reviewed cases; retrain through the registry if performance dropped.",
    }[worst]
    return DriftReport(**base, status=worst, action=action, items=items)
