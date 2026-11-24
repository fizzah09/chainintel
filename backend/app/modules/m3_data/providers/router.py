"""Tries providers in order. One provider failing never blocks scoring: the next one is used, and if
all fail the result is marked stale (M3.3 then serves the last stored data with that flag)."""

from collections.abc import Callable
from datetime import UTC, datetime

from pydantic import BaseModel

from app.modules.m3_data.providers.base import (
    DECIMALS_SELECTOR,
    ChainDataProvider,
    decode_decimals,
    ProviderError,
    Transfer,
    TransientError,
    TransferKind,
    normalize_address,
)


def _now() -> datetime:
    return datetime.now(UTC)


class FetchResult(BaseModel):
    chain_id: int
    address: str
    kind: TransferKind
    from_block: int
    to_block: int | None
    items: list[Transfer]
    provider: str | None  # which provider answered; None when all failed
    fetched_at: datetime
    complete: bool  # False: a page limit stopped the fetch, history is partial
    stale: bool  # True: no provider answered, `items` is empty
    note: str | None = None
    errors: list[str] = []  # failures of providers tried before the one that answered


class ProviderRouter:
    def __init__(self, providers: list[ChainDataProvider], clock: Callable[[], datetime] = _now):
        self.providers = providers
        self._clock = clock

    @property
    def names(self) -> list[str]:
        return [p.name for p in self.providers]

    def fetch_transfers(
        self,
        address: str,
        chain_id: int,
        kind: TransferKind,
        from_block: int = 0,
        to_block: int | None = None,
    ) -> FetchResult:
        address = normalize_address(address)
        errors: list[str] = []
        for p in self.providers:
            if not p.supports(chain_id, kind):
                errors.append(f"{p.name}: {kind.value} on chain {chain_id} not supported")
                continue
            try:
                page = p.transfers(address, chain_id, kind, from_block, to_block)
            except ProviderError as exc:
                errors.append(str(exc))
                continue
            return FetchResult(
                chain_id=chain_id,
                address=address,
                kind=kind,
                from_block=from_block,
                to_block=to_block,
                items=page.items,
                provider=p.name,
                fetched_at=page.items[0].fetched_at if page.items else self._clock(),
                complete=page.complete,
                stale=False,
                note=page.note,
                errors=errors,
            )
        return FetchResult(
            chain_id=chain_id,
            address=address,
            kind=kind,
            from_block=from_block,
            to_block=to_block,
            items=[],
            provider=None,
            fetched_at=self._clock(),
            complete=False,
            stale=True,
            errors=errors or ["no providers configured"],
        )

    def call(self, chain_id: int, to: str, data: str) -> tuple[str, str]:
        """(result, provider) of a read-only contract call. If every provider fails, raises the last
        error: TransientError means "could not reach anyone", any other ProviderError means the call
        itself failed (for example the contract reverted)."""
        definite: ProviderError | None = None
        transient: TransientError | None = None
        for p in self.providers:
            if not p.supports(chain_id):
                continue
            try:
                return p.eth_call(chain_id, to, data), p.name
            except TransientError as exc:
                transient = exc
            except ProviderError as exc:
                definite = exc
        # A definite answer (a revert) from any provider beats an outage of another.
        raise definite or transient or ProviderError(f"no provider supports chain {chain_id}")

    def token_decimals(self, chain_id: int, token: str) -> tuple[int | None, str | None]:
        """(decimals, provider) read from the token contract. (None, None) if no provider could read it."""
        token = normalize_address(token)
        for p in self.providers:
            if not p.supports(chain_id):
                continue
            try:
                decimals = decode_decimals(p.eth_call(chain_id, token, DECIMALS_SELECTOR))
            except ProviderError:
                continue
            if decimals is not None:
                return decimals, p.name
        return None, None

    def latest_block(self, chain_id: int) -> tuple[int | None, str | None, list[str]]:
        """(block, provider, errors). Block is None when every provider failed."""
        errors: list[str] = []
        for p in self.providers:
            if not p.supports(chain_id):
                continue
            try:
                return p.latest_block(chain_id), p.name, errors
            except ProviderError as exc:
                errors.append(str(exc))
        return None, None, errors or ["no provider supports this chain"]
