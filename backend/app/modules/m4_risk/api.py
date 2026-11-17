"""M4 HTTP API: assessments, re-runs, chain verification, rule sets, model governance, drift,
reviewed cases and back-tests."""

import uuid
from datetime import UTC, datetime
from functools import lru_cache
from typing import Annotated, Literal

from fastapi import APIRouter, Body, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.core.security import Principal, require_principal, require_roles
from app.modules.m3_data.api import get_provider_router
from app.modules.m3_data.prices.coingecko import CoinGecko, build_coingecko
from app.modules.m3_data.providers.base import normalize_address
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m4_risk.backtest import CaseIn, import_cases, run_backtest
from app.modules.m3_data.labels.lookup import labels_for
from app.modules.m4_risk.drift import DriftReport, drift_report
from app.modules.m4_risk import feature_store
from app.modules.m4_risk.entity import classify
from app.modules.m4_risk.feature_store import FeatureOut
from app.modules.m4_risk.engine import RULESETS, TIER_NAME
from app.modules.m4_risk.governance import GovernanceError, ModelRegistry
from app.modules.m4_risk.models import BacktestRun, ModelReview, ModelVersion, ReviewedCase, RiskAssessment
from app.modules.m4_risk.service import AssessmentError, ChainCheck, Reproduction, RiskService, verify_chain

router = APIRouter(prefix="/api/v1", tags=["M4 wallet risk"], dependencies=[Depends(require_principal)])

Address = Annotated[str, Path(pattern=r"^0x[0-9a-fA-F]{40}$")]
ChainId = Annotated[int, Path(ge=1)]
DB = Annotated[Session, Depends(get_db)]
Me = Annotated[Principal, Depends(require_principal)]


@lru_cache
def _coingecko() -> CoinGecko | None:
    s = get_settings()
    if not s.coingecko_enabled:
        return None
    key = s.coingecko_api_key.get_secret_value() if s.coingecko_api_key else None
    return build_coingecko(key, s.coingecko_pro, s.coingecko_rps, s.provider_max_retries)


def get_coingecko() -> CoinGecko | None:
    return _coingecko()


def risk_service(
    db: DB, me: Me, settings: Settings = Depends(get_settings),
    providers: ProviderRouter = Depends(get_provider_router), coingecko: CoinGecko | None = Depends(get_coingecko),
) -> RiskService:
    return RiskService(db, providers, settings, me, coingecko=coingecko)


Service = Annotated[RiskService, Depends(risk_service)]


def _fail(exc: Exception) -> HTTPException:
    msg = str(exc)
    if "not found" in msg:
        return HTTPException(status.HTTP_404_NOT_FOUND, msg)
    if "requires role" in msg:
        return HTTPException(status.HTTP_403_FORBIDDEN, msg)
    return HTTPException(status.HTTP_409_CONFLICT, msg)


# ---- response models ------------------------------------------------------------------------------


class AssessmentSummary(BaseModel):
    id: uuid.UUID
    chain_id: int
    address: str
    as_of: datetime
    created_at: datetime
    created_by: str
    trigger: str
    ruleset_version: int
    model_version: str
    model_status: str
    score: int
    tier: str
    tier_name: str
    floor: str | None
    confidence: int
    ml_probability: float
    review_required: bool
    review_reasons: list[str]

    @classmethod
    def of(cls, r: RiskAssessment) -> "AssessmentSummary":
        return cls(
            id=r.public_id, chain_id=r.chain_id, address=r.address, as_of=r.as_of, created_at=r.created_at, created_by=r.created_by,
            trigger=r.trigger, ruleset_version=r.ruleset_version, model_version=r.model_version, model_status=r.model_status,
            score=r.score, tier=r.tier, tier_name=TIER_NAME[r.tier], floor=r.floor, confidence=r.confidence,
            ml_probability=float(r.ml_probability), review_required=r.review_required, review_reasons=r.review_reasons,
        )


