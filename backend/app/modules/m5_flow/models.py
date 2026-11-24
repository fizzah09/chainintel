"""M5 fund flow tracing: stored trace runs with nodes and edges, plus precomputed exposure edges."""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Identity, Index, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class TraceRun(Base):
    __tablename__ = "trace_runs"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[uuid.UUID] = mapped_column(String(36), unique=True, default=uuid.uuid4)
    tenant_id: Mapped[str] = mapped_column(String(64))
    chain_id: Mapped[int] = mapped_column(Integer)
    start_address: Mapped[str] = mapped_column(String(42))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[str] = mapped_column(String(128))
    # Parameters
    hops: Mapped[int] = mapped_column(Integer)
    direction: Mapped[str] = mapped_column(String(32))  # forward | backward | both
    period_days: Mapped[int] = mapped_column(Integer)
    min_usd: Mapped[int] = mapped_column(Integer, default=0)
    method: Mapped[str] = mapped_column(String(32))  # proportional | fifo | temporal
    as_of: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # Results
    total_nodes: Mapped[int] = mapped_column(Integer, default=0)
    total_edges: Mapped[int] = mapped_column(Integer, default=0)
    truncated: Mapped[bool] = mapped_column(default=False)
    nodes: Mapped[list] = mapped_column(JSONB, default=list)
    edges: Mapped[list] = mapped_column(JSONB, default=list)
    path: Mapped[list] = mapped_column(JSONB, default=list)

    __table_args__ = (
        Index("ix_trace_runs_tenant", "tenant_id", "chain_id", "start_address", "created_at"),
    )


# ---- Precomputed exposure edges (risk engine) -------------------------------------------------------


EXPOSURE_CATEGORIES = (
    "sanctions", "mixer", "scam", "hack", "ransomware", "darknet", "phishing", "gambling",
)


class ExposureEdge(Base):
    """Indexed hop-based exposure: which illicit node a wallet reached via on-chain transfers.

    Written (or refreshed) each time the risk engine scores a wallet.
    Queried in O(1): SELECT … WHERE source_address = $1 AND chain_id = $2 AND hop_distance <= 3.
    Distinct from trace_runs (which are on-demand full graphs stored as JSONB).
    last_seen_at drives the recency decay in the score formula.
    """

    __tablename__ = "exposure_edges"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(String(64))
    chain_id: Mapped[int] = mapped_column(Integer)
    source_address: Mapped[str] = mapped_column(String(42))   # wallet being scored
    target_address: Mapped[str] = mapped_column(String(42))   # illicit node
    target_category: Mapped[str] = mapped_column(String(16))  # sanctions | mixer | scam | …
    target_label: Mapped[str | None] = mapped_column(Text)    # "Tornado Cash", "Lazarus Group"
    hop_distance: Mapped[int] = mapped_column(Integer)        # 1 | 2 | 3
    path_tx_hashes: Mapped[list] = mapped_column(JSONB, default=list)  # [tx_hash per hop]
    value_eth: Mapped[Decimal] = mapped_column(Numeric(28, 8))
    value_usd: Mapped[Decimal | None] = mapped_column(Numeric(28, 2))
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "target_category IN (" + ",".join(f"'{c}'" for c in EXPOSURE_CATEGORIES) + ")",
            name="exposure_category",
        ),
        CheckConstraint("hop_distance BETWEEN 1 AND 5", name="hop_distance_range"),
        Index("ix_exposure_edges_source", "tenant_id", "chain_id", "source_address", "hop_distance"),
        Index("ix_exposure_edges_target", "target_address", "target_category"),
    )
