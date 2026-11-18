"""M7 monitoring: watchlists, wallet monitoring and alerts."""

import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Identity, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Watchlist(Base):
    __tablename__ = "watchlists"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    scope: Mapped[str] = mapped_column(String(32), default="Private")  # Private | Team | Org
    rule_type: Mapped[str] = mapped_column(String(32), default="threshold")  # threshold | sanctions | label
    rule_value: Mapped[str] = mapped_column(String(64), default="50")  # score threshold or category
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_by: Mapped[str] = mapped_column(String(128))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    entries: Mapped[list["WatchlistEntry"]] = relationship(back_populates="watchlist", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_watchlists_tenant", "tenant_id"),
    )


class WatchlistEntry(Base):
    __tablename__ = "watchlist_entries"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    watchlist_id: Mapped[int] = mapped_column(ForeignKey("watchlists.id", ondelete="CASCADE"))
    chain_id: Mapped[int] = mapped_column(Integer, default=1)
    address: Mapped[str] = mapped_column(String(42))
    label: Mapped[str | None] = mapped_column(String(128))
    risk_score: Mapped[int | None] = mapped_column(Integer)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    added_by: Mapped[str] = mapped_column(String(128))

    watchlist: Mapped["Watchlist"] = relationship(back_populates="entries")

    __table_args__ = (
        Index("ix_watchlist_entries_address", "watchlist_id", "address"),
    )


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    public_id: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[str] = mapped_column(String(64))
    watchlist_id: Mapped[int | None] = mapped_column(ForeignKey("watchlists.id", ondelete="SET NULL"))
    chain_id: Mapped[int] = mapped_column(Integer)
    wallet: Mapped[str] = mapped_column(String(42))
    trigger: Mapped[str] = mapped_column(String(128))  # human-readable trigger description
    score: Mapped[int] = mapped_column(Integer)
    tier: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(32), default="New")  # New | Reviewed | Resolved
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_by: Mapped[str | None] = mapped_column(String(128))
    resolution: Mapped[str | None] = mapped_column(Text)
    details: Mapped[dict] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        Index("ix_alerts_tenant", "tenant_id", "at"),
        Index("ix_alerts_wallet", "tenant_id", "wallet"),
        Index("ix_alerts_status", "tenant_id", "status"),
    )
