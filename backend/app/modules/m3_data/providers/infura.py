"""Infura JSON-RPC provider for M3.

Covers ERC-20 token transfers (eth_getLogs) and native ETH transfers on all Infura-supported EVM
chains.  Internal transfers require trace_* methods which are not available on the free tier and
are therefore unsupported.

Block-range paging: Infura caps eth_getLogs at 10,000 blocks per request.  We use 2,000-block
chunks so a single busy range never hits the cap.  Native transfers are fetched by scanning block
transactions directly — slow for wide ranges, so the caller (sync.py) should track the last-seen
block and pass narrow from_block/to_block windows.
"""

import logging
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

import httpx

from app.modules.m3_data.providers.base import (
    AuthError,
    BadResponseError,
    ChainDataProvider,
    Page,
    RateLimitedError,
    Transfer,
    TransferKind,
    TransientError,
    UnsupportedChainError,
    finalize,
    normalize_address,
)
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket, request_json

log = logging.getLogger(__name__)

# ERC-20 Transfer(address indexed from, address indexed to, uint256 value)
_ERC20_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

# Infura network subdomain by chain ID
_NETWORKS: dict[int, str] = {
    1: "mainnet",
    11155111: "sepolia",
    17000: "holesky",
    137: "polygon-mainnet",
    80002: "polygon-amoy",
    10: "optimism-mainnet",
    11155420: "optimism-sepolia",
    42161: "arbitrum-mainnet",
    421614: "arbitrum-sepolia",
    8453: "base-mainnet",
    84532: "base-sepolia",
    59144: "linea-mainnet",
    59141: "linea-sepolia",
    43114: "avalanche-mainnet",
    43113: "avalanche-fuji",
    56: "bsc-mainnet",
    97: "bsc-testnet",
}

# eth_getLogs: stay well under Infura's 10,000-block hard cap
_LOG_CHUNK = 2_000
# Native scan: reading full blocks is expensive; cap per page so sync stays incremental
_NATIVE_CHUNK = 100


def _now() -> datetime:
    return datetime.now(UTC)


def _hex(v: Any) -> int | None:
    if v is None:
        return None
    try:
        return int(v, 16)
    except (TypeError, ValueError):
        return None


def _pad_address(address: str) -> str:
    """Left-pad a 20-byte hex address to 32 bytes for use as a log topic."""
    return "0x" + address[2:].lower().zfill(64)


