"""Daily ScamSniffer + MetaMask PhishFort sync.

Downloads two GitHub-hosted phishing/scam address lists and upserts into address_labels:

  1. ScamSniffer scam-database (blacklist/address.json)
     https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json

  2. MetaMask / PhishFort eth-phishing-detect config
     https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json
     (blacklist section — Ethereum addresses + ENS names we can resolve later)

Both are MIT-licensed JSON, no API key required.

Run manually:
    python -m scripts.sync_scamsniffer

Scheduled at 04:30 UTC by the intel scheduler.
"""

import hashlib
import logging
from datetime import UTC, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

log = logging.getLogger(__name__)

SCAMSNIFFER_URL = "https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/address.json"
METAMASK_URL = "https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/master/src/config.json"
CHAIN_ID_ETH = 1


def _fetch_json(url: str) -> object:
    with httpx.Client(timeout=30, follow_redirects=True) as client:
        r = client.get(url)
        r.raise_for_status()
        return r.json()


def _upsert_labels(db, source: LabelSource, label_import_id: int,
                   addresses: list[str], category: str, name_prefix: str,
                   started_at: datetime) -> int:
    written = 0
    for addr in addresses:
        addr = addr.lower().strip()
        if not (addr.startswith("0x") and len(addr) == 42):
            continue
        stmt = (
            pg_insert(AddressLabel)
            .values(
                source_key=source.key,
                network="evm",
                chain_id=CHAIN_ID_ETH,
                address=addr,
                category=category,
                name=name_prefix,
                confidence=source.default_confidence,
                source_ref=None,
                attributes={},
                valid_from=started_at,
                valid_to=None,
                import_id=label_import_id,
                ended_by_import_id=None,
            )
            .on_conflict_do_update(
                constraint="uq_address_labels_current",
                set_={
                    "category": category,
                    "name": name_prefix,
                    "import_id": label_import_id,
                },
            )
        )
        db.execute(stmt)
        written += 1
    return written


def run_sync() -> dict:
    log.info("ScamSniffer + MetaMask PhishFort sync starting")
    started_at = datetime.now(UTC)
    summary: dict = {"status": "ok"}

    # ── ScamSniffer ───────────────────────────────────────────────────────────
    try:
        ss_data = _fetch_json(SCAMSNIFFER_URL)
        # Format: {"blacklist": ["0x...", ...]} or just a flat list
        if isinstance(ss_data, dict):
            ss_addrs = ss_data.get("blacklist", ss_data.get("addresses", []))
        else:
            ss_addrs = ss_data
        ss_sha = hashlib.sha256(str(ss_addrs).encode()).hexdigest()
        log.info("ScamSniffer: %d addresses", len(ss_addrs))
    except Exception as e:
        log.error("ScamSniffer fetch failed: %s", e)
        ss_addrs = []
        ss_sha = ""

    # ── MetaMask PhishFort ────────────────────────────────────────────────────
    try:
        mm_data = _fetch_json(METAMASK_URL)
        # Format: {"blacklist": ["0x..."|"domain", ...], "whitelist": [...], "fuzzylist": [...]}
        mm_all = mm_data.get("blacklist", [])
        # Keep only hex addresses (not domain names)
        mm_addrs = [x for x in mm_all if isinstance(x, str) and x.startswith("0x") and len(x) == 42]
        mm_sha = hashlib.sha256(str(mm_addrs).encode()).hexdigest()
        log.info("MetaMask PhishFort: %d ETH addresses (of %d blacklist entries)", len(mm_addrs), len(mm_all))
    except Exception as e:
        log.error("MetaMask PhishFort fetch failed: %s", e)
        mm_addrs = []
        mm_sha = ""

    with _session_factory()() as db:
        # ── ScamSniffer upsert ────────────────────────────────────────────────
        ss_source: LabelSource = db.get(LabelSource, "scamsniffer")
        ss_written = 0
        if ss_source and ss_addrs:
            ss_import = LabelImport(
                source_key="scamsniffer",
                started_at=started_at,
                retrieved_from=SCAMSNIFFER_URL,
                content_sha256=ss_sha,
                licence=ss_source.licence,
                commercial_use=ss_source.commercial_use,
                status="applied",
                records=len(ss_addrs),
            )
            db.add(ss_import)
            db.flush()
            ss_written = _upsert_labels(
                db, ss_source, ss_import.id, ss_addrs,
                "phishing", "ScamSniffer phishing", started_at,
            )
            ss_import.added = ss_written

        # ── MetaMask PhishFort upsert ─────────────────────────────────────────
        mm_source: LabelSource = db.get(LabelSource, "metamask_phishfort")
        mm_written = 0
        if mm_source and mm_addrs:
            mm_import = LabelImport(
                source_key="metamask_phishfort",
                started_at=started_at,
                retrieved_from=METAMASK_URL,
                content_sha256=mm_sha,
                licence=mm_source.licence,
                commercial_use=mm_source.commercial_use,
                status="applied",
                records=len(mm_addrs),
            )
            db.add(mm_import)
            db.flush()
            mm_written = _upsert_labels(
                db, mm_source, mm_import.id, mm_addrs,
                "phishing", "MetaMask PhishFort", started_at,
            )
            mm_import.added = mm_written

        db.commit()

    summary.update({
        "scamsniffer_addresses": len(ss_addrs),
        "scamsniffer_written": ss_written,
        "metamask_addresses": len(mm_addrs),
        "metamask_written": mm_written,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    })
    log.info("ScamSniffer+MetaMask sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
