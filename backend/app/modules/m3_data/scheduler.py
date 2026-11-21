"""Nightly backfill: keep transfer history fresh for all assessed wallets and watchlist entries.

Runs at 02:00 UTC every night.  Skips addresses synced within the last 12 hours so manual
syncs and the nightly job don't duplicate work.  Rate-limited to ≤5 addresses/s to stay
inside Etherscan / Blockscout free-tier limits.
"""

import logging
import time
from datetime import UTC, datetime, timedelta
from functools import lru_cache

from sqlalchemy import func, select

from app.core.config import get_settings
from app.core.db import _session_factory
from app.modules.m3_data.models import AddressSyncState
from app.modules.m3_data.providers.factory import build_router
from app.modules.m3_data.sync import ALL_KINDS, TransferSync
from app.modules.m4_risk.models import RiskAssessment
from app.modules.m7_monitoring.models import WatchlistEntry

log = logging.getLogger(__name__)

_BATCH_LIMIT = 500           # max addresses per run so we don't run forever
_SKIP_IF_YOUNGER_H = 12      # skip addresses synced within this many hours
_RATE_SLEEP = 0.2            # seconds between syncs (5 addresses/s)


@lru_cache
def _build_router_once():
    return build_router(get_settings())


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=UTC)


def _last_synced_at(db, chain_id: int, address: str) -> datetime | None:
    row = db.scalar(
        select(func.max(AddressSyncState.last_attempt_at))
        .where(AddressSyncState.chain_id == chain_id, AddressSyncState.address == address)
    )
    return _aware(row) if row else None


def run_backfill() -> dict:
    """Sync all tracked addresses.  Returns a summary dict (useful for one-off manual calls too)."""
    settings = get_settings()
    router = _build_router_once()
    cutoff = datetime.now(UTC) - timedelta(hours=_SKIP_IF_YOUNGER_H)

    with _session_factory()() as db:
        assessed = db.execute(
            select(RiskAssessment.chain_id, RiskAssessment.address)
            .distinct()
            .order_by(RiskAssessment.id.desc())
            .limit(_BATCH_LIMIT)
        ).all()

        watched = db.execute(
            select(WatchlistEntry.chain_id, WatchlistEntry.address).distinct()
        ).all()

        targets = list({(r.chain_id, r.address) for r in assessed} | {(r.chain_id, r.address) for r in watched})

        sync = TransferSync(db, router, settings)
        ok = err = skipped = 0

        for chain_id, address in targets:
            last = _last_synced_at(db, chain_id, address)
            if last and last > cutoff:
                skipped += 1
                continue
            try:
                sync.sync(address, chain_id)
                ok += 1
            except Exception:
                log.exception("backfill error: chain=%s addr=%s", chain_id, address)
                err += 1
            time.sleep(_RATE_SLEEP)

    summary = {"targets": len(targets), "synced": ok, "skipped": skipped, "errors": err}
    log.info("backfill complete: %s", summary)
    return summary


# ---- scheduler lifecycle -----------------------------------------------------------------------

_scheduler = None


def start() -> None:
    global _scheduler
    if _scheduler is not None:
        return
    try:
        from apscheduler.schedulers.background import BackgroundScheduler

        _scheduler = BackgroundScheduler(timezone="UTC")
        _scheduler.add_job(run_backfill, "cron", hour=2, minute=0, id="m3_backfill",
                           misfire_grace_time=3600, coalesce=True)
        _scheduler.start()
        log.info("M3 backfill scheduler started (nightly 02:00 UTC)")
    except ImportError:
        log.warning("apscheduler not installed — backfill scheduler disabled. pip install apscheduler")


def stop() -> None:
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
