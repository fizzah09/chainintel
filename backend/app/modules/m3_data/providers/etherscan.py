"""Etherscan V2 adapter (one API key, many EVM chains). Ported from legacy/wallet-graph-api/lib/etherscan.js.

Differences from the legacy client: full history via block-range paging (the old one stopped at the
latest 100 rows), exact integer amounts (the old one used floats), errors raised instead of
swallowed, and a token bucket plus retries instead of a fixed 350 ms sleep.

Licence: the free plan is for personal and research use only. Production needs Advanced or higher.
"""

from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

import httpx

from app.modules.m3_data.providers.base import (
    AuthError,
    BadResponseError,
    ChainDataProvider,
    Page,
    ProviderError,
    RateLimitedError,
    Transfer,
    TransferKind,
    UnsupportedChainError,
    finalize,
    normalize_address,
)
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket, request_json

BASE_URL = "https://api.etherscan.io/v2/api"
# Chains the legacy app offered; extend once the plan in use is confirmed to cover more.
DEFAULT_CHAINS = frozenset({1, 10, 56, 137, 8453, 42161, 11155111})
_ACTIONS = {
    TransferKind.NATIVE: "txlist",
    TransferKind.INTERNAL: "txlistinternal",
    TransferKind.ERC20: "tokentx",
}
_MAX_BLOCK = 999_999_999


def _now() -> datetime:
    return datetime.now(UTC)


def _int(v: Any, default: int | None = None) -> int | None:
    if v is None or v == "":
        return default
    s = str(v)
    return int(s, 16) if s.startswith("0x") else int(s)


def _addr(v: Any) -> str | None:
    return v.lower() if isinstance(v, str) and v else None


