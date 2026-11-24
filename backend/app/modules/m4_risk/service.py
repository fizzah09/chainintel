"""Assess a wallet, store the result permanently, and re-run any stored assessment to prove it.

Assess:
  1. optionally refresh the wallet and its top counterparties through M3,
  2. warm the price store (may fetch missing prices),
  3. freeze the knowledge time, then build inputs from data stored at or before it,
  4. run the engine and append the result, hash-chained, with every version and input id.

Re-run: rebuild the inputs as of the stored knowledge time with the stored rule set and model
(no network, no new prices), run the engine again, and compare hashes. Identical means the
assessment is reproducible from the system of record.
"""

import hashlib
import json
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from decimal import Decimal

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m3_data.prices.coingecko import CoinGecko
from app.modules.m3_data.prices.service import PriceService
from app.modules.m3_data.providers.base import normalize_address
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.engine import RULESETS, assess_from_data
from app.modules.m4_risk.engine.classifier import Model, load_model, model_by_sha
from app.modules.m4_risk.governance import GovernanceError, ModelRegistry
from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.inputs import AssessmentInputs, load_inputs, refresh
from app.modules.m4_risk.models import RiskAssessment
from app.modules.m4_risk.review import review_reasons

GENESIS = "0" * 64
# Context recorded at assessment time that cannot be rebuilt later (live sync state, fetch notes).
# A re-run takes these from the original; they never change the score.
CONTEXT_KEYS = ("stale", "freshness", "priceNotes")


def _now() -> datetime:
    return datetime.now(UTC)


def canonical(obj) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str).encode()


def sha256(obj) -> str:
    return hashlib.sha256(canonical(obj)).hexdigest()


def _iso(dt: datetime) -> str:
    return dt.astimezone(UTC).isoformat()


def chain_payload(row: RiskAssessment) -> dict:
    """The fields the hash chain protects."""
    return {
        "publicId": str(row.public_id), "tenant": row.tenant_id, "chainId": row.chain_id, "address": row.address,
        "asOf": _iso(row.as_of), "createdAt": _iso(row.created_at), "createdBy": row.created_by, "trigger": row.trigger,
        "reproducesId": row.reproduces_id, "ruleset": row.ruleset_version, "modelSha256": row.model_sha256,
        "score": row.score, "tier": row.tier, "inputsSha256": row.inputs_sha256, "reportSha256": row.report_sha256,
        "modelStatus": row.model_status, "reviewRequired": row.review_required, "reviewReasons": row.review_reasons,
    }


def row_hash(prev: str, row: RiskAssessment) -> str:
    return sha256({"prev": prev, "row": chain_payload(row)})


class AssessmentError(Exception):
    pass


class Reproduction(BaseModel):
    original_id: str
    reproduction_id: str
    identical: bool
    inputs_match: bool
    report_match: bool
    score_original: int
    score_rerun: int
    differences: list[str]  # top-level report sections that differ


class ChainCheck(BaseModel):
    ok: bool
    checked: int
    first_bad_id: int | None = None
    reason: str | None = None


