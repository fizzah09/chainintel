"""DEX swap event sync — Uniswap V2, Uniswap V3, SushiSwap.

Fetches Swap events from the most liquid ETH/stablecoin pairs on each protocol,
indexed by sender and recipient so the risk engine can detect:
  - Wash trading (buy → sell same token within 60 min)
  - Circular flows (A→B→C→A via different pools)
  - Layering (chain of swaps moving value across tokens/pools)

Only syncs pairs involving ETH, WETH, USDT, USDC, DAI, WBTC — the tokens most
commonly used in on-chain laundering.

Event signatures:
  Uniswap V2 Swap(address,uint256,uint256,uint256,uint256,address)
    topic0 = 0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822

  Uniswap V3 Swap(address,address,int256,int256,uint160,uint128,int24)
    topic0 = 0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67

Run manually:
    python -m scripts.sync_dex_swaps

Scheduled daily at 06:30 UTC.
"""

import logging
import time
from datetime import UTC, datetime
from decimal import Decimal

import httpx
from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.config import get_settings
from app.core.db import _session_factory
from app.modules.m3_data.models import DexSwap

log = logging.getLogger(__name__)

ETHERSCAN_URL = "https://api.etherscan.io/api"
CHAIN_ID_ETH = 1

# Event topic hashes
UNISWAP_V2_SWAP = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
UNISWAP_V3_SWAP = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"

# Token addresses (mainnet)
WETH  = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
USDT  = "0xdac17f958d2ee523a2206206994597c13d831ec7"
USDC  = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
DAI   = "0x6b175474e89094c44da98b954eedeac495271d0f"
WBTC  = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"

SYMBOL_MAP = {
    WETH: "WETH", USDT: "USDT", USDC: "USDC", DAI: "DAI", WBTC: "WBTC",
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee": "ETH",
}

