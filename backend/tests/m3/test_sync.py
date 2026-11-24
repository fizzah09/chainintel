"""M3.3 storage tests against real PostgreSQL (throwaway database). Run: pytest -m integration."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import func, select

from app.core.config import Settings
from app.modules.m3_data.models import AddressSyncState, ChainTransfer, FetchLog, Token
from app.modules.m3_data.providers.base import ChainDataProvider, Page, Transfer, TransferKind, TransientError
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.queries import load_history
from app.modules.m3_data.sync import TransferSync

pytestmark = pytest.mark.integration

W = "0x" + "a" * 40
X = "0x" + "b" * 40
USDC = "0x" + "c" * 40
SPAM = "0x" + "d" * 40
T0 = datetime(2026, 11, 17, 10, 0, tzinfo=UTC)


def tx(block, h, kind=TransferKind.NATIVE, value=1, frm=W, to=X, token=None, decimals=None, sub=""):
    return Transfer(
        chain_id=1, tx_hash=h, block_number=block, block_time=T0, kind=kind, sub_id=sub, from_address=frm,
        to_address=to, value_raw=value, token_address=token, token_symbol="TKN" if token else None,
        token_decimals=decimals, success=True, provider="fake", fetched_at=T0,
    )


class Scripted(ChainDataProvider):
    """Plays a fake chain. Tests edit `chain`, `head` and `down` between syncs."""

    name = "fake"

    def __init__(self, head, chain, decimals=None):
        self.head = head
        self.chain = chain
        self.decimals = decimals or {}
        self.down = False
        self.complete = True
        self.calls: list[tuple] = []

    def supports(self, chain_id, kind=None):
        return chain_id == 1

    def latest_block(self, chain_id):
        if self.down:
            raise TransientError("fake: HTTP 503")
        return self.head

    def eth_call(self, chain_id, to, data):
        if to not in self.decimals:
            raise TransientError("fake: execution reverted")
        return "0x" + format(self.decimals[to], "064x")

    def transfers(self, address, chain_id, kind, from_block=0, to_block=None):
        if self.down:
            raise TransientError("fake: HTTP 503")
        self.calls.append((kind, from_block, to_block))
        top = to_block if to_block is not None else self.head
        items = [
            t for t in self.chain
            if t.kind is kind and from_block <= t.block_number <= top and address in (t.from_address, t.to_address)
        ]
        return Page(items=items, complete=self.complete, note=None if self.complete else "page cap")


def make(db, provider, at=T0):
    clock = {"now": at}
    s = TransferSync(db, ProviderRouter([provider]), Settings(_env_file=None, default_confirmations=12), clock=lambda: clock["now"])
    return s, clock


def test_first_sync_stores_rows_with_provenance_and_confirmation_depth(db):
    p = Scripted(head=100, chain=[tx(80, "0x80", value=10**30 + 7), tx(95, "0x95")])
    sync, _ = make(db, p)
    report = sync.sync(W, 1, [TransferKind.NATIVE])

    assert report.head_block == 100 and report.safe_block == 88 and not report.stale
    (k,) = report.kinds
    assert (k.rows_fetched, k.rows_new, k.confirmed_to_block, k.complete) == (2, 2, 88, True)

    rows = {r.tx_hash: r for r in db.scalars(select(ChainTransfer))}
    assert int(rows["0x80"].value_raw) == 10**30 + 7  # exact through NUMERIC(78,0)
    assert rows["0x80"].confirmed and not rows["0x95"].confirmed
    log = db.get(FetchLog, rows["0x80"].fetch_id)
    assert (log.provider, log.head_block, log.safe_block, log.row_count) == ("fake", 100, 88, 2)
    assert rows["0x80"].provider == "fake" and rows["0x80"].fetched_at == T0


def test_resync_is_incremental_and_idempotent(db):
    p = Scripted(head=100, chain=[tx(80, "0x80"), tx(95, "0x95")])
    sync, clock = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])
    clock["now"] = T0 + timedelta(minutes=5)
    report = sync.sync(W, 1, [TransferKind.NATIVE])

    assert p.calls[1] == (TransferKind.NATIVE, 89, 100)  # restarts just above the confirmed block
    assert report.kinds[0].rows_new == 0
    assert db.scalar(select(func.count()).select_from(ChainTransfer)) == 2


def test_reorg_marks_vanished_rows_removed_and_as_of_still_sees_them(db):
    p = Scripted(head=100, chain=[tx(80, "0x80"), tx(95, "0x95old")])
    sync, clock = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])

    # Reorg: block 95's transaction is replaced by another one in block 96.
    p.head = 101
    p.chain = [tx(80, "0x80"), tx(96, "0x96new")]
    t1 = T0 + timedelta(minutes=1)
    clock["now"] = t1
    report = sync.sync(W, 1, [TransferKind.NATIVE])
    assert (report.kinds[0].rows_new, report.kinds[0].rows_removed) == (1, 1)

    now = [t.tx_hash for t in load_history(db, W, 1).items]
    before = [t.tx_hash for t in load_history(db, W, 1, as_of=T0 + timedelta(seconds=30)).items]
    assert now == ["0x80", "0x96new"]
    assert before == ["0x80", "0x95old"]  # what a score computed before the reorg actually saw
    assert db.scalar(select(func.count()).select_from(ChainTransfer)) == 3  # nothing deleted


def test_rows_become_confirmed_once_deep_enough_and_then_never_change(db):
    p = Scripted(head=100, chain=[tx(95, "0x95")])
    sync, clock = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])

    p.head = 120  # 95 is now 25 deep
    clock["now"] = T0 + timedelta(minutes=1)
    sync.sync(W, 1, [TransferKind.NATIVE])
    row = db.scalar(select(ChainTransfer))
    assert row.confirmed

    p.head = 130
    p.chain = []  # a provider glitch must not remove a confirmed row
    clock["now"] = T0 + timedelta(minutes=2)
    sync.sync(W, 1, [TransferKind.NATIVE])
    db.refresh(row)
    assert row.removed_at is None


def test_provider_outage_keeps_stored_data_and_flags_it_stale(db):
    p = Scripted(head=100, chain=[tx(80, "0x80")])
    sync, clock = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])

    p.down = True
    clock["now"] = T0 + timedelta(minutes=1)
    report = sync.sync(W, 1, [TransferKind.NATIVE])
    assert report.stale and report.head_block is None
    assert report.kinds[0].errors == ["fake: HTTP 503"]

    h = load_history(db, W, 1, [TransferKind.NATIVE])
    assert h.stale and [t.tx_hash for t in h.items] == ["0x80"]
    f = h.freshness[TransferKind.NATIVE]
    assert f.status == "stale" and f.last_success_at == T0 and f.confirmed_to_block == 88
    assert db.scalar(select(func.count()).select_from(FetchLog).where(FetchLog.stale)) == 1


def test_partial_fetch_removes_nothing_and_confirms_below_last_block(db):
    p = Scripted(head=100, chain=[tx(50, "0x50"), tx(60, "0x60")])
    sync, clock = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])  # confirmed to 88

    p.head = 200
    p.complete = False
    p.chain = [tx(150, "0x150")]  # pretend a page cap cut the answer at block 150
    clock["now"] = T0 + timedelta(minutes=1)
    report = sync.sync(W, 1, [TransferKind.NATIVE])
    k = report.kinds[0]
    assert k.rows_removed == 0 and not k.complete and k.confirmed_to_block == 149
    assert db.get(AddressSyncState, (1, W, "native")).status == "partial"


def test_token_decimals_come_from_the_contract(db):
    p = Scripted(
        head=100,
        chain=[
            tx(70, "0x70", kind=TransferKind.ERC20, token=USDC, decimals=18, sub="log:1", value=2_500_000),
            tx(71, "0x71", kind=TransferKind.ERC20, token=SPAM, decimals=9, sub="log:0"),
        ],
        decimals={USDC: 6},  # provider claimed 18; the contract says 6. SPAM cannot be read.
    )
    sync, _ = make(db, p)
    report = sync.sync(W, 1, [TransferKind.ERC20])
    assert report.tokens_checked == 2
    assert db.get(Token, (1, USDC)).decimals == 6 and db.get(Token, (1, SPAM)).decimals is None

    items = {t.tx_hash: t for t in load_history(db, W, 1, [TransferKind.ERC20]).items}
    assert (items["0x70"].decimals, items["0x70"].decimals_source) == (6, "contract")
    assert (items["0x71"].decimals, items["0x71"].decimals_source) == (9, "provider")


def test_history_reports_never_synced_kinds_as_stale(db):
    p = Scripted(head=100, chain=[tx(80, "0x80")])
    sync, _ = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])
    h = load_history(db, W, 1)
    assert h.stale
    assert h.freshness[TransferKind.NATIVE].status == "ok"
    assert h.freshness[TransferKind.ERC20].status == "never_synced"


def test_counterparty_sees_the_same_shared_row(db):
    p = Scripted(head=100, chain=[tx(80, "0x80", frm=W, to=X)])
    sync, _ = make(db, p)
    sync.sync(W, 1, [TransferKind.NATIVE])
    sync.sync(X, 1, [TransferKind.NATIVE])
    assert db.scalar(select(func.count()).select_from(ChainTransfer)) == 1
    assert [t.tx_hash for t in load_history(db, X, 1, [TransferKind.NATIVE]).items] == ["0x80"]
