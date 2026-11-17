"""Provider contract for M3. Every blockchain data source (Etherscan, Alchemy, own node) implements
`ChainDataProvider` and returns the same `Transfer` records, so the engines never depend on one vendor.

Amounts are kept as exact integers in the smallest unit (wei, or token base units). Never floats.
"""

import re
from abc import ABC, abstractmethod
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict

_ADDRESS = re.compile(r"^0x[0-9a-f]{40}$")


def normalize_address(address: str) -> str:
    a = address.strip().lower()
    if not _ADDRESS.match(a):
        raise ValueError("address must be 0x followed by 40 hex characters")
    return a


class TransferKind(StrEnum):
    NATIVE = "native"  # top-level transaction (ETH, POL, BNB ...), including zero-value contract calls
    INTERNAL = "internal"  # value moved by a contract during execution
    ERC20 = "erc20"  # token Transfer event


class Transfer(BaseModel):
    """One value movement, normalised across providers."""

    model_config = ConfigDict(frozen=True)

    chain_id: int
    tx_hash: str
    block_number: int
    block_time: datetime | None
    kind: TransferKind
    # Distinguishes several transfers inside one transaction: "" for native, "log:<n>" for a token
    # event with a known log index, otherwise "<from>><to>:<value>#<occurrence>".
    sub_id: str
    from_address: str
    to_address: str | None  # created contract for a deployment; None if the provider does not say
    value_raw: int
    token_address: str | None = None
    token_symbol: str | None = None
    token_decimals: int | None = None  # as reported by the provider; verified against the contract in M3.3
    success: bool | None = None  # None when the provider does not say (Alchemy)
    provider: str
    fetched_at: datetime

    @property
    def key(self) -> tuple[int, str, str, str]:
        """Provider-independent identity, used to de-duplicate."""
        return (self.chain_id, self.tx_hash, self.kind.value, self.sub_id)


class Page(BaseModel):
    items: list[Transfer]
    # False when a page or size limit stopped the fetch: the caller must not treat the history as whole.
    complete: bool
    note: str | None = None


# ---- errors -------------------------------------------------------------------------------------
# Messages never contain API keys or full URLs.


class ProviderError(Exception):
    """Non-retryable provider failure. The router moves on to the next provider."""


class TransientError(ProviderError):
    """Timeout, network error, 5xx or bad gateway body: worth retrying."""


class RateLimitedError(TransientError):
    def __init__(self, message: str, retry_after: float | None = None):
        super().__init__(message)
        self.retry_after = retry_after


class AuthError(ProviderError):
    """Missing or invalid API key, or plan does not allow the call."""


class UnsupportedChainError(ProviderError):
    """Provider (or the configured plan) does not cover this chain or transfer kind."""


class BadResponseError(ProviderError):
    """Provider answered with something that does not match its documented format."""


class ChainDataProvider(ABC):
    name: str

    @abstractmethod
    def supports(self, chain_id: int, kind: TransferKind | None = None) -> bool: ...

    @abstractmethod
    def latest_block(self, chain_id: int) -> int: ...

    @abstractmethod
    def eth_call(self, chain_id: int, to: str, data: str) -> str:
        """Read-only contract call at the latest block; returns the raw hex result."""

    @abstractmethod
    def transfers(
        self,
        address: str,
        chain_id: int,
        kind: TransferKind,
        from_block: int = 0,
        to_block: int | None = None,
    ) -> Page:
        """All transfers of `kind` where `address` is sender or receiver, oldest first."""


DECIMALS_SELECTOR = "0x313ce567"  # keccak("decimals()")[:4]


def decode_decimals(result: str | None) -> int | None:
    """ERC-20 decimals() returns a uint8 padded to 32 bytes. Anything else means "unknown"."""
    if not isinstance(result, str) or not result.startswith("0x") or len(result) != 66:
        return None
    try:
        value = int(result, 16)
    except ValueError:
        return None
    return value if 0 <= value <= 255 else None


def finalize(items: list[Transfer]) -> list[Transfer]:
    """Give transfers without an exact sub-id a stable occurrence number, de-duplicate, sort.

    Must be called on every row of a block at once, which both adapters guarantee by re-reading the
    boundary block when they page.
    """
    counts: dict[tuple, int] = {}
    out: dict[tuple, Transfer] = {}
    for t in items:
        if t.kind is not TransferKind.NATIVE and not t.sub_id.startswith("log:") and "#" not in t.sub_id:
            k = (t.chain_id, t.tx_hash, t.kind, t.sub_id)
            n = counts.get(k, 0)
            counts[k] = n + 1
            t = t.model_copy(update={"sub_id": f"{t.sub_id}#{n}"})
        out.setdefault(t.key, t)
    return sorted(out.values(), key=lambda t: (t.block_number, t.tx_hash, t.kind.value, t.sub_id))