class EtherscanProvider(ChainDataProvider):
    name = "etherscan"

    def __init__(
        self,
        api_key: str,
        client: httpx.Client,
        limiter: TokenBucket,
        retry: RetryPolicy,
        *,
        chains: frozenset[int] = DEFAULT_CHAINS,
        page_size: int = 1000,
        max_pages: int = 20,
        timeout: float = 15.0,
        base_url: str = BASE_URL,
        clock: Callable[[], datetime] = _now,
    ):
        if not api_key:
            raise ValueError("Etherscan V2 needs an API key")
        self._key = api_key
        self._client = client
        self._limiter = limiter
        self._retry = retry
        self.chains = chains
        self.page_size = page_size
        self.max_pages = max_pages
        self._timeout = timeout
        self._url = base_url
        self._clock = clock

    def supports(self, chain_id: int, kind: TransferKind | None = None) -> bool:
        return chain_id in self.chains

    # ---- HTTP -----------------------------------------------------------------------------------

    @staticmethod
    def _check(body: Any) -> Any:
        if not isinstance(body, dict):
            raise BadResponseError("etherscan: unexpected response shape")
        if "status" not in body and "jsonrpc" in body:  # proxy module (eth_* calls)
            if "error" in body:
                raise ProviderError("etherscan: proxy call failed")
            return body.get("result")
        result = body.get("result")
        if body.get("status") == "1":
            return result
        text = f"{body.get('message', '')} {result if isinstance(result, str) else ''}".lower()
        if "no transactions found" in text or "no records found" in text:
            return []
        if "rate limit" in text:
            raise RateLimitedError("etherscan: rate limit reached")
        if "api key" in text or "apikey" in text:
            raise AuthError("etherscan: missing or invalid API key")
        if "not supported" in text or "chain" in text:
            raise UnsupportedChainError("etherscan: chain not available on this plan")
        raise ProviderError(f"etherscan: {text.strip()[:160] or 'unknown error'}")

    def _call(self, params: dict[str, Any]) -> Any:
        return request_json(
            self._client,
            "GET",
            self._url,
            params={**params, "apikey": self._key},
            provider=self.name,
            limiter=self._limiter,
            retry=self._retry,
            timeout=self._timeout,
            check=self._check,
        )

    # ---- API ------------------------------------------------------------------------------------

    def latest_block(self, chain_id: int) -> int:
        if not self.supports(chain_id):
            raise UnsupportedChainError(f"etherscan: chain {chain_id} not configured")
        result = self._call({"chainid": chain_id, "module": "proxy", "action": "eth_blockNumber"})
        try:
            return int(result, 16)
        except (TypeError, ValueError):
            raise BadResponseError("etherscan: bad block number") from None

    def eth_call(self, chain_id: int, to: str, data: str) -> str:
        if not self.supports(chain_id):
            raise UnsupportedChainError(f"etherscan: chain {chain_id} not configured")
        result = self._call(
            {"chainid": chain_id, "module": "proxy", "action": "eth_call", "to": normalize_address(to), "data": data, "tag": "latest"}
        )
        if not isinstance(result, str):
            raise BadResponseError("etherscan: bad eth_call result")
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
            raise UnsupportedChainError(f"etherscan: chain {chain_id} not configured")
        fetched_at = self._clock()
        end = to_block if to_block is not None else _MAX_BLOCK
        start = from_block
        acc: list[Transfer] = []

        # Etherscan caps page x offset at 10,000 rows, so page by block range: always ask for page 1
        # from `start`, then restart at the last block seen. That block is re-read in full and the
        # partial copy dropped, so no row is lost or double-counted at the boundary.
        for _ in range(self.max_pages):
            rows = self._call(
                {
                    "chainid": chain_id,
                    "module": "account",
                    "action": _ACTIONS[kind],
                    "address": address,
                    "startblock": start,
                    "endblock": end,
                    "page": 1,
                    "offset": self.page_size,
                    "sort": "asc",
                }
            )
            if not isinstance(rows, list):
                raise BadResponseError("etherscan: expected a list of rows")
            batch = [self._parse(r, chain_id, kind, fetched_at) for r in rows]
            acc = [t for t in acc if t.block_number < start] + batch
            if len(rows) < self.page_size:
                return Page(items=finalize(acc), complete=True)
            last = batch[-1].block_number
            if last == start:
                return Page(
                    items=finalize(acc),
                    complete=False,
                    note=f"block {last} has more than {self.page_size} rows; use a node or bulk source",
                )
            start = last
        return Page(items=finalize(acc), complete=False, note=f"stopped after {self.max_pages} pages")

    @staticmethod
    def _parse(r: dict, chain_id: int, kind: TransferKind, fetched_at: datetime) -> Transfer:
        try:
            frm = _addr(r.get("from")) or ""
            # Contract creation has an empty "to"; value then goes to the created contract.
            to = _addr(r.get("to"))
            if to is None and kind is not TransferKind.ERC20:
                to = _addr(r.get("contractAddress"))
            value = _int(r.get("value"), 0)
            ts = _int(r.get("timeStamp"))
            common = dict(
                chain_id=chain_id,
                tx_hash=r["hash"].lower(),
                block_number=_int(r["blockNumber"]),
                block_time=datetime.fromtimestamp(ts, UTC) if ts is not None else None,
                kind=kind,
                from_address=frm,
                to_address=to,
                value_raw=value,
                provider="etherscan",
                fetched_at=fetched_at,
            )
            if kind is TransferKind.NATIVE:
                return Transfer(**common, sub_id="", success=r.get("isError") != "1")
            if kind is TransferKind.INTERNAL:
                return Transfer(**common, sub_id=f"{frm}>{to}:{value}", success=r.get("isError") != "1")
            log_index = _int(r.get("logIndex"))
            token = _addr(r.get("contractAddress"))
            return Transfer(
                **common,
                sub_id=f"log:{log_index}" if log_index is not None else f"{token}:{frm}>{to}:{value}",
                token_address=token,
                token_symbol=r.get("tokenSymbol") or None,
                token_decimals=_int(r.get("tokenDecimal")),
                success=True,  # token events only exist for successful transactions
            )
        except (KeyError, TypeError, ValueError, AttributeError):
            raise BadResponseError(f"etherscan: malformed {kind.value} row") from None
