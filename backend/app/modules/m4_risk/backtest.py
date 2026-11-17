"""Back-testing: how well does a rule set (and the model) separate wallets analysts found illicit from
those they cleared? Required before go-live and before any rule-set change.

Each case is scored with stored data only, by default as known at the moment the analyst decided
(point in time: no hindsight). `point_in_time=False` scores with today's data instead, which suits
labelled lists imported after the fact. Cases with no stored data are excluded and counted.

Reported per tier cut-off: precision (of wallets flagged, how many were illicit), recall (of illicit
wallets, how many were flagged), F1 and the confusion counts; recall per illicit category; rank
quality (ROC AUC) of the rule score and of the model; and how often rules and model disagree.
"""

import hashlib
import json
from collections import Counter, defaultdict
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m3_data.prices.service import PriceService
from app.modules.m3_data.providers.base import normalize_address
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.engine import assess_from_data
from app.modules.m4_risk.engine.classifier import Model
from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.inputs import load_inputs
from app.modules.m4_risk.models import BacktestRun, ReviewedCase

MIN_PER_CLASS = 20


def _now() -> datetime:
    return datetime.now(UTC)


class CaseIn(BaseModel):
    chain_id: int
    address: str
    decided_at: datetime
    outcome: Literal["illicit", "legitimate"]
    category: str | None = None
    reference: str | None = None


def import_cases(db: Session, actor: Principal, cases: list[CaseIn], source: str = "import", clock: Callable[[], datetime] = _now) -> dict:
    """Add reviewed cases; an identical decision (same wallet and time) is skipped."""
    now = clock()
    rows = [
        dict(tenant_id=actor.tenant_id, chain_id=c.chain_id, address=normalize_address(c.address), decided_at=c.decided_at,
             outcome=c.outcome, category=c.category, reference=c.reference, source=source, imported_by=actor.user_id, created_at=now)
        for c in cases
    ]
    added = 0
    for i in range(0, len(rows), 1000):
        stmt = pg_insert(ReviewedCase).values(rows[i : i + 1000]).on_conflict_do_nothing(
            index_elements=["tenant_id", "chain_id", "address", "decided_at"]
        ).returning(ReviewedCase.id)
        added += len(db.execute(stmt).all())
    db.commit()
    return {"added": added, "skipped": len(rows) - added}


def roc_auc(pos: list[float], neg: list[float]) -> float | None:
    """Probability that a random illicit wallet ranks above a random legitimate one (ties count half)."""
    if not pos or not neg:
        return None
    ranked = sorted([(v, 1) for v in pos] + [(v, 0) for v in neg])
    rank_sum, i = 0.0, 0
    while i < len(ranked):
        j = i
        while j < len(ranked) and ranked[j][0] == ranked[i][0]:
            j += 1
        avg_rank = (i + 1 + j) / 2
        rank_sum += avg_rank * sum(1 for k in range(i, j) if ranked[k][1])
        i = j
    n_pos, n_neg = len(pos), len(neg)
    return round((rank_sum - n_pos * (n_pos + 1) / 2) / (n_pos * n_neg), 4)


def _cutoff(rows: list[dict], key: str, threshold: float) -> dict:
    tp = sum(1 for r in rows if r[key] >= threshold and r["outcome"] == "illicit")
    fp = sum(1 for r in rows if r[key] >= threshold and r["outcome"] == "legitimate")
    fn = sum(1 for r in rows if r[key] < threshold and r["outcome"] == "illicit")
    tn = sum(1 for r in rows if r[key] < threshold and r["outcome"] == "legitimate")
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = 2 * precision * recall / (precision + recall) if precision and recall else None
    rnd = lambda x: None if x is None else round(x, 4)  # noqa: E731
    return {"threshold": threshold, "tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": rnd(precision), "recall": rnd(recall), "f1": rnd(f1), "flagged": tp + fp}


