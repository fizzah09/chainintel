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


def _run_job(script_module: str, fn_name: str = "run_sync") -> None:
    """Generic wrapper: import script_module.fn_name and call it."""
    try:
        import importlib
        mod = importlib.import_module(script_module)
        getattr(mod, fn_name)()
    except Exception:
        log.exception("Intel sync job failed: %s.%s", script_module, fn_name)


def start() -> None:
    global _scheduler
    if _scheduler is not None:
        return
    try:
        from apscheduler.schedulers.background import BackgroundScheduler

        _scheduler = BackgroundScheduler(timezone="UTC")

        # Transfer backfill (existing)
        _scheduler.add_job(run_backfill, "cron", hour=2, minute=0, id="m3_backfill",
                           misfire_grace_time=3600, coalesce=True)

        # ── Intel label sync jobs ──────────────────────────────────────────────
        # 03:00 — OFAC SDN (official sanctions, highest priority)
        _scheduler.add_job(
            _run_job, "cron", hour=3, minute=0, id="intel_ofac_sdn",
            args=["scripts.sync_sanctions"], misfire_grace_time=3600, coalesce=True,
        )
        # 04:00 — Chainabuse (community hack/scam reports)
        _scheduler.add_job(
            _run_job, "cron", hour=4, minute=0, id="intel_chainabuse",
            args=["scripts.sync_chainabuse"], misfire_grace_time=3600, coalesce=True,
        )
        # 04:30 — ScamSniffer + MetaMask PhishFort (phishing addresses)
        _scheduler.add_job(
            _run_job, "cron", hour=4, minute=30, id="intel_scamsniffer",
            args=["scripts.sync_scamsniffer"], misfire_grace_time=3600, coalesce=True,
        )
        # 03:15 — EU Consolidated Financial Sanctions
        _scheduler.add_job(
            _run_job, "cron", hour=3, minute=15, id="intel_eu_sanctions",
            args=["scripts.sync_eu_sanctions"], misfire_grace_time=3600, coalesce=True,
        )
        # 03:30 — UK OFSI Consolidated List
        _scheduler.add_job(
            _run_job, "cron", hour=3, minute=30, id="intel_uk_sanctions",
            args=["scripts.sync_uk_sanctions"], misfire_grace_time=3600, coalesce=True,
        )
        # 03:45 — UN SC Consolidated List (weekly — it changes rarely)
        _scheduler.add_job(
            _run_job, "cron", day_of_week="sun", hour=3, minute=45, id="intel_un_sanctions",
            args=["scripts.sync_un_sanctions"], misfire_grace_time=3600, coalesce=True,
        )
        # 05:00 — Tornado Cash seed + Ethereum community contract labels (weekly)
        _scheduler.add_job(
            _run_job, "cron", day_of_week="sun", hour=5, minute=0, id="intel_tornado_eth_labels",
            args=["scripts.sync_tornado_cash"], misfire_grace_time=7200, coalesce=True,
        )
        # 06:00 — Tornado Cash event logs (deposit/withdrawal from TC pools)
        _scheduler.add_job(
            _run_job, "cron", hour=6, minute=0, id="intel_tc_events",
            args=["scripts.sync_tc_events"], misfire_grace_time=3600, coalesce=True,
        )
        # 06:30 — DEX swap events (Uniswap V2/V3, SushiSwap)
        _scheduler.add_job(
            _run_job, "cron", hour=6, minute=30, id="intel_dex_swaps",
            args=["scripts.sync_dex_swaps"], misfire_grace_time=3600, coalesce=True,
        )
        # 07:00 — Dune Analytics community labels (weekly)
        _scheduler.add_job(
            _run_job, "cron", day_of_week="sun", hour=7, minute=0, id="intel_dune_labels",
            args=["scripts.sync_dune_labels"], misfire_grace_time=7200, coalesce=True,
        )

        _scheduler.start()
        log.info(
            "M3 scheduler started: backfill 02:00 | OFAC 03:00 | EU 03:15 | UK 03:30 | "
            "Chainabuse 04:00 | ScamSniffer 04:30 | TC+ETHlabels Sun 05:00 | "
            "TC-events 06:00 | DEX-swaps 06:30 | UN+Dune Sun 03:45/07:00 (all UTC)"
        )
    except ImportError:
        log.warning("apscheduler not installed — schedulers disabled. pip install apscheduler")


def stop() -> None:
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
