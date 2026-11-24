"""Tornado Cash address maintenance + Ethereum community label sync.

Two jobs in one script:

  1. tornado_cash — re-seeds the static TC contract list from migration 0015
     (idempotent; run after any manual label wipe)

  2. eth_community_labels — syncs the ethereum-lists/contracts GitHub repo:
     https://raw.githubusercontent.com/ethereum-lists/contracts/main/contracts/eth/active.json
     Provides exchange, DEX, and other named contract labels for scoring context.

Run manually:
    python -m scripts.sync_tornado_cash

Scheduled at 05:00 UTC by the intel scheduler (weekly for community labels; TC is static).
"""

import hashlib
import logging
from datetime import UTC, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

log = logging.getLogger(__name__)

ETH_LISTS_URL = (
    "https://raw.githubusercontent.com/ethereum-lists/contracts"
    "/main/contracts/eth/active.json"
)
CHAIN_ID_ETH = 1

# Full Tornado Cash contract list (static — no API).
# Source: official TC deployment transactions on Ethereum mainnet.
TORNADO_CASH_CONTRACTS: list[dict] = [
    # ETH pools
    {"address": "0x722122df12d4e14e13ac3b6895a86e84145b6967", "name": "Tornado Cash 0.1 ETH",   "ref": "TC-ETH-0.1",    "attrs": {"denomination_eth": 0.1,   "token": "ETH"}},
    {"address": "0xdd4c48c0b24039969fc16d1cdf626eab821d3384", "name": "Tornado Cash 1 ETH",     "ref": "TC-ETH-1",      "attrs": {"denomination_eth": 1,     "token": "ETH"}},
    {"address": "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b", "name": "Tornado Cash 10 ETH",    "ref": "TC-ETH-10",     "attrs": {"denomination_eth": 10,    "token": "ETH"}},
    {"address": "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", "name": "Tornado Cash 100 ETH",   "ref": "TC-ETH-100",    "attrs": {"denomination_eth": 100,   "token": "ETH"}},
    {"address": "0xa160cdab225685da1d56aa342ad8841c3b53f291", "name": "Tornado Cash 1000 ETH",  "ref": "TC-ETH-1000",   "attrs": {"denomination_eth": 1000,  "token": "ETH"}},
    # USDT pools
    {"address": "0xfd8610d20aa15b7b2e3be39b396a1bc3516c7144", "name": "Tornado Cash 100 USDT",  "ref": "TC-USDT-100",   "attrs": {"denomination_usdt": 100,  "token": "USDT"}},
    {"address": "0x07687e702b410fa43f4cb4af7fa097918ffd2730", "name": "Tornado Cash 1000 USDT", "ref": "TC-USDT-1000",  "attrs": {"denomination_usdt": 1000, "token": "USDT"}},
    {"address": "0x23773e65ed146a459667843b1e7a0b1d9e5af8a6", "name": "Tornado Cash 10k USDT",  "ref": "TC-USDT-10000", "attrs": {"denomination_usdt": 10000,"token": "USDT"}},
    # DAI pools
    {"address": "0x22aaa7720ddd5388a3c0a3333430953c68f1849b", "name": "Tornado Cash 100 DAI",   "ref": "TC-DAI-100",    "attrs": {"denomination_dai": 100,   "token": "DAI"}},
    {"address": "0x03893a7c7463ae47d46bc7f091665f1893656003", "name": "Tornado Cash 1000 DAI",  "ref": "TC-DAI-1000",   "attrs": {"denomination_dai": 1000,  "token": "DAI"}},
    {"address": "0x2717c5e28cf931547b621a5dddb772ab6a35b701", "name": "Tornado Cash 10k DAI",   "ref": "TC-DAI-10000",  "attrs": {"denomination_dai": 10000, "token": "DAI"}},
    {"address": "0xd21be7248e0197ee08e0c20d4a96debdac3d20af", "name": "Tornado Cash 100k DAI",  "ref": "TC-DAI-100000", "attrs": {"denomination_dai": 100000,"token": "DAI"}},
    # WBTC pools
    {"address": "0x178169b423a011fff22b9e3f3abea13414ddd0f1", "name": "Tornado Cash 0.1 WBTC",  "ref": "TC-WBTC-0.1",   "attrs": {"denomination_wbtc": 0.1,  "token": "WBTC"}},
    {"address": "0x610b717796ad172b316836ac95a2ffad065ceab4", "name": "Tornado Cash 1 WBTC",    "ref": "TC-WBTC-1",     "attrs": {"denomination_wbtc": 1,    "token": "WBTC"}},
    {"address": "0xbb93e510bbcd0b7beb5a853875f9ec60275cf498", "name": "Tornado Cash 10 WBTC",   "ref": "TC-WBTC-10",    "attrs": {"denomination_wbtc": 10,   "token": "WBTC"}},
    # Infrastructure
    {"address": "0x5efda50f22d34f262c29268506c5fa42cb56a1ce", "name": "Tornado Cash Proxy",     "ref": "TC-PROXY",      "attrs": {"type": "proxy"}},
    {"address": "0x5f6c97c6ad816f6a73fcffb8e6ae47eced8c41f4", "name": "Tornado Cash Governance","ref": "TC-GOV",        "attrs": {"type": "governance"}},
    {"address": "0x5cab7692d4e94096462119ab7bf57319726eed2a", "name": "Tornado Cash Relayer",    "ref": "TC-RELAYER",    "attrs": {"type": "relayer"}},
    # Nova (L2 bridge variant on mainnet)
    {"address": "0x84443cfd09a48af6ef360c6976c5392ac5023a1f", "name": "Tornado Cash Nova",      "ref": "TC-NOVA",       "attrs": {"type": "nova_pool"}},
]


