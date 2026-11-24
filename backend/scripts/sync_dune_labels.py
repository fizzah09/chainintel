"""Weekly Dune Analytics community label sync.

Fetches results from pre-approved public Dune queries that expose labeled
Ethereum addresses, and upserts them into address_labels.

Requires: CI_DUNE_API_KEY environment variable (free tier available at dune.com)

Dune REST API:
  GET https://api.dune.com/api/v1/query/{query_id}/results
  Header: X-DUNE-API-KEY: <key>

Configured queries (edit DUNE_QUERIES to add/remove):
  - 2059500: Tornado Cash interactions (depositor addresses via heuristic timing)
  - 2435399: Labeled scam/phishing EOAs (community-curated)
  - 3360774: Known darknet market deposit addresses
  - 2831000: Cross-chain bridge exploits (hack addresses)

Each query must return at least: address (VARCHAR), category (VARCHAR), label (VARCHAR)

Run manually:
    python -m scripts.sync_dune_labels

Scheduled Sundays at 07:00 UTC.
"""

import logging
from datetime import UTC, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import get_settings
from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

log = logging.getLogger(__name__)

DUNE_API = "https://api.dune.com/api/v1"
SOURCE_KEY = "dune_analytics"
CHAIN_ID_ETH = 1

# Map Dune category strings → our category taxonomy
CATEGORY_MAP = {
    "tornado": "mixer",
    "mixer": "mixer",
    "scam": "scam",
    "phishing": "phishing",
    "hack": "hack",
    "exploit": "hack",
    "ransomware": "ransomware",
    "darknet": "darknet",
    "sanctions": "sanctions",
    "gambling": "gambling",
}

# Dune query IDs to sync.  Each must return rows with at minimum:
#   address VARCHAR, category VARCHAR, label VARCHAR
# Optional: confidence FLOAT (0-1), source_ref VARCHAR
DUNE_QUERIES: list[dict] = [
    {
        "id": 2059500,
        "name": "Tornado Cash depositor heuristics",
        "default_category": "mixer",
    },
    {
        "id": 2435399,
        "name": "Community scam/phishing EOAs",
        "default_category": "scam",
    },
    {
        "id": 3360774,
        "name": "Darknet market deposit addresses",
        "default_category": "darknet",
    },
    {
        "id": 2831000,
        "name": "Bridge exploit addresses",
        "default_category": "hack",
    },
]


def _fetch_query_results(api_key: str, query_id: int) -> list[dict]:
    url = f"{DUNE_API}/query/{query_id}/results"
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        resp = client.get(url, headers={"X-DUNE-API-KEY": api_key})
        resp.raise_for_status()
        data = resp.json()
    rows = data.get("result", {}).get("rows", [])
    return rows


def _infer_category(row: dict, default: str) -> str:
    raw = (row.get("category") or "").lower().strip()
    for key, cat in CATEGORY_MAP.items():
        if key in raw:
            return cat
    return default


def run_sync() -> dict:
    log.info("Dune Analytics label sync starting")
    started_at = datetime.now(UTC)
    settings = get_settings()
    _dune_secret = getattr(settings, "dune_api_key", None)
    api_key = _dune_secret.get_secret_value() if _dune_secret else None

    if not api_key:
        log.warning("CI_DUNE_API_KEY not set — skipping Dune sync")
        return {"status": "skipped", "reason": "CI_DUNE_API_KEY not configured"}

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            return {"status": "error", "message": "label_source 'dune_analytics' not seeded — run migration 0016"}

        total_written = 0
        query_results = {}

        for query in DUNE_QUERIES:
            qid = query["id"]
            try:
                rows = _fetch_query_results(api_key, qid)
            except httpx.HTTPStatusError as e:
                log.error("Dune query %d failed: %s", qid, e)
                query_results[qid] = {"error": str(e)}
                continue

            label_import = LabelImport(
                source_key=SOURCE_KEY,
                started_at=started_at,
                retrieved_from=f"{DUNE_API}/query/{qid}/results",
                content_sha256="",
                licence=source.licence,
                commercial_use=source.commercial_use,
                status="applied",
                records=len(rows),
            )
            db.add(label_import)
            db.flush()

            written = 0
            for row in rows:
                addr = (row.get("address") or "").lower().strip()
                if not (addr.startswith("0x") and len(addr) == 42):
                    continue

                cat = _infer_category(row, query["default_category"])
                label_name = (row.get("label") or query["name"])[:128]
                confidence = float(row.get("confidence", source.default_confidence))
                confidence = max(0.0, min(1.0, confidence))

                db.execute(
                    pg_insert(AddressLabel)
                    .values(
                        source_key=SOURCE_KEY,
                        network="evm",
                        chain_id=CHAIN_ID_ETH,
                        address=addr,
                        category=cat,
                        name=label_name,
                        confidence=confidence,
                        source_ref=str(qid),
                        attributes={"dune_query": qid, "query_name": query["name"]},
                        valid_from=started_at,
                        valid_to=None,
                        import_id=label_import.id,
                        ended_by_import_id=None,
                    )
                    .on_conflict_do_update(
                        constraint="uq_address_labels_current",
                        set_={
                            "category": cat,
                            "name": label_name,
                            "confidence": confidence,
                            "import_id": label_import.id,
                        },
                    )
                )
                written += 1

            label_import.added = written
            query_results[qid] = {"name": query["name"], "rows": len(rows), "written": written}
            total_written += written

        db.commit()

    summary = {
        "status": "ok",
        "source": SOURCE_KEY,
        "total_labels": total_written,
        "queries": query_results,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("Dune sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
