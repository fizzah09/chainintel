"""Tornado Cash event log sync.

Uses Etherscan getLogs to fetch Deposit and Withdrawal events from all known
Tornado Cash pool contracts on Ethereum mainnet, and stores them in tc_events.

Why: A wallet that deposited into TC may never appear in any sanctions list directly,
but its deposit commitment links it to a mixer interaction — triggering TORNADO_CONTRACT
factor (Tier 1, weight 60) in the risk engine, even without a direct label match.

Event topics:
  Deposit(bytes32 commitment, uint32 leafIndex, uint256 timestamp)
    topic0 = keccak256("Deposit(bytes32,uint32,uint256)")
           = 0xa945e51eec50ab98c161376f0db4cf2aeba3ec92755fe2fcd388bdbbb80ff196

  Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee)
    topic0 = keccak256("Withdrawal(address,bytes32,address,uint256)")
           = 0xe9e508bad6d4c3227e881ca19068f099da81b5164dd6d62b2eaf1e8bc6c34931

We store: tx_hash, block_number, block_timestamp, commitment/nullifier, to_address, relayer.
Deposit does NOT reveal the sender (by design) — the tx sender is the depositor,
recoverable from the tx itself via eth_getTransactionByHash if needed.

Run manually:
    python -m scripts.sync_tc_events

Scheduled daily at 06:00 UTC.
"""

import logging
import time
from datetime import UTC, datetime

import httpx
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import get_settings
from app.core.db import _session_factory
from app.modules.m3_data.models import TcEvent

log = logging.getLogger(__name__)

ETHERSCAN_URL = "https://api.etherscan.io/api"
CHAIN_ID_ETH = 1

DEPOSIT_TOPIC = "0xa945e51eec50ab98c161376f0db4cf2aeba3ec92755fe2fcd388bdbbb80ff196"
WITHDRAW_TOPIC = "0xe9e508bad6d4c3227e881ca19068f099da81b5164dd6d62b2eaf1e8bc6c34931"

# All Tornado Cash pool contracts with their denomination metadata
TC_POOLS: list[dict] = [
    {"address": "0x722122df12d4e14e13ac3b6895a86e84145b6967", "eth": 0.1,    "token": "ETH"},
    {"address": "0xdd4c48c0b24039969fc16d1cdf626eab821d3384", "eth": 1.0,    "token": "ETH"},
    {"address": "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b", "eth": 10.0,   "token": "ETH"},
    {"address": "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", "eth": 100.0,  "token": "ETH"},
    {"address": "0xa160cdab225685da1d56aa342ad8841c3b53f291", "eth": 1000.0, "token": "ETH"},
    {"address": "0xfd8610d20aa15b7b2e3be39b396a1bc3516c7144", "eth": None,   "token": "USDT"},
    {"address": "0x07687e702b410fa43f4cb4af7fa097918ffd2730", "eth": None,   "token": "USDT"},
    {"address": "0x23773e65ed146a459667843b1e7a0b1d9e5af8a6", "eth": None,   "token": "USDT"},
    {"address": "0x22aaa7720ddd5388a3c0a3333430953c68f1849b", "eth": None,   "token": "DAI"},
    {"address": "0x03893a7c7463ae47d46bc7f091665f1893656003", "eth": None,   "token": "DAI"},
    {"address": "0x2717c5e28cf931547b621a5dddb772ab6a35b701", "eth": None,   "token": "DAI"},
    {"address": "0xd21be7248e0197ee08e0c20d4a96debdac3d20af", "eth": None,   "token": "DAI"},
    {"address": "0x178169b423a011fff22b9e3f3abea13414ddd0f1", "eth": None,   "token": "WBTC"},
    {"address": "0x610b717796ad172b316836ac95a2ffad065ceab4", "eth": None,   "token": "WBTC"},
    {"address": "0xbb93e510bbcd0b7beb5a853875f9ec60275cf498", "eth": None,   "token": "WBTC"},
    {"address": "0x84443cfd09a48af6ef360c6976c5392ac5023a1f", "eth": None,   "token": "ETH"},  # Nova
]

_PAGE_SIZE = 1000  # Etherscan max per getLogs call


def _hex_to_int(h: str) -> int:
    return int(h, 16) if h else 0


def _decode_deposit(log_entry: dict) -> dict:
    topics = log_entry.get("topics", [])
    data = log_entry.get("data", "0x")
    # Deposit(bytes32 commitment, uint32 leafIndex, uint256 timestamp)
    # topic0 = event sig, topics[1] = commitment (indexed in some versions)
    # data contains non-indexed: leafIndex, timestamp (ABI encoded)
    commitment = topics[1] if len(topics) > 1 else None
    # ABI decode data: 32 bytes leafIndex + 32 bytes timestamp
    data_stripped = data[2:]  # strip 0x
    leaf_index = _hex_to_int(data_stripped[:64]) if len(data_stripped) >= 64 else None
    return {"commitment": commitment, "leaf_index": leaf_index,
            "nullifier_hash": None, "to_address": None, "relayer": None, "fee": None}