def _seed_tornado_cash(db, source: LabelSource, started_at: datetime) -> int:
    written = 0
    for c in TORNADO_CASH_CONTRACTS:
        stmt = (
            pg_insert(AddressLabel)
            .values(
                source_key="tornado_cash",
                network="evm",
                chain_id=CHAIN_ID_ETH,
                address=c["address"].lower(),
                category="mixer",
                name=c["name"],
                confidence=1.00,
                source_ref=c["ref"],
                attributes=c["attrs"],
                valid_from=started_at,
                valid_to=None,
                import_id=None,
                ended_by_import_id=None,
            )
            .on_conflict_do_update(
                constraint="uq_address_labels_current",
                set_={
                    "name": c["name"],
                    "attributes": c["attrs"],
                },
            )
        )
        db.execute(stmt)
        written += 1
    return written


def _sync_eth_community_labels(db, source: LabelSource, started_at: datetime) -> dict:
    """Fetch ethereum-lists/contracts and upsert as address_labels."""
    try:
        with httpx.Client(timeout=30, follow_redirects=True) as client:
            r = client.get(ETH_LISTS_URL)
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        log.error("eth_community_labels fetch failed: %s", e)
        return {"written": 0, "error": str(e)}

    # Format: {"0xADDRESS": {"name": "...", "symbol": "...", ...}, ...}
    sha = hashlib.sha256(r.content).hexdigest()

    label_import = LabelImport(
        source_key="eth_community_labels",
        started_at=started_at,
        retrieved_from=ETH_LISTS_URL,
        content_sha256=sha,
        licence=source.licence,
        commercial_use=source.commercial_use,
        status="applied",
        records=len(data),
    )
    db.add(label_import)
    db.flush()

    written = 0
    for addr, meta in data.items():
        addr = addr.lower()
        if not (addr.startswith("0x") and len(addr) == 42):
            continue

        name = meta.get("name") or meta.get("symbol") or addr[:10]
        # Infer category from name heuristics
        name_lower = name.lower()
        if any(k in name_lower for k in ("tornado", "mixer", "tumbler", "privacy")):
            cat = "mixer"
        elif any(k in name_lower for k in ("exchange", "binance", "coinbase", "kraken", "okx", "bybit", "huobi")):
            cat = "exchange"
        elif any(k in name_lower for k in ("uniswap", "sushiswap", "curve", "balancer", "1inch")):
            cat = "dex"
        else:
            cat = "contract"

        stmt = (
            pg_insert(AddressLabel)
            .values(
                source_key="eth_community_labels",
                network="evm",
                chain_id=CHAIN_ID_ETH,
                address=addr,
                category=cat,
                name=name,
                confidence=source.default_confidence,
                source_ref=None,
                attributes={k: v for k, v in meta.items() if k in ("symbol", "decimals", "website")},
                valid_from=started_at,
                valid_to=None,
                import_id=label_import.id,
                ended_by_import_id=None,
            )
            .on_conflict_do_update(
                constraint="uq_address_labels_current",
                set_={
                    "name": name,
                    "category": cat,
                    "import_id": label_import.id,
                },
            )
        )
        db.execute(stmt)
        written += 1

    label_import.added = written
    return {"written": written, "total_records": len(data)}


def run_sync() -> dict:
    log.info("Tornado Cash seed + ETH community labels sync starting")
    started_at = datetime.now(UTC)

    with _session_factory()() as db:
        tc_source: LabelSource = db.get(LabelSource, "tornado_cash")
        tc_written = 0
        if tc_source:
            tc_written = _seed_tornado_cash(db, tc_source, started_at)
            log.info("Tornado Cash: %d contracts seeded/refreshed", tc_written)

        eth_source: LabelSource = db.get(LabelSource, "eth_community_labels")
        eth_result = {}
        if eth_source:
            eth_result = _sync_eth_community_labels(db, eth_source, started_at)
            log.info("ETH community labels: %s", eth_result)

        db.commit()

    summary = {
        "status": "ok",
        "tornado_cash_written": tc_written,
        "eth_community_labels": eth_result,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("Tornado Cash + ETH community sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