class RiskService:
    def __init__(
        self,
        db: Session,
        router: ProviderRouter,
        settings: Settings,
        principal: Principal,
        coingecko: CoinGecko | None = None,
        clock: Callable[[], datetime] = _now,
    ):
        self.db = db
        self.router = router
        self.settings = settings
        self.principal = principal
        self.coingecko = coingecko
        self.clock = clock

    def _prices(self, as_of: datetime | None = None, allow_fetch: bool = True) -> PriceService:
        return PriceService(self.db, self.router, self.settings, self.coingecko, self.clock, as_of=as_of, allow_fetch=allow_fetch)

    # ---- assess -----------------------------------------------------------------------------------

    def assess(
        self, address: str, chain_id: int, *, ruleset_version: int | None = None, refresh_data: bool = True, trigger: str = "manual"
    ) -> RiskAssessment:
        version = ruleset_version or self.settings.default_ruleset
        if version not in RULESETS:
            raise AssessmentError(f"unknown rule set {version}")
        rules = RULESETS[version]
        address = normalize_address(address)
        if refresh_data and self.router.providers:
            refresh(self.db, self.router, self.settings, address, chain_id, rules, self._prices(), clock=self.clock)
        warm = self._prices()
        load_inputs(self.db, address, chain_id, rules=rules, settings=self.settings, prices=warm)  # stores missing prices
        knowledge = self.clock()
        inp = load_inputs(
            self.db, address, chain_id, rules=rules, settings=self.settings,
            prices=self._prices(as_of=knowledge, allow_fetch=False), as_of=knowledge,
        )
        inp.data_quality["priceNotes"] = sorted(set(warm.notes))
        try:
            model, status, model_id = ModelRegistry(self.db, self.settings, self.clock).model_for_assessment()
        except GovernanceError as exc:
            raise AssessmentError(str(exc)) from None
        inp.manifest["modelVersionId"] = model_id
        return self._run_and_store(inp, rules, model, trigger, None, self.settings.risk_neighbours, status)

    # ---- re-run -----------------------------------------------------------------------------------

    def get(self, public_id) -> RiskAssessment:
        row = self.db.scalar(
            select(RiskAssessment).where(RiskAssessment.public_id == public_id, RiskAssessment.tenant_id == self.principal.tenant_id)
        )
        if row is None:
            raise AssessmentError("assessment not found")
        return row

    def rerun(self, public_id) -> Reproduction:
        orig = self.get(public_id)
        rules = RULESETS.get(orig.ruleset_version)
        if rules is None:
            raise AssessmentError(f"rule set {orig.ruleset_version} is not available in this build")
        stored = ModelRegistry(self.db, self.settings).artefact_path(orig.model_sha256)
        model = load_model(stored) if stored.exists() else model_by_sha(orig.model_sha256)
        if model is None:
            raise AssessmentError(f"model artefact {orig.model_sha256[:12]} is not available in this build")
        inp = load_inputs(
            self.db, orig.address, orig.chain_id, rules=rules, settings=self.settings,
            prices=self._prices(as_of=orig.as_of, allow_fetch=False), as_of=orig.as_of,
            neighbours=orig.manifest["neighbourLimit"],
        )
        for k in CONTEXT_KEYS:
            inp.data_quality[k] = orig.data_quality.get(k)
        inp.manifest["modelVersionId"] = orig.manifest.get("modelVersionId")
        new = self._run_and_store(inp, rules, model, "reproduction", orig.id, orig.manifest["neighbourLimit"], orig.model_status)
        diffs = sorted(k for k in set(orig.report) | set(new.report) if orig.report.get(k) != new.report.get(k))
        if new.review_reasons != orig.review_reasons:
            diffs.append("reviewReasons")
        return Reproduction(
            original_id=str(orig.public_id), reproduction_id=str(new.public_id),
            identical=new.inputs_sha256 == orig.inputs_sha256 and new.report_sha256 == orig.report_sha256 and not diffs,
            inputs_match=new.inputs_sha256 == orig.inputs_sha256, report_match=new.report_sha256 == orig.report_sha256,
            score_original=orig.score, score_rerun=new.score, differences=diffs,
        )

    # ---- storage ----------------------------------------------------------------------------------

    def _run_and_store(
        self, inp: AssessmentInputs, rules: RuleSet, model: Model, trigger: str, reproduces: int | None, neighbour_limit: int,
        model_status: str,
    ) -> RiskAssessment:
        report = assess_from_data(
            address=inp.address, txs=inp.txs, edges=inp.edges, as_of=inp.as_of_iso, mode="live",
            labels=inp.label_lookup(), rules=rules, model=model, data_quality=inp.data_quality,
        )
        # Round-trip through JSON so the stored report and its hash agree exactly (JSONB keeps the same values).
        report = json.loads(canonical(report))
        inputs_hash = sha256(
            {"asOf": inp.as_of_iso, "txs": inp.txs, "edges": inp.edges, "labels": inp.labels, "ruleset": rules.version, "model": model.sha256}
        )
        manifest = {**inp.manifest, "neighbourLimit": neighbour_limit}

        # One writer per tenant at a time keeps the chain linear.
        self.db.execute(select(func.pg_advisory_xact_lock(func.hashtextextended(f"m4chain:{self.principal.tenant_id}", 0))))
        prev = self.db.scalar(
            select(RiskAssessment.row_hash).where(RiskAssessment.tenant_id == self.principal.tenant_id).order_by(RiskAssessment.id.desc()).limit(1)
        ) or GENESIS
        row = RiskAssessment(
            public_id=uuid.uuid4(), tenant_id=self.principal.tenant_id, chain_id=inp.chain_id, address=inp.address, as_of=inp.as_of,
            created_at=self.clock(), created_by=self.principal.user_id, trigger=trigger, reproduces_id=reproduces,
            ruleset_version=rules.version, model_version=model.version, model_sha256=model.sha256, app_version=self.settings.version,
            score=report["score"], tier=report["tier"], floor=report["floor"], confidence=report["confidence"]["value"],
            ml_probability=Decimal(str(report["ml"]["probability"])).quantize(Decimal("1e-10")),
            report=report, manifest=manifest, data_quality=inp.data_quality,
            inputs_sha256=inputs_hash, report_sha256=sha256(report), prev_hash=prev, model_status=model_status,
        )
        row.review_reasons = review_reasons(report, inp.data_quality, model_status, rules, self.settings)
        row.review_required = bool(row.review_reasons)
        row.row_hash = row_hash(prev, row)
        self.db.add(row)
        self.db.commit()
        return row


def verify_chain(db: Session, tenant_id: str) -> ChainCheck:
    """Recompute every row's hash in order. Detects edited, deleted or re-ordered assessments."""
    prev = GENESIS
    n = 0
    for row in db.scalars(select(RiskAssessment).where(RiskAssessment.tenant_id == tenant_id).order_by(RiskAssessment.id)):
        n += 1
        if row.prev_hash != prev:
            return ChainCheck(ok=False, checked=n, first_bad_id=row.id, reason="link to previous row broken (row removed or reordered)")
        if row_hash(prev, row) != row.row_hash or sha256(row.report) != row.report_sha256:
            return ChainCheck(ok=False, checked=n, first_bad_id=row.id, reason="row content does not match its hash (row edited)")
        prev = row.row_hash
    return ChainCheck(ok=True, checked=n)
