"""Fetch an address's transfers through the provider router and store them with provenance.

Rules (from the bank-readiness checklist):
- Every row keeps provider, fetch time, fetch id and block number.
- Blocks above head - depth are unconfirmed. Each sync re-reads from the last confirmed block, so
  unconfirmed rows are refreshed; rows that vanished in a reorg are marked removed, never deleted.
- A provider outage never blocks: the sync records a stale fetch and the stored data stays usable.
- Running the same sync twice changes nothing (idempotent upsert on the transfer identity).
"""

from collections.abc import Callable, Iterable
from datetime import UTC, datetime

from pydantic import BaseModel
from sqlalchemy import func, or_, select, tuple_, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.modules.m3_data.models import AddressSyncState, ChainTransfer, FetchLog, Token
from app.modules.m3_data.providers.base import Transfer, TransferKind, normalize_address
from app.modules.m3_data.providers.router import FetchResult, ProviderRouter

ALL_KINDS: tuple[TransferKind, ...] = tuple(TransferKind)
_CHUNK = 1000


def _now() -> datetime:
    return datetime.now(UTC)


class KindReport(BaseModel):
    kind: TransferKind
    provider: str | None
    from_block: int
    rows_fetched: int = 0
    rows_new: int = 0
    rows_removed: int = 0
    complete: bool = False
    stale: bool = False
    confirmed_to_block: int | None = None
    note: str | None = None
    errors: list[str] = []


class SyncReport(BaseModel):
    chain_id: int
    address: str
    synced_at: datetime
    head_block: int | None
    safe_block: int | None
    stale: bool
    kinds: list[KindReport]
    tokens_checked: int = 0