class InfuraProvider(ChainDataProvider):
    name = "infura"

    def __init__(
        self,
        api_key: str,
        client: httpx.Client,
        limiter: TokenBucket,
        retry: RetryPolicy,
        *,
        chains: frozenset[int] | None = None,
        page_size: int = 1000,
        max_pages: int = 20,
        timeout: float = 15.0,
        clock: Callable[[], datetime] = _now,
    ):
        if not api_key:
            raise ValueError("Infura provider needs an API key")
        self._key = api_key
        self._client = client
        self._limiter = limiter
        self._retry = retry
        self._chains: frozenset[int] = chains if chains is not None else frozenset(_NETWORKS)
        self.page_size = page_size
        self.max_pages = max_pages
        self._timeout = timeout
        self._clock = clock

    # ---- routing ------------------------------------------------------------------------------------

    def _url(self, chain_id: int) -> str:
        network = _NETWORKS.get(chain_id)
        if network is None:
            raise UnsupportedChainError(f"infura: chain {chain_id} has no known Infura endpoint")
        return f"https://{network}.infura.io/v3/{self._key}"

    def supports(self, chain_id: int, kind: TransferKind | None = None) -> bool:
        if chain_id not in self._chains or chain_id not in _NETWORKS:
            return False
        if kind is TransferKind.INTERNAL:
            return False  # requires trace_* — not on free tier
        return True

    # ---- JSON-RPC call ------------------------------------------------------------------------------

    @staticmethod
    def _check(body: Any) -> Any:
        if not isinstance(body, dict):
            raise BadResponseError("infura: unexpected response shape")
        if "error" in body:
            err = body["error"]
            msg = (err.get("message") if isinstance(err, dict) else str(err)).lower()
            if "unauthorized" in msg or "invalid project" in msg or "invalid api" in msg:
                raise AuthError(f"infura: {msg}")
            if "rate" in msg or "limit" in msg or "too many" in msg:
                raise RateLimitedError(f"infura: {msg}")
            if "execution timeout" in msg or "timeout" in msg:
                raise TransientError(f"infura: {msg}")
            raise BadResponseError(f"infura: RPC error — {msg[:160]}")
        return body.get("result")

    def _rpc(self, chain_id: int, method: str, params: list) -> Any:
        return request_json(
            self._client,
            "POST",
            self._url(chain_id),
            json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
            provider=self.name,
            limiter=self._limiter,
            retry=self._retry,
            timeout=self._timeout,
            check=self._check,
        )

    # ---- ChainDataProvider interface ----------------------------------------------------------------

    def latest_block(self, chain_id: int) -> int:
        result = self._rpc(chain_id, "eth_blockNumber", [])
        n = _hex(result)
        if n is None:
            raise BadResponseError("infura: bad block number")
        return n

    def eth_call(self, chain_id: int, to: str, data: str) -> str:
        result = self._rpc(
            chain_id,
            "eth_call",
            [{"to": normalize_address(to), "data": data}, "latest"],
        )
        if not isinstance(result, str):
            raise BadResponseError("infura: bad eth_call result")
        return result

    def transfers(
        self,
        address: str,
        chain_id: int,
        kind: TransferKind,
        from_block: int = 0,
        to_block: int | None = None,
    ) -> Page:
        address = normalize_address(address)
        if not self.supports(chain_id, kind):
            raise UnsupportedChainError(
                f"infura: chain {chain_id} / {kind.value} not supported"
                + (" (internal transfers require trace API — not on free tier)" if kind is TransferKind.INTERNAL else "")
            )
        end = to_block if to_block is not None else self.latest_block(chain_id)
        fetched_at = self._clock()

        if kind is TransferKind.ERC20:
            return self._erc20_transfers(address, chain_id, from_block, end, fetched_at)
        return self._native_transfers(address, chain_id, from_block, end, fetched_at)

    # ---- ERC-20 via eth_getLogs ---------------------------------------------------------------------

    def _erc20_transfers(
        self, address: str, chain_id: int, from_block: int, to_block: int, fetched_at: datetime
    ) -> Page:
        padded = _pad_address(address)
        acc: list[Transfer] = []
        complete = True
        pages = 0

        start = from_block
        while start <= to_block:
            end_chunk = min(start + _LOG_CHUNK - 1, to_block)

            # Two queries: address as sender (topics[1]) and address as receiver (topics[2])
            for topic_slot in (1, 2):
                topics: list[str | None] = [_ERC20_TOPIC, None, None]
                topics[topic_slot] = padded

                logs = self._rpc(
                    chain_id,
                    "eth_getLogs",
                    [{
                        "fromBlock": hex(start),
                        "toBlock": hex(end_chunk),
                        "topics": topics,
                    }],
                )
                if not isinstance(logs, list):
                    raise BadResponseError("infura: eth_getLogs did not return a list")

                for entry in logs:
                    t = self._parse_log(entry, chain_id, fetched_at)
                    if t is not None:
                        acc.append(t)

                pages += 1
                if pages >= self.max_pages * 2:
                    complete = False
                    return Page(
                        items=finalize(acc),
                        complete=False,
                        note=f"stopped after {self.max_pages} chunk pairs",
                    )

            start = end_chunk + 1

        return Page(items=finalize(acc), complete=complete)

    @staticmethod
    def _parse_log(entry: dict, chain_id: int, fetched_at: datetime) -> Transfer | None:
        try:
            topics = entry.get("topics", [])
            if len(topics) < 3:
                return None  # not a standard ERC-20 Transfer

            # topics[1] and topics[2] are 32-byte padded addresses; extract the last 20 bytes
            frm = "0x" + topics[1][-40:]
            to = "0x" + topics[2][-40:]
            token = entry.get("address", "").lower()
            log_index = _hex(entry.get("logIndex"))
            block_num = _hex(entry.get("blockNumber")) or 0
            tx_hash = entry.get("transactionHash", "").lower()

            # value is the un-indexed data field, 32-byte big-endian integer
            data = entry.get("data", "0x")
            value = int(data, 16) if data and data != "0x" else 0

            # Infura getLogs does not include block timestamps; use None and let the sync layer fill it.
            return Transfer(
                chain_id=chain_id,
                tx_hash=tx_hash,
                block_number=block_num,
                block_time=None,
                kind=TransferKind.ERC20,
                sub_id=f"log:{log_index}" if log_index is not None else f"{token}:{frm}>{to}:{value}",
                from_address=frm,
                to_address=to,
                value_raw=value,
                token_address=token or None,
                token_symbol=None,   # not available from raw logs; enriched later
                token_decimals=None,
                success=True,  # events only exist in successful transactions
                provider="infura",
                fetched_at=fetched_at,
            )
        except (KeyError, TypeError, ValueError, IndexError):
            raise BadResponseError("infura: malformed log entry") from None

    # ---- Native ETH via block scan ------------------------------------------------------------------

    def _native_transfers(
        self, address: str, chain_id: int, from_block: int, to_block: int, fetched_at: datetime
    ) -> Page:
        """Scan blocks for transactions where address is sender or receiver.

        This is O(blocks) and slow for wide ranges; the sync layer must keep from_block tight.
        """
        acc: list[Transfer] = []
        complete = True
        pages = 0

        for blk_num in range(from_block, to_block + 1, _NATIVE_CHUNK):
            end_chunk = min(blk_num + _NATIVE_CHUNK - 1, to_block)
            for b in range(blk_num, end_chunk + 1):
                block = self._rpc(chain_id, "eth_getBlockByNumber", [hex(b), True])
                if not isinstance(block, dict):
                    continue
                ts_raw = block.get("timestamp")
                block_time = datetime.fromtimestamp(_hex(ts_raw), UTC) if ts_raw else None

                for tx in block.get("transactions", []):
                    frm = (tx.get("from") or "").lower()
                    to = (tx.get("to") or "").lower()
                    if address not in (frm, to):
                        continue
                    value = _hex(tx.get("value")) or 0
                    if value == 0:
                        continue  # skip zero-value contract calls for native kind
                    acc.append(Transfer(
                        chain_id=chain_id,
                        tx_hash=(tx.get("hash") or "").lower(),
                        block_number=b,
                        block_time=block_time,
                        kind=TransferKind.NATIVE,
                        sub_id="",
                        from_address=frm,
                        to_address=to or None,
                        value_raw=value,
                        success=None,  # need receipt for status; skip for now
                        provider="infura",
                        fetched_at=fetched_at,
                    ))

            pages += 1
            if pages >= self.max_pages:
                complete = False
                break

        return Page(items=finalize(acc), complete=complete,
                    note=None if complete else f"stopped after {self.max_pages} chunks of {_NATIVE_CHUNK} blocks")
