"""M5 fund flow tracing: stored trace runs with nodes and edges."""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Identity, Index, Integer, String, Text
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