class AssessmentDetail(AssessmentSummary):
    model_sha256: str
    app_version: str
    report: dict
    manifest: dict
    data_quality: dict
    inputs_sha256: str
    report_sha256: str
    prev_hash: str
    row_hash: str
    reproduces: uuid.UUID | None

    @classmethod
    def full(cls, r: RiskAssessment, reproduces: uuid.UUID | None) -> "AssessmentDetail":
        return cls(
            **AssessmentSummary.of(r).model_dump(), model_sha256=r.model_sha256, app_version=r.app_version, report=r.report,
            manifest=r.manifest, data_quality=r.data_quality, inputs_sha256=r.inputs_sha256, report_sha256=r.report_sha256,
            prev_hash=r.prev_hash, row_hash=r.row_hash, reproduces=reproduces,
        )


class AssessRequest(BaseModel):
    ruleset_version: int | None = Field(default=None, description="Defaults to the configured rule set")
    refresh: bool = Field(default=True, description="Sync the wallet and its top counterparties first")


class RuleSetOut(BaseModel):
    version: int
    default: bool
    settings: dict
    eth_usd: float | None
    risk_categories: dict[str, str]
    stop_tracing_at: list[str]
    score_own_label: bool


class ModelOut(BaseModel):
    id: int
    name: str
    version: str
    sha256: str
    status: str
    trained_by: str
    trained_at: str | None
    training_data: dict
    metrics: dict
    registered_by: str
    registered_at: datetime
    notes: str | None


class ReviewOut(BaseModel):
    decision: str
    actor: str
    comment: str
    evidence: dict
    created_at: datetime


class ModelDetail(ModelOut):
    reviews: list[ReviewOut]


class Decision(BaseModel):
    comment: str = Field(min_length=3)


class CaseOut(BaseModel):
    id: int
    chain_id: int
    address: str
    decided_at: datetime
    outcome: str
    category: str | None
    reference: str | None
    source: str
    imported_by: str


class BacktestRequest(BaseModel):
    ruleset_version: int | None = None
    point_in_time: bool = Field(default=True, description="Score each case with data as known when it was decided")


class BacktestOut(BaseModel):
    id: uuid.UUID
    ruleset_version: int
    model_sha256: str
    cases: int
    dataset_sha256: str
    metrics: dict
    created_by: str
    created_at: datetime


class BacktestDetail(BacktestOut):
    per_case: list[dict]


def _bt(r: BacktestRun, detail: bool = False):
    base = dict(id=r.public_id, ruleset_version=r.ruleset_version, model_sha256=r.model_sha256, cases=r.cases,
                dataset_sha256=r.dataset_sha256, metrics=r.metrics, created_by=r.created_by, created_at=r.created_at)
    return BacktestDetail(**base, per_case=r.per_case) if detail else BacktestOut(**base)


# ---- assessments ----------------------------------------------------------------------------------


class EntityOut(BaseModel):
    address: str
    network: str
    chain_id: int
    entity_type: str
    group: str
    confidence: float
    conflict: bool
    primary_source: str | None
    sources: list[str]
    name: str | None
    reasons: list[str]


