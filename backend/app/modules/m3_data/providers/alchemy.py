"""Alchemy adapter: JSON-RPC plus alchemy_getAssetTransfers. Second source behind Etherscan.

Notes:
- `internal` transfers are only offered on Ethereum and Polygon mainnet.
- Alchemy does not report whether a transaction failed, so `success` is None.
- The API key is part of the URL, so URLs never appear in errors or logs (see resilience.request_json).
"""

from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any

import httpx

from app.modules.m3_data.providers.base import (
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

NETWORKS = {
    1: "eth-mainnet",
    11155111: "eth-sepolia",
    137: "polygon-mainnet",
    42161: "arb-mainnet",
    10: "opt-mainnet",
    8453: "base-mainnet",
}
INTERNAL_CHAINS = frozenset({1, 137})
_CATEGORY = {TransferKind.NATIVE: "external", TransferKind.INTERNAL: "internal", TransferKind.ERC20: "erc20"}


def _now() -> datetime:
    return datetime.now(UTC)


def _hex(v: Any) -> int | None:
    if v is None or v == "":
        return None
    return int(v, 16) if isinstance(v, str) and v.startswith("0x") else int(v)


def _addr(v: Any) -> str | None:
    return v.lower() if isinstance(v, str) and v else None


class AlchemyProvider(ChainDataProvider):
    name = "alchemy"

    def __init__(
        self,
        api_key: str,
        client: httpx.Client,
        limiter: TokenBucket,
        retry: RetryPolicy,
        *,
        page_size: int = 1000,
        max_pages: int = 20,
        timeout: float = 15.0,
        url_template: str = "https://{network}.g.alchemy.com/v2/{key}",
        clock: Callable[[], datetime] = _now,
    ):
        if not api_key:
            raise ValueError("Alchemy needs an API key")
        self._key = api_key
        self._client = client
        self._limiter = limiter
        self._retry = retry
        self.page_size = min(page_size, 1000)  # Alchemy's maximum
        self.max_pages = max_pages
        self._timeout = timeout
        self._url_template = url_template
        self._clock = clock

    def supports(self, chain_id: int, kind: TransferKind | None = None) -> bool:
        if chain_id not in NETWORKS:
            return False
        return kind is not TransferKind.INTERNAL or chain_id in INTERNAL_CHAINS

    @staticmethod
    def _check(body: Any) -> Any:
        if not isinstance(body, dict):
            raise BadResponseError("alchemy: unexpected response shape")
        err = body.get("error")
        if err:
            code = err.get("code") if isinstance(err, dict) else None
            msg = str(err.get("message", "") if isinstance(err, dict) else err).lower()
            if code == 429 or "rate" in msg or "capacity" in msg or "throughput" in msg:
                raise RateLimitedError("alchemy: rate limit reached")
            raise ProviderError(f"alchemy: rpc error {code}")
        if "result" not in body:
            raise BadResponseError("alchemy: response has no result")
        return body["result"]

    def _rpc(self, chain_id: int, method: str, params: list) -> Any:
        url = self._url_template.format(network=NETWORKS[chain_id], key=self._key)
        return request_json(
            self._client,
            "POST",
            url,
            json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params},
            provider=self.name,
            limiter=self._limiter,
            retry=self._retry,
            timeout=self._timeout,
            check=self._check,
        )

    def latest_block(self, chain_id: int) -> int:
        if not self.supports(chain_id):
            raise UnsupportedChainError(f"alchemy: chain {chain_id} not supported")
        try:
            return int(self._rpc(chain_id, "eth_blockNumber", []), 16)
        except (TypeError, ValueError):
            raise BadResponseError("alchemy: bad block number") from None

    def eth_call(self, chain_id: int, to: str, data: str) -> str:
        if not self.supports(chain_id):
            raise UnsupportedChainError(f"alchemy: chain {chain_id} not supported")
        result = self._rpc(chain_id, "eth_call", [{"to": normalize_address(to), "data": data}, "latest"])
        if not isinstance(result, str):
            raise BadResponseError("alchemy: bad eth_call result")
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
            raise UnsupportedChainError(f"alchemy: {kind.value} transfers not offered on chain {chain_id}")
        fetched_at = self._clock()
        merged: dict[tuple, Transfer] = {}
        complete = True
        # Alchemy filters by sender or receiver, not both, so ask twice. Each direction is finalised
        # on its own, then merged by key: a self-transfer appears in both and is kept once.
        for direction in ("fromAddress", "toAddress"):
            rows: list[Transfer] = []
            page_key: str | None = None
            for _ in range(self.max_pages):
                params: dict[str, Any] = {
                    "fromBlock": hex(from_block),
                    "toBlock": hex(to_block) if to_block is not None else "latest",
                    direction: address,
                    "category": [_CATEGORY[kind]],
                    "withMetadata": True,
                    "excludeZeroValue": False,
                    "maxCount": hex(self.page_size),
                    "order": "asc",
                }
                if page_key:
                    params["pageKey"] = page_key
                result = self._rpc(chain_id, "alchemy_getAssetTransfers", [params])
                if not isinstance(result, dict) or not isinstance(result.get("transfers"), list):
                    raise BadResponseError("alchemy: expected transfers list")
                rows += [self._parse(t, chain_id, kind, fetched_at) for t in result["transfers"]]
                page_key = result.get("pageKey")
                if not page_key:
                    break
            else:
                complete = False
            for t in finalize(rows):
                merged.setdefault(t.key, t)
        items = sorted(merged.values(), key=lambda t: (t.block_number, t.tx_hash, t.kind.value, t.sub_id))
        return Page(items=items, complete=complete, note=None if complete else f"stopped after {self.max_pages} pages")

    @staticmethod
    def _parse(t: dict, chain_id: int, kind: TransferKind, fetched_at: datetime) -> Transfer:
        try:
            raw = t.get("rawContract") or {}
            frm = _addr(t.get("from")) or ""
            to = _addr(t.get("to"))
            value = _hex(raw.get("value")) or 0
            ts = (t.get("metadata") or {}).get("blockTimestamp")
            unique = str(t.get("uniqueId", ""))
            common = dict(
                chain_id=chain_id,
                tx_hash=t["hash"].lower(),
                block_number=_hex(t["blockNum"]),
                block_time=datetime.fromisoformat(ts.replace("Z", "+00:00")) if ts else None,
                kind=kind,
                from_address=frm,
                to_address=to,
                value_raw=value,
                provider="alchemy",
                fetched_at=fetched_at,
            )
            if kind is TransferKind.NATIVE:
                return Transfer(**common, sub_id="")
            if kind is TransferKind.INTERNAL:
                return Transfer(**common, sub_id=f"{frm}>{to}:{value}")
            token = _addr(raw.get("address"))
            parts = unique.split(":")
            log_index = int(parts[2]) if len(parts) == 3 and parts[1] == "log" else None
            return Transfer(
                **common,
                sub_id=f"log:{log_index}" if log_index is not None else f"{token}:{frm}>{to}:{value}",
                token_address=token,
                token_symbol=t.get("asset") or None,
                token_decimals=_hex(raw.get("decimal")),
                success=True,
            )
        except (KeyError, TypeError, ValueError, AttributeError):
            raise BadResponseError(f"alchemy: malformed {kind.value} transfer") from None
