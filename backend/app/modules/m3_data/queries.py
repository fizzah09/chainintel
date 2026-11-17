"""Read stored transfers. The engines (M4 to M7) read through here, never from providers.

`as_of` rebuilds what the system knew at a past moment: rows first seen after it are hidden, and rows
removed by a reorg after it are shown again. That is what makes an old score reproducible.
"""

from collections.abc import Iterable
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.modules.m3_data.models import AddressSyncState, ChainTransfer, Token
from app.modules.m3_data.providers.base import TransferKind, normalize_address
from app.modules.m3_data.sync import ALL_KINDS


class StoredTransfer(BaseModel):
    chain_id: int
    tx_hash: str
    kind: TransferKind
    sub_id: str
    block_number: int
    block_time: datetime | None
    from_address: str
    to_address: str | None
    value_raw: int
    token_address: str | None
    token_symbol: str | None
    decimals: int | None  # native: 18; token: from the contract if read, else the provider's value
    decimals_source: str | None  # "native" | "contract" | "provider" | None
    success: bool | None
    confirmed: bool
    provider: str
    fetched_at: datetime
    fetch_id: int


class KindFreshness(BaseModel):
    status: str  # ok | partial | stale | never_synced
    confirmed_to_block: int | None = None
    last_success_at: datetime | None = None
    last_provider: str | None = None
    errors: list[str] = []


class AddressHistory(BaseModel):
    chain_id: int
    address: str
    as_of: datetime | None
    # True when any kind could not be refreshed on its last attempt, or was never synced:
    # the items are the best stored data, not a fresh read.
    stale: bool
    freshness: dict[TransferKind, KindFreshness]
    total: int  # rows matching, before limit/offset
    items: list[StoredTransfer]


def load_history(
    db: Session,
    address: str,
    chain_id: int,
    kinds: Iterable[TransferKind] = ALL_KINDS,
    as_of: datetime | None = None,
    limit: int | None = None,
    offset: int = 0,
    newest_first: bool = False,
) -> AddressHistory:
    address = normalize_address(address)
    kinds = tuple(kinds)

    conds = [
        ChainTransfer.chain_id == chain_id,
        ChainTransfer.kind.in_([k.value for k in kinds]),
        or_(ChainTransfer.from_address == address, ChainTransfer.to_address == address),
    ]
    if as_of is None:
        conds.append(ChainTransfer.removed_at.is_(None))
    else:
        conds += [
            ChainTransfer.first_seen_at <= as_of,
            or_(ChainTransfer.removed_at.is_(None), ChainTransfer.removed_at > as_of),
        ]
    total = db.scalar(select(func.count()).select_from(ChainTransfer).where(*conds))

    order = [ChainTransfer.block_number, ChainTransfer.tx_hash, ChainTransfer.kind, ChainTransfer.sub_id]
    q = (
        select(ChainTransfer, Token.decimals)
        .outerjoin(
            Token,
            and_(
                Token.chain_id == ChainTransfer.chain_id,
                Token.address == ChainTransfer.token_address,
                *([Token.checked_at <= as_of] if as_of is not None else []),
            ),
        )
        .where(*conds)
        .order_by(*[c.desc() for c in order] if newest_first else order)
        .offset(offset)
    )
    if limit is not None:
        q = q.limit(limit)

    items = []
    for row, contract_decimals in db.execute(q):
        if row.kind != TransferKind.ERC20:
            decimals, source = 18, "native"
        elif contract_decimals is not None:
            decimals, source = contract_decimals, "contract"
        elif row.token_decimals_reported is not None:
            decimals, source = row.token_decimals_reported, "provider"
        else:
            decimals, source = None, None
        items.append(
            StoredTransfer(
                chain_id=row.chain_id, tx_hash=row.tx_hash, kind=TransferKind(row.kind), sub_id=row.sub_id,
                block_number=row.block_number, block_time=row.block_time, from_address=row.from_address,
                to_address=row.to_address, value_raw=int(row.value_raw), token_address=row.token_address,
                token_symbol=row.token_symbol, decimals=decimals, decimals_source=source, success=row.success,
                confirmed=row.confirmed, provider=row.provider, fetched_at=row.fetched_at, fetch_id=row.fetch_id,
            )
        )

    states = {
        s.kind: s
        for s in db.scalars(
            select(AddressSyncState).where(AddressSyncState.chain_id == chain_id, AddressSyncState.address == address)
        )
    }
    freshness = {}
    for k in kinds:
        s = states.get(k.value)
        freshness[k] = (
            KindFreshness(status="never_synced")
            if s is None
            else KindFreshness(
                status=s.status, confirmed_to_block=s.confirmed_to_block, last_success_at=s.last_success_at,
                last_provider=s.last_provider, errors=s.last_errors,
            )
        )
    stale = any(f.status in ("stale", "never_synced") for f in freshness.values())
    return AddressHistory(
        chain_id=chain_id, address=address, as_of=as_of, stale=stale, freshness=freshness, total=total, items=items
    )