class TransferSync:
    def __init__(
        self,
        session: Session,
        router: ProviderRouter,
        settings: Settings,
        clock: Callable[[], datetime] = _now,
    ):
        self.db = session
        self.router = router
        self.settings = settings
        self.clock = clock

    def sync(self, address: str, chain_id: int, kinds: Iterable[TransferKind] = ALL_KINDS) -> SyncReport:
        address = normalize_address(address)
        kinds = tuple(kinds)
        # One sync per chain+address at a time (held until commit), so two requests for the same
        # wallet cannot race on its sync state. Other wallets sync in parallel.
        self.db.execute(select(func.pg_advisory_xact_lock(func.hashtextextended(f"m3sync:{chain_id}:{address}", 0))))
        now = self.clock()
        head, _, head_errors = self.router.latest_block(chain_id)

        if head is None:
            reports = [self._record_stale(address, chain_id, k, now, head_errors) for k in kinds]
            self.db.commit()
            return SyncReport(
                chain_id=chain_id, address=address, synced_at=now, head_block=None, safe_block=None, stale=True, kinds=reports
            )

        safe = head - self.settings.confirmations_for(chain_id)
        reports: list[KindReport] = []
        tokens: set[str] = set()
        for kind in kinds:
            state = self._state(address, chain_id, kind)
            start = state.confirmed_to_block + 1 if state.confirmed_to_block is not None else 0
            result = self.router.fetch_transfers(address, chain_id, kind, from_block=start, to_block=head)
            log = self._log(result, head, safe, now)
            state.last_attempt_at = now
            state.last_errors = result.errors
            if result.stale:
                state.status = "stale"
                reports.append(
                    KindReport(kind=kind, provider=None, from_block=start, stale=True,
                               confirmed_to_block=state.confirmed_to_block, errors=result.errors)
                )
                continue

            new = self._upsert(result.items, log.id, safe, now)
            removed = 0
            if result.complete:
                # Only a complete answer can prove a row is gone; a truncated one cannot.
                removed = self._mark_removed(address, chain_id, kind, start, result.items, now)
                confirmed_to = safe
            else:
                top = max((t.block_number for t in result.items), default=None)
                # The last block of a truncated fetch may be partial, so stop one below it.
                confirmed_to = min(safe, top - 1) if top is not None else None
            if confirmed_to is not None and (state.confirmed_to_block is None or confirmed_to > state.confirmed_to_block):
                state.confirmed_to_block = confirmed_to
            state.status = "ok" if result.complete else "partial"
            state.last_success_at = now
            state.last_provider = result.provider
            tokens |= {t.token_address for t in result.items if t.token_address}
            reports.append(
                KindReport(
                    kind=kind, provider=result.provider, from_block=start, rows_fetched=len(result.items),
                    rows_new=new, rows_removed=removed, complete=result.complete,
                    confirmed_to_block=state.confirmed_to_block, note=result.note, errors=result.errors,
                )
            )

        checked = self._check_tokens(chain_id, tokens, now)
        self.db.commit()
        return SyncReport(
            chain_id=chain_id, address=address, synced_at=now, head_block=head, safe_block=safe,
            stale=any(r.stale for r in reports), kinds=reports, tokens_checked=checked,
        )

    # ---- helpers ------------------------------------------------------------------------------

    def _state(self, address: str, chain_id: int, kind: TransferKind) -> AddressSyncState:
        state = self.db.get(AddressSyncState, (chain_id, address, kind.value))
        if state is None:
            state = AddressSyncState(chain_id=chain_id, address=address, kind=kind.value, status="stale", last_errors=[])
            self.db.add(state)
        return state

    def _record_stale(self, address: str, chain_id: int, kind: TransferKind, now: datetime, errors: list[str]) -> KindReport:
        state = self._state(address, chain_id, kind)
        start = state.confirmed_to_block + 1 if state.confirmed_to_block is not None else 0
        state.status = "stale"
        state.last_attempt_at = now
        state.last_errors = errors
        self.db.add(
            FetchLog(chain_id=chain_id, address=address, kind=kind.value, from_block=start, fetched_at=now,
                     row_count=0, complete=False, stale=True, note="latest block unavailable", errors=errors)
        )
        return KindReport(kind=kind, provider=None, from_block=start, stale=True,
                          confirmed_to_block=state.confirmed_to_block, errors=errors)

    def _log(self, r: FetchResult, head: int, safe: int, now: datetime) -> FetchLog:
        log = FetchLog(
            chain_id=r.chain_id, address=r.address, kind=r.kind.value, from_block=r.from_block, to_block=r.to_block,
            head_block=head, safe_block=safe, provider=r.provider, fetched_at=r.fetched_at if r.provider else now,
            row_count=len(r.items), complete=r.complete, stale=r.stale, note=r.note, errors=r.errors,
        )
        self.db.add(log)
        self.db.flush()
        return log

    def _upsert(self, items: list[Transfer], fetch_id: int, safe: int, now: datetime) -> int:
        """Insert new rows; refresh rows that are still unconfirmed or were marked removed.
        Confirmed rows are never rewritten. Returns how many rows were new."""
        new = 0
        for i in range(0, len(items), _CHUNK):
            rows = [
                dict(
                    chain_id=t.chain_id, tx_hash=t.tx_hash, kind=t.kind.value, sub_id=t.sub_id,
                    block_number=t.block_number, block_time=t.block_time, from_address=t.from_address,
                    to_address=t.to_address, value_raw=t.value_raw, token_address=t.token_address,
                    token_symbol=t.token_symbol, token_decimals_reported=t.token_decimals, success=t.success,
                    provider=t.provider, fetched_at=t.fetched_at, fetch_id=fetch_id, first_seen_at=now,
                    confirmed=t.block_number <= safe, removed_at=None,
                )
                for t in items[i : i + _CHUNK]
            ]
            stmt = pg_insert(ChainTransfer).values(rows)
            ex = stmt.excluded
            stmt = stmt.on_conflict_do_update(
                constraint="uq_chain_transfers_identity",
                set_={
                    "block_number": ex.block_number,
                    "block_time": ex.block_time,
                    "success": ex.success,
                    "confirmed": ex.confirmed,
                    "removed_at": None,
                },
                where=or_(ChainTransfer.confirmed.is_(False), ChainTransfer.removed_at.is_not(None)),
            ).returning(ChainTransfer.first_seen_at)
            new += sum(1 for (seen,) in self.db.execute(stmt) if seen == now)
        return new

    def _mark_removed(
        self, address: str, chain_id: int, kind: TransferKind, start: int, items: list[Transfer], now: datetime
    ) -> int:
        stmt = update(ChainTransfer).where(
            ChainTransfer.chain_id == chain_id,
            ChainTransfer.kind == kind.value,
            or_(ChainTransfer.from_address == address, ChainTransfer.to_address == address),
            ChainTransfer.block_number >= start,
            ChainTransfer.confirmed.is_(False),
            ChainTransfer.removed_at.is_(None),
        )
        if items:
            stmt = stmt.where(tuple_(ChainTransfer.tx_hash, ChainTransfer.sub_id).not_in([(t.tx_hash, t.sub_id) for t in items]))
        return self.db.execute(stmt.values(removed_at=now)).rowcount

    def _check_tokens(self, chain_id: int, addresses: set[str], now: datetime) -> int:
        if not addresses:
            return 0
        known = set(
            self.db.scalars(
                select(Token.address).where(Token.chain_id == chain_id, Token.address.in_(addresses), Token.decimals.is_not(None))
            )
        )
        todo = sorted(addresses - known)[: self.settings.max_token_checks_per_sync]
        for token in todo:
            decimals, provider = self.router.token_decimals(chain_id, token)
            self.db.merge(Token(chain_id=chain_id, address=token, decimals=decimals, provider=provider, checked_at=now))
        return len(todo)