@router.get("/entity", response_model=EntityOut)
def get_entity(
    db: DB,
    address: str,
    network: str = "evm",
    chain_id: int = Query(0, ge=0, description="EVM chain id; 0 = labels that apply on every EVM chain"),
    settings: Settings = Depends(get_settings),
) -> EntityOut:
    """What the address is (R3). Labels only: an address with no label comes back `unknown`, never clean."""
    try:
        views = labels_for(
            db, [address], chain_id, commercial_only=settings.env == "production", network=network
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from None
    key = next(iter(views))
    e = classify(views[key])
    return EntityOut(
        address=key, network=network, chain_id=chain_id if network == "evm" else 0, entity_type=e.entity_type,
        group=e.group, confidence=e.confidence, conflict=e.conflict, primary_source=e.primary_source,
        sources=e.sources, name=e.name, reasons=e.reasons,
    )


def _aware(dt: datetime | None) -> datetime | None:
    """Naive times are read as UTC; the knowledge time is always stored timezone-aware."""
    return None if dt is None else (dt.replace(tzinfo=UTC) if dt.tzinfo is None else dt)


@router.post("/chains/{chain_id}/addresses/{address}/features", response_model=FeatureOut, status_code=201)
def build_features(
    chain_id: ChainId,
    address: str,
    db: DB,
    me: Principal = Depends(require_roles("compliance_manager", "model_owner")),
    settings: Settings = Depends(get_settings),
    as_of: datetime | None = None,
) -> FeatureOut:
    """Append a feature snapshot for the wallet from transfers known at `as_of` (default: now). Stored only."""
    try:
        row = feature_store.build(db, me, address, chain_id, settings, as_of=_aware(as_of))
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from None
    return feature_store.out(row)


@router.get("/chains/{chain_id}/addresses/{address}/features/latest", response_model=FeatureOut)
def latest_features(chain_id: ChainId, address: str, db: DB, me: Me) -> FeatureOut:
    row = feature_store.latest(db, me, address, chain_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "no feature snapshot for this wallet yet")
    return feature_store.out(row)


@router.post("/chains/{chain_id}/addresses/{address}/assessments", response_model=AssessmentDetail, status_code=201)
def assess(chain_id: ChainId, address: Address, svc: Service, req: AssessRequest = Body(default_factory=AssessRequest)) -> AssessmentDetail:
    """Score a wallet now and store the result permanently."""
    try:
        row = svc.assess(address, chain_id, ruleset_version=req.ruleset_version, refresh_data=req.refresh)
    except AssessmentError as exc:
        raise _fail(exc) from None
    return AssessmentDetail.full(row, None)


@router.get("/chains/{chain_id}/addresses/{address}/assessments", response_model=list[AssessmentSummary])
def list_assessments(chain_id: ChainId, address: Address, db: DB, me: Me, limit: Annotated[int, Query(ge=1, le=200)] = 20) -> list[AssessmentSummary]:
    q = (
        select(RiskAssessment)
        .where(RiskAssessment.tenant_id == me.tenant_id, RiskAssessment.chain_id == chain_id, RiskAssessment.address == normalize_address(address))
        .order_by(RiskAssessment.id.desc())
        .limit(limit)
    )
    return [AssessmentSummary.of(r) for r in db.scalars(q)]


@router.get("/assessments/verify-chain", response_model=ChainCheck)
def verify(db: DB, me: Me) -> ChainCheck:
    """Recompute this tenant's hash chain: proves no stored assessment was edited, removed or reordered."""
    return verify_chain(db, me.tenant_id)


@router.get("/assessments/{assessment_id}", response_model=AssessmentDetail)
def get_assessment(assessment_id: uuid.UUID, svc: Service, db: DB) -> AssessmentDetail:
    try:
        row = svc.get(assessment_id)
    except AssessmentError as exc:
        raise _fail(exc) from None
    orig = db.get(RiskAssessment, row.reproduces_id) if row.reproduces_id else None
    return AssessmentDetail.full(row, orig.public_id if orig else None)


@router.post("/assessments/{assessment_id}/reproduce", response_model=Reproduction)
def reproduce(assessment_id: uuid.UUID, svc: Service) -> Reproduction:
    """Re-run as of the original time with the original rule set and model; report whether it is identical."""
    try:
        return svc.rerun(assessment_id)
    except AssessmentError as exc:
        raise _fail(exc) from None


# ---- rule sets ------------------------------------------------------------------------------------


@router.get("/rulesets", response_model=list[RuleSetOut])
def list_rulesets(settings: Settings = Depends(get_settings)) -> list[RuleSetOut]:
    return [
        RuleSetOut(
            version=v, default=v == settings.default_ruleset, settings=r.as_dict(), eth_usd=r.eth_usd,
            risk_categories=dict(r.risk_cats), stop_tracing_at=sorted(r.terminal_cats), score_own_label=r.score_own_label,
        )
        for v, r in sorted(RULESETS.items())
    ]


# ---- model governance -----------------------------------------------------------------------------


@router.get("/models", response_model=list[ModelOut])
def list_models(db: DB) -> list[ModelOut]:
    return [ModelOut.model_validate(m, from_attributes=True) for m in db.scalars(select(ModelVersion).order_by(ModelVersion.id.desc()))]


@router.get("/models/drift", response_model=DriftReport)
def model_drift(
    db: DB, me: Me, settings: Settings = Depends(get_settings),
    model_sha256: str | None = None, window_days: Annotated[int, Query(ge=7, le=180)] = 30,
) -> DriftReport:
    sha = model_sha256 or (ModelRegistry(db, settings).active(settings.model_name) or ModelVersion(sha256="")).sha256
    if not sha:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "no approved model; pass model_sha256")
    return drift_report(db, me.tenant_id, sha, datetime.now(UTC), window_days=window_days)


