"""Stored risk assessments: append-only and hash-chained per tenant.

A database trigger rejects UPDATE and DELETE, so an assessment can never be edited after the fact.
Each row's hash covers its content and the previous row's hash: changing or removing a row (even
with the trigger disabled by a DBA) breaks the chain, which `verify_chain` detects.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import text, BigInteger, Boolean, CheckConstraint, DateTime, ForeignKey, Identity, Index, Integer, Numeric, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64))
    chain_id: Mapped[int] = mapped_column(Integer)
    address: Mapped[str] = mapped_column(String(42))
    # Knowledge time: the assessment saw only data stored at or before this moment.
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[str] = mapped_column(String(128))
    trigger: Mapped[str] = mapped_column(String(16))  # manual | monitoring | reproduction
    reproduces_id: Mapped[int | None] = mapped_column(ForeignKey("risk_assessments.id"))

    ruleset_version: Mapped[int] = mapped_column(Integer)
    model_version: Mapped[str] = mapped_column(String(64))
    model_sha256: Mapped[str] = mapped_column(String(64))
    app_version: Mapped[str] = mapped_column(String(32))

    score: Mapped[int] = mapped_column(Integer)
    tier: Mapped[str] = mapped_column(String(8))
    floor: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[int] = mapped_column(Integer)
    ml_probability: Mapped[Decimal] = mapped_column(Numeric(12, 10))

    report: Mapped[dict] = mapped_column(JSONB)  # full engine output: every factor, calculation and source
    manifest: Mapped[dict] = mapped_column(JSONB)  # fetch ids, label imports, price rows, neighbours
    data_quality: Mapped[dict] = mapped_column(JSONB)
    inputs_sha256: Mapped[str] = mapped_column(String(64))  # canonical engine inputs
    report_sha256: Mapped[str] = mapped_column(String(64))
    # Rules decide the score; the model never changes it. Disagreement and weak data send the
    # assessment to a person (M4.4).
    model_status: Mapped[str] = mapped_column(String(16))  # approved | unapproved
    review_required: Mapped[bool] = mapped_column(Boolean)
    review_reasons: Mapped[list[str]] = mapped_column(JSONB)
    prev_hash: Mapped[str] = mapped_column(String(64))
    row_hash: Mapped[str] = mapped_column(String(64), unique=True)

    __table_args__ = (
        Index("ix_risk_assessments_wallet", "tenant_id", "chain_id", "address", "created_at"),
        Index("ix_risk_assessments_chain", "tenant_id", "id"),
    )


# ---- Model governance (M4.4) ----------------------------------------------------------------------

MODEL_STATUSES = ("registered", "validated", "approved", "retired", "rejected")


class ModelVersion(Base):
    """Model register. The artefact file is content-addressed (stored as <sha256>.json) and never
    overwritten, so every model that ever scored a wallet stays available for re-runs."""

    __tablename__ = "model_versions"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(String(64))
    version: Mapped[str] = mapped_column(String(64))
    sha256: Mapped[str] = mapped_column(String(64), unique=True)
    status: Mapped[str] = mapped_column(String(16))
    trained_by: Mapped[str] = mapped_column(String(128))
    trained_at: Mapped[str | None] = mapped_column(String(32))
    training_data: Mapped[dict] = mapped_column(JSONB)  # dataset, size, class balance, licence
    metrics: Mapped[dict] = mapped_column(JSONB)  # held-out test metrics from training
    registered_by: Mapped[str] = mapped_column(String(128))
    registered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint("status IN ('registered', 'validated', 'approved', 'retired', 'rejected')", name="status"),
        Index("uq_model_versions_one_approved", "name", unique=True, postgresql_where=text("status = 'approved'")),
    )


class ModelReview(Base):
    """Append-only log of every governance decision on a model."""

    __tablename__ = "model_reviews"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    model_id: Mapped[int] = mapped_column(ForeignKey("model_versions.id"))
    decision: Mapped[str] = mapped_column(String(16))  # registered | validated | approved | rejected | retired
    actor: Mapped[str] = mapped_column(String(128))
    comment: Mapped[str] = mapped_column(Text)
    evidence: Mapped[dict] = mapped_column(JSONB)  # automatic checks run at this step
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


# ---- Back-testing (M4.5) --------------------------------------------------------------------------


class ReviewedCase(Base):
    """A wallet whose outcome an analyst decided. Imported now; written by case management (M6) later.
    Append-only: a changed decision is a new row with a later `decided_at`."""

    __tablename__ = "reviewed_cases"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64))
    chain_id: Mapped[int] = mapped_column(Integer)
    address: Mapped[str] = mapped_column(String(42))
    decided_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # back-tests score as of this moment
    outcome: Mapped[str] = mapped_column(String(16))  # illicit | legitimate
    category: Mapped[str | None] = mapped_column(String(16))  # sanctions, scam, mixer ... for illicit outcomes
    reference: Mapped[str | None] = mapped_column(Text)  # case id or source document
    source: Mapped[str] = mapped_column(String(16))  # import | case_management
    imported_by: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("outcome IN ('illicit', 'legitimate')", name="outcome"),
        Index("uq_reviewed_cases_decision", "tenant_id", "chain_id", "address", "decided_at", unique=True),
    )


class BacktestRun(Base):
    """Append-only record of a back-test: which rules and model, on which cases, with what result."""

    __tablename__ = "backtest_runs"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64))
    ruleset_version: Mapped[int] = mapped_column(Integer)
    model_sha256: Mapped[str] = mapped_column(String(64))
    cases: Mapped[int] = mapped_column(Integer)
    dataset_sha256: Mapped[str] = mapped_column(String(64))  # fingerprint of the case ids and outcomes used
    metrics: Mapped[dict] = mapped_column(JSONB)
    per_case: Mapped[list] = mapped_column(JSONB)
    created_by: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


# ---- Feature store (R4) ---------------------------------------------------------------------------


class FeatureSnapshot(Base):
    """Append-only feature vector for one wallet at one knowledge time. Stored with the feature-set
    version and a hash, so the model's inputs can be reproduced from the transfers alone."""

    __tablename__ = "feature_snapshots"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64))
    chain_id: Mapped[int] = mapped_column(Integer)
    address: Mapped[str] = mapped_column(String(42))
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # knowledge time: transfers at or before
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[str] = mapped_column(String(128))
    feature_set: Mapped[str] = mapped_column(String(64))
    transfers: Mapped[int] = mapped_column(Integer)  # usable transfers the vector was built from
    features: Mapped[dict] = mapped_column(JSONB)
    feature_sha256: Mapped[str] = mapped_column(String(64))
    data_quality: Mapped[dict] = mapped_column(JSONB)

    __table_args__ = (
        Index("ix_feature_snapshots_wallet", "tenant_id", "chain_id", "address", "as_of"),
    )