def _decode_withdrawal(log_entry: dict) -> dict:
    topics = log_entry.get("topics", [])
    data = log_entry.get("data", "0x")
    # Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee)
    # topics[1]=relayer (indexed), data = to (32b) + nullifierHash (32b) + fee (32b)
    relayer = ("0x" + topics[1][-40:]) if len(topics) > 1 else None
    data_stripped = data[2:]
    to_address = ("0x" + data_stripped[24:64]) if len(data_stripped) >= 64 else None
    nullifier_hash = ("0x" + data_stripped[64:128]) if len(data_stripped) >= 128 else None
    fee_raw = _hex_to_int(data_stripped[128:192]) if len(data_stripped) >= 192 else 0
    fee_eth = fee_raw / 10**18
    return {"commitment": None, "leaf_index": None,
            "nullifier_hash": nullifier_hash, "to_address": to_address,
            "relayer": relayer, "fee": fee_eth}


def _fetch_logs(api_key: str, address: str, topic0: str,
                from_block: int, to_block: str = "latest") -> list[dict]:
    params = {
        "module": "logs",
        "action": "getLogs",
        "address": address,
        "topic0": topic0,
        "fromBlock": from_block,
        "toBlock": to_block,
        "page": 1,
        "offset": _PAGE_SIZE,
        "apikey": api_key,
    }
    with httpx.Client(timeout=30) as client:
        resp = client.get(ETHERSCAN_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
    if data.get("status") != "1":
        if data.get("message") == "No records found":
            return []
        log.warning("Etherscan getLogs error: %s", data.get("message"))
        return []
    return data.get("result", [])


def _last_synced_block(db, contract: str) -> int:
    row = db.scalar(
        select(func.max(TcEvent.block_number))
        .where(TcEvent.chain_id == CHAIN_ID_ETH, TcEvent.contract_address == contract)
    )
    return int(row) if row else 0


def run_sync() -> dict:
    log.info("Tornado Cash event sync starting")
    started_at = datetime.now(UTC)
    settings = get_settings()
    api_key = settings.etherscan_api_key.get_secret_value() if settings.etherscan_api_key else ""

    total_deposits = total_withdrawals = 0

    with _session_factory()() as db:
        for pool in TC_POOLS:
            addr = pool["address"]
            denom_eth = pool.get("eth")
            token = pool["token"]
            last_block = _last_synced_block(db, addr)
            from_block = last_block + 1 if last_block else 0

            for event_type, topic0, decoder in [
                ("deposit", DEPOSIT_TOPIC, _decode_deposit),
                ("withdrawal", WITHDRAW_TOPIC, _decode_withdrawal),
            ]:
                log.debug("Fetching %s events for %s from block %d", event_type, addr[:10], from_block)
                logs = _fetch_logs(api_key, addr, topic0, from_block)
                time.sleep(0.25)  # Etherscan free-tier: 5 req/s

                inserted = 0
                for entry in logs:
                    decoded = decoder(entry)
                    block_num = _hex_to_int(entry.get("blockNumber", "0x0"))
                    block_ts = datetime.fromtimestamp(_hex_to_int(entry.get("timeStamp", "0x0")), tz=UTC)
                    tx_hash = entry.get("transactionHash", "")
                    log_idx = _hex_to_int(entry.get("logIndex", "0x0"))

                    stmt = (
                        pg_insert(TcEvent)
                        .values(
                            chain_id=CHAIN_ID_ETH,
                            contract_address=addr,
                            event_type=event_type,
                            commitment=decoded["commitment"],
                            leaf_index=decoded["leaf_index"],
                            nullifier_hash=decoded["nullifier_hash"],
                            to_address=decoded["to_address"],
                            relayer=decoded["relayer"],
                            fee=decoded["fee"],
                            denomination_eth=denom_eth,
                            denomination_token=token,
                            tx_hash=tx_hash,
                            block_number=block_num,
                            block_timestamp=block_ts,
                            log_index=log_idx,
                            synced_at=started_at,
                        )
                        .on_conflict_do_nothing(constraint="uq_tc_events_log")
                    )
                    db.execute(stmt)
                    inserted += 1

                if event_type == "deposit":
                    total_deposits += inserted
                else:
                    total_withdrawals += inserted

            db.commit()

    summary = {
        "status": "ok",
        "pools_synced": len(TC_POOLS),
        "deposits_inserted": total_deposits,
        "withdrawals_inserted": total_withdrawals,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("TC event sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