def summarise(rows: list[dict], rules: RuleSet, excluded: int) -> dict:
    t = rules.tiers
    pos = [r for r in rows if r["outcome"] == "illicit"]
    neg = [r for r in rows if r["outcome"] == "legitimate"]
    tiers: dict[str, Counter] = defaultdict(Counter)
    for r in rows:
        tiers[r["tier"]][r["outcome"]] += 1
    by_cat: dict[str, list[dict]] = defaultdict(list)
    for r in pos:
        by_cat[r["category"] or "unspecified"].append(r)
    warnings = []
    if len(pos) < MIN_PER_CLASS or len(neg) < MIN_PER_CLASS:
        warnings.append(f"Fewer than {MIN_PER_CLASS} cases in a class ({len(pos)} illicit, {len(neg)} legitimate): figures are not reliable.")
    if excluded:
        warnings.append(f"{excluded} case(s) had no stored data at their scoring time and were excluded.")
    return {
        "evaluated": len(rows), "illicit": len(pos), "legitimate": len(neg), "excludedNoData": excluded,
        "rules": {
            "moderateOrAbove": _cutoff(rows, "score", t[0]),
            "highOrAbove": _cutoff(rows, "score", t[1]),
            "critical": _cutoff(rows, "score", t[2]),
            "rocAuc": roc_auc([r["score"] for r in pos], [r["score"] for r in neg]),
        },
        "model": {
            "atHalf": _cutoff(rows, "probability", 0.5),
            "rocAuc": roc_auc([r["probability"] for r in pos], [r["probability"] for r in neg]),
        },
        "tierDistribution": {k: dict(v) for k, v in sorted(tiers.items())},
        "byCategory": {
            c: {"cases": len(rs), "recallHighOrAbove": round(sum(r["score"] >= t[1] for r in rs) / len(rs), 4),
                "meanScore": round(sum(r["score"] for r in rs) / len(rs), 1)}
            for c, rs in sorted(by_cat.items())
        },
        "disagreementRate": round(sum((r["score"] >= t[1]) != (r["probability"] >= 0.5) for r in rows) / len(rows), 4) if rows else None,
        "warnings": warnings,
    }


def run_backtest(
    db: Session, settings: Settings, actor: Principal, rules: RuleSet, model: Model, *,
    point_in_time: bool = True, clock: Callable[[], datetime] = _now,
) -> BacktestRun:
    # Latest decision per wallet.
    latest: dict[tuple[int, str], ReviewedCase] = {}
    for c in db.scalars(select(ReviewedCase).where(ReviewedCase.tenant_id == actor.tenant_id).order_by(ReviewedCase.decided_at)):
        latest[(c.chain_id, c.address)] = c
    cases = sorted(latest.values(), key=lambda c: c.id)

    rows, excluded = [], 0
    for c in cases:
        as_of = c.decided_at if point_in_time else None
        prices = PriceService(db, ProviderRouter([]), settings, as_of=as_of, allow_fetch=False)
        inp = load_inputs(db, c.address, c.chain_id, rules=rules, settings=settings, prices=prices, as_of=as_of)
        if not inp.txs and c.address not in inp.labels:
            excluded += 1
            continue
        rep = assess_from_data(address=inp.address, txs=inp.txs, edges=inp.edges, as_of=inp.as_of_iso, mode="live",
                               labels=inp.label_lookup(), rules=rules, model=model, with_forecast=False)
        rows.append({
            "caseId": c.id, "address": c.address, "chainId": c.chain_id, "decidedAt": c.decided_at.isoformat(),
            "outcome": c.outcome, "category": c.category, "score": rep["score"], "tier": rep["tier"],
            "probability": round(rep["ml"]["probability"], 6), "factors": [f["id"] for f in rep["factors"]],
        })

    dataset = hashlib.sha256(json.dumps(sorted((c.id, c.outcome) for c in cases)).encode()).hexdigest()
    metrics = {**summarise(rows, rules, excluded), "pointInTime": point_in_time}
    run = BacktestRun(tenant_id=actor.tenant_id, ruleset_version=rules.version, model_sha256=model.sha256, cases=len(cases),
                      dataset_sha256=dataset, metrics=metrics, per_case=rows, created_by=actor.user_id, created_at=clock())
    db.add(run)
    db.commit()
    return run