@router.get("/models/{model_id}", response_model=ModelDetail)
def get_model(model_id: int, db: DB) -> ModelDetail:
    m = db.get(ModelVersion, model_id)
    if m is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "model not found")
    reviews = db.scalars(select(ModelReview).where(ModelReview.model_id == m.id).order_by(ModelReview.id))
    return ModelDetail(**ModelOut.model_validate(m, from_attributes=True).model_dump(),
                       reviews=[ReviewOut.model_validate(r, from_attributes=True) for r in reviews])


@router.post("/models/{model_id}/{action}", response_model=ReviewOut)
def decide(model_id: int, action: Literal["validate", "approve", "reject", "retire"], body: Decision, db: DB, me: Me,
           settings: Settings = Depends(get_settings)) -> ReviewOut:
    """Governance decision by the caller. Roles and independence rules are enforced by the register."""
    try:
        review = getattr(ModelRegistry(db, settings), action)(model_id, me, body.comment)
    except GovernanceError as exc:
        raise _fail(exc) from None
    return ReviewOut.model_validate(review, from_attributes=True)


# ---- reviewed cases and back-tests ----------------------------------------------------------------


@router.post("/reviewed-cases", dependencies=[Depends(require_roles("compliance_manager", "model_validator"))])
def add_reviewed_cases(cases: Annotated[list[CaseIn], Body(max_length=5000)], db: DB, me: Me) -> dict:
    """Import analyst decisions (case management writes these automatically from M6)."""
    try:
        return import_cases(db, me, cases)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from None


@router.get("/reviewed-cases", response_model=list[CaseOut])
def list_reviewed_cases(db: DB, me: Me, limit: Annotated[int, Query(ge=1, le=1000)] = 100) -> list[CaseOut]:
    q = select(ReviewedCase).where(ReviewedCase.tenant_id == me.tenant_id).order_by(ReviewedCase.id.desc()).limit(limit)
    return [CaseOut.model_validate(c, from_attributes=True) for c in db.scalars(q)]


@router.post("/backtests", response_model=BacktestDetail, status_code=201,
             dependencies=[Depends(require_roles("compliance_manager", "model_validator", "model_owner"))])
def create_backtest(db: DB, me: Me, settings: Settings = Depends(get_settings),
                    req: BacktestRequest = Body(default_factory=BacktestRequest)) -> BacktestDetail:
    version = req.ruleset_version or settings.default_ruleset
    if version not in RULESETS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"unknown rule set {version}")
    try:
        model, _, _ = ModelRegistry(db, settings).model_for_assessment()
    except GovernanceError as exc:
        raise _fail(exc) from None
    return _bt(run_backtest(db, settings, me, RULESETS[version], model, point_in_time=req.point_in_time), detail=True)


@router.get("/backtests", response_model=list[BacktestOut])
def list_backtests(db: DB, me: Me, limit: Annotated[int, Query(ge=1, le=100)] = 20) -> list[BacktestOut]:
    q = select(BacktestRun).where(BacktestRun.tenant_id == me.tenant_id).order_by(BacktestRun.id.desc()).limit(limit)
    return [_bt(r) for r in db.scalars(q)]


@router.get("/backtests/{run_id}", response_model=BacktestDetail)
def get_backtest(run_id: uuid.UUID, db: DB, me: Me) -> BacktestDetail:
    r = db.scalar(select(BacktestRun).where(BacktestRun.public_id == run_id, BacktestRun.tenant_id == me.tenant_id))
    if r is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "back-test not found")
    return _bt(r, detail=True)