# High-volume pairs to track — Uniswap V2
UV2_PAIRS: list[dict] = [
    {"address": "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852", "token0": WETH,  "token1": USDT,  "symbol0": "WETH", "symbol1": "USDT"},
    {"address": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "address": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "token0": USDC,  "token1": WETH,  "symbol0": "USDC", "symbol1": "WETH"},
    {"address": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11", "token0": DAI,   "token1": WETH,  "symbol0": "DAI",  "symbol1": "WETH"},
    {"address": "0xbb2b8038a1640196fbe3e38816f3e67cba72d940", "token0": WBTC,  "token1": WETH,  "symbol0": "WBTC", "symbol1": "WETH"},
]

# High-volume pairs to track — Uniswap V3 (0.05% and 0.3% fee tiers)
UV3_PAIRS: list[dict] = [
    {"address": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", "token0": USDC,  "token1": WETH,  "symbol0": "USDC", "symbol1": "WETH"},  # 0.05%
    {"address": "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36", "token0": WETH,  "token1": USDT,  "symbol0": "WETH", "symbol1": "USDT"},  # 0.3%
    {"address": "0xc2e9f25be6257c210d7adf0d4cd6e3e881ba25f8", "token0": DAI,   "token1": WETH,  "symbol0": "DAI",  "symbol1": "WETH"},  # 0.3%
    {"address": "0xcbcdf9626bc03e24f779434178a73a0b4bad62ed", "token0": WBTC,  "token1": WETH,  "symbol0": "WBTC", "symbol1": "WETH"},  # 0.3%
    {"address": "0x7bea39867e4169dbe237d55c8242a8f2fcdcc387", "token0": USDC,  "token1": WETH,  "symbol0": "USDC", "symbol1": "WETH"},  # 1%
]

# SushiSwap pairs (same V2 ABI)
SUSHI_PAIRS: list[dict] = [
    {"address": "0x06da0fd433c1a5d7a4faa01111c044910a184553", "token0": WETH,  "token1": USDT,  "symbol0": "WETH", "symbol1": "USDT"},
    {"address": "0x397ff1542f962076d0bfe58ea045ffa2d347aca0", "token0": USDC,  "token1": WETH,  "symbol0": "USDC", "symbol1": "WETH"},
]

_PAGE_SIZE = 1000


def _hex_to_int(h: str) -> int:
    return int(h, 16) if h and h != "0x" else 0


def _decode_v2_swap(log_entry: dict, pair: dict) -> dict | None:
    """
    Swap(address indexed sender, uint256 amount0In, uint256 amount1In,
         uint256 amount0Out, uint256 amount1Out, address indexed to)
    topics[1]=sender, topics[2]=to; data=4x uint256
    """
    topics = log_entry.get("topics", [])
    data = log_entry.get("data", "0x")[2:]
    if len(topics) < 3 or len(data) < 256:
        return None
    sender = "0x" + topics[1][-40:]
    to = "0x" + topics[2][-40:]
    a0_in  = _hex_to_int(data[0:64])
    a1_in  = _hex_to_int(data[64:128])
    a0_out = _hex_to_int(data[128:192])
    a1_out = _hex_to_int(data[192:256])
    if a0_in > 0:
        return {"sender": sender, "recipient": to,
                "token_in": pair["token0"], "token_out": pair["token1"],
                "symbol_in": pair["symbol0"], "symbol_out": pair["symbol1"],
                "amount_in": a0_in, "amount_out": a1_out}
    else:
        return {"sender": sender, "recipient": to,
                "token_in": pair["token1"], "token_out": pair["token0"],
                "symbol_in": pair["symbol1"], "symbol_out": pair["symbol0"],
                "amount_in": a1_in, "amount_out": a0_out}


def _decode_v3_swap(log_entry: dict, pair: dict) -> dict | None:
    """
    Swap(address indexed sender, address indexed recipient,
         int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
    topics[1]=sender, topics[2]=recipient; data = amount0 + amount1 + ...
    """
    topics = log_entry.get("topics", [])
    data = log_entry.get("data", "0x")[2:]
    if len(topics) < 3 or len(data) < 128:
        return None
    sender = "0x" + topics[1][-40:]
    recipient = "0x" + topics[2][-40:]
    # int256 — treat as unsigned for size; sign tells direction
    amount0_raw = int(data[0:64], 16)
    amount1_raw = int(data[64:128], 16)
    # Convert two's complement for 256-bit
    if amount0_raw >= 2**255:
        amount0 = amount0_raw - 2**256
    else:
        amount0 = amount0_raw
    if amount1_raw >= 2**255:
        amount1 = amount1_raw - 2**256
    else:
        amount1 = amount1_raw
    if amount0 < 0:
        return {"sender": sender, "recipient": recipient,
                "token_in": pair["token1"], "token_out": pair["token0"],
                "symbol_in": pair["symbol1"], "symbol_out": pair["symbol0"],
                "amount_in": abs(amount1), "amount_out": abs(amount0)}
    else:
        return {"sender": sender, "recipient": recipient,
                "token_in": pair["token0"], "token_out": pair["token1"],
                "symbol_in": pair["symbol0"], "symbol_out": pair["symbol1"],
                "amount_in": abs(amount0), "amount_out": abs(amount1)}


def _fetch_logs(api_key: str, address: str, topic0: str, from_block: int) -> list[dict]:
    params = {
        "module": "logs", "action": "getLogs",
        "address": address, "topic0": topic0,
        "fromBlock": from_block, "toBlock": "latest",
        "page": 1, "offset": _PAGE_SIZE,
        "apikey": api_key,
    }
    with httpx.Client(timeout=30) as client:
        resp = client.get(ETHERSCAN_URL, params=params)
        resp.raise_for_status()
        data = resp.json()
    if data.get("status") != "1":
        return []
    return data.get("result", [])


def _last_synced_block(db, pool_address: str) -> int:
    row = db.scalar(
        select(func.max(DexSwap.block_number))
        .where(DexSwap.chain_id == CHAIN_ID_ETH, DexSwap.pool_address == pool_address)
    )
    return int(row) if row else 0


def _process_pairs(db, api_key: str, pairs: list[dict], protocol: str,
                   topic0: str, decoder, started_at: datetime) -> int:
    inserted_total = 0
    for pair in pairs:
        addr = pair["address"]
        from_block = _last_synced_block(db, addr) + 1
        logs = _fetch_logs(api_key, addr, topic0, from_block)
        time.sleep(0.25)

        for entry in logs:
            decoded = decoder(entry, pair)
            if decoded is None:
                continue
            block_num = _hex_to_int(entry.get("blockNumber", "0x0"))
            block_ts = datetime.fromtimestamp(_hex_to_int(entry.get("timeStamp", "0x0")), tz=UTC)
            stmt = (
                pg_insert(DexSwap)
                .values(
                    chain_id=CHAIN_ID_ETH,
                    protocol=protocol,
                    pool_address=addr,
                    sender=decoded["sender"],
                    recipient=decoded["recipient"],
                    token_in=decoded["token_in"],
                    token_out=decoded["token_out"],
                    symbol_in=decoded.get("symbol_in"),
                    symbol_out=decoded.get("symbol_out"),
                    amount_in=Decimal(decoded["amount_in"]),
                    amount_out=Decimal(decoded["amount_out"]),
                    amount_in_usd=None,
                    amount_out_usd=None,
                    tx_hash=entry.get("transactionHash", ""),
                    block_number=block_num,
                    block_timestamp=block_ts,
                    log_index=_hex_to_int(entry.get("logIndex", "0x0")),
                    synced_at=started_at,
                )
                .on_conflict_do_nothing(constraint="uq_dex_swaps_log")
            )
            db.execute(stmt)
            inserted_total += 1

        db.commit()
        log.debug("%s %s: inserted %d swaps from block %d", protocol, addr[:10], inserted_total, from_block)
    return inserted_total


def run_sync() -> dict:
    log.info("DEX swap sync starting")
    started_at = datetime.now(UTC)
    settings = get_settings()
    api_key = settings.etherscan_api_key.get_secret_value() if settings.etherscan_api_key else ""

    with _session_factory()() as db:
        v2_count = _process_pairs(db, api_key, UV2_PAIRS, "uniswap_v2", UNISWAP_V2_SWAP, _decode_v2_swap, started_at)
        v3_count = _process_pairs(db, api_key, UV3_PAIRS, "uniswap_v3", UNISWAP_V3_SWAP, _decode_v3_swap, started_at)
        su_count = _process_pairs(db, api_key, SUSHI_PAIRS, "sushiswap", UNISWAP_V2_SWAP, _decode_v2_swap, started_at)

    summary = {
        "status": "ok",
        "uniswap_v2": v2_count,
        "uniswap_v3": v3_count,
        "sushiswap": su_count,
        "total": v2_count + v3_count + su_count,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("DEX swap sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
