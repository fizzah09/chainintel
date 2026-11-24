"""Daily Chainabuse sync.

Fetches community-reported scam/hack/ransomware/phishing ETH addresses from the
Chainabuse GraphQL API and upserts them into address_labels.

Chainabuse API: https://www.chainabuse.com/api (GraphQL, no key required for public reports)
Rate limit: 100 req/min on the free tier.

Run manually:
    python -m scripts.sync_chainabuse

Scheduled at 04:00 UTC by the intel scheduler.
"""

import logging
from datetime import UTC, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

log = logging.getLogger(__name__)

CHAINABUSE_GQL = "https://www.chainabuse.com/api/graphql"
SOURCE_KEY = "chainabuse"
CHAIN_ID_ETH = 1

# Map Chainabuse abuse types to our category taxonomy
CATEGORY_MAP = {
    "SCAM": "scam",
    "PHISHING": "phishing",
    "HACK": "hack",
    "RANSOMWARE": "ransomware",
    "DARKNET_MARKET": "darknet",
    "MIXER": "mixer",
    "THEFT": "hack",
    "FRAUD": "scam",
    "OTHER": "scam",
}

# GraphQL query — paginate by cursor, filter to Ethereum
_QUERY = """
query Reports($after: String) {
  reports(
    input: {
      blockchain: ETHEREUM
      limit: 100
      after: $after
    }
  ) {
    reports {
      id
      createdAt
      category
      addresses {
        address
        chain
      }
      description
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
"""


def _fetch_all_reports() -> list[dict]:
    """Paginate through all Chainabuse Ethereum reports."""
    reports = []
    cursor = None
    with httpx.Client(timeout=30, follow_redirects=True) as client:
        while True:
            payload = {"query": _QUERY, "variables": {"after": cursor}}
            resp = client.post(CHAINABUSE_GQL, json=payload,
                               headers={"Content-Type": "application/json"})
            resp.raise_for_status()
            data = resp.json()

            if "errors" in data:
                log.error("Chainabuse GraphQL error: %s", data["errors"])
                break

            page = data["data"]["reports"]
            reports.extend(page["reports"])

            if not page["pageInfo"]["hasNextPage"]:
                break
            cursor = page["pageInfo"]["endCursor"]

    return reports


def _extract_labels(reports: list[dict]) -> list[dict]:
    """Flatten reports → one label dict per ETH address."""
    labels = []
    for r in reports:
        cat = CATEGORY_MAP.get(r.get("category", "OTHER"), "scam")
        for addr_rec in r.get("addresses", []):
            addr = addr_rec.get("address", "").lower()
            if not (addr.startswith("0x") and len(addr) == 42):
                continue
            labels.append({
                "address": addr,
                "category": cat,
                "name": f"Chainabuse: {r.get('category','?')}",
                "source_ref": r["id"],
                "attributes": {
                    "abuse_type": r.get("category"),
                    "description": (r.get("description") or "")[:256],
                    "reported_at": r.get("createdAt"),
                },
            })
    return labels


def run_sync() -> dict:
    log.info("Chainabuse sync starting")
    started_at = datetime.now(UTC)

    try:
        reports = _fetch_all_reports()
    except httpx.HTTPStatusError as e:
        log.error("Chainabuse HTTP error: %s", e)
        return {"status": "error", "message": str(e)}

    labels = _extract_labels(reports)
    log.info("Chainabuse: %d reports → %d ETH address labels", len(reports), len(labels))

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            return {"status": "error", "message": "label_source 'chainabuse' not seeded — run migration 0015"}

        label_import = LabelImport(
            source_key=SOURCE_KEY,
            started_at=started_at,
            retrieved_from=CHAINABUSE_GQL,
            content_sha256="",
            licence=source.licence,
            commercial_use=source.commercial_use,
            status="applied",
            records=len(labels),
        )
        db.add(label_import)
        db.flush()

        written = 0
        for lbl in labels:
            stmt = (
                pg_insert(AddressLabel)
                .values(
                    source_key=SOURCE_KEY,
                    network="evm",
                    chain_id=CHAIN_ID_ETH,
                    address=lbl["address"],
                    category=lbl["category"],
                    name=lbl["name"],
                    confidence=source.default_confidence,
                    source_ref=lbl["source_ref"],
                    attributes=lbl["attributes"],
                    valid_from=started_at,
                    valid_to=None,
                    import_id=label_import.id,
                    ended_by_import_id=None,
                )
                .on_conflict_do_update(
                    constraint="uq_address_labels_current",
                    set_={
                        "category": lbl["category"],
                        "name": lbl["name"],
                        "attributes": lbl["attributes"],
                        "import_id": label_import.id,
                    },
                )
            )
            db.execute(stmt)
            written += 1

        db.commit()

    summary = {
        "status": "ok",
        "source": SOURCE_KEY,
        "reports": len(reports),
        "labels_written": written,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("Chainabuse sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
