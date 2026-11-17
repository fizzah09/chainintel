"""M4.2 prices: Chainlink history search, CoinGecko parsing (offline) and the price store (PostgreSQL)."""

import json
from datetime import UTC, date, datetime
from decimal import Decimal

import httpx
import pytest

from app.core.config import Settings
from app.modules.m3_data.prices.chainlink import GET_ROUND, LATEST, ChainlinkReader
from app.modules.m3_data.prices.coingecko import CoinGecko
from app.modules.m3_data.prices.registry import CHAINLINK_FEEDS, AssetRef, resolve
from app.modules.m3_data.prices.service import PriceService
from app.modules.m3_data.providers.base import ProviderError, TransientError
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket

ETH_FEED = CHAINLINK_FEEDS["ETH"]


def enc(phase: int, n: int, answer: int, updated: int) -> str:
    words = [(phase << 64) | n, answer, updated, updated, (phase << 64) | n]
    return "0x" + "".join(format(w, "064x") for w in words)


class FakeFeed:
    """Two phases. Phase 1: rounds 1..1000 every 100 s from t=10,000. Phase 2: rounds 1..500 every
    100 s from t=500,000. Price = round number (in dollars) + 1000 * phase."""

    providers = [object()]

    def __init__(self, down=False):
        self.calls = 0
        self.down = down
        self.phases = {1: (10_000, 1000), 2: (500_000, 500)}

    def call(self, chain_id, to, data):
        self.calls += 1
        if self.down:
            raise TransientError("fake: HTTP 503")
        return self._answer(data), "fake"

    def _answer(self, data):
        if data == LATEST:
            return self._round(2, 500)
        rid = int(data[len(GET_ROUND):], 16)
        phase, n = rid >> 64, rid & ((1 << 64) - 1)
        if phase not in self.phases:
            raise ProviderError("fake: execution reverted")
        start, last = self.phases[phase]
        if not 1 <= n <= last:
            return enc(phase, n, 0, 0)
        return self._round(phase, n)

    def _round(self, phase, n):
        start, _ = self.phases[phase]
        return enc(phase, n, (n + 1000 * phase) * 10**8, start + (n - 1) * 100)


def test_chainlink_finds_the_round_in_force_at_a_time():
    feed = FakeFeed()
    r = ChainlinkReader(feed)
    hit = r.price_at(ETH_FEED, 500_000 + 250 * 100 + 50)  # between phase-2 rounds 251 and 252
    assert (hit.phase, hit.n, hit.usd()) == (2, 251, Decimal("2251"))
    assert feed.calls < 20  # interpolation search, not a scan


def test_chainlink_falls_back_to_the_previous_phase_and_handles_edges():
    r = ChainlinkReader(FakeFeed())
    gap = r.price_at(ETH_FEED, 400_000)  # after phase 1 ended, before phase 2 began
    assert (gap.phase, gap.n) == (1, 1000)
    mid = r.price_at(ETH_FEED, 10_000 + 99 * 100)
    assert (mid.phase, mid.n) == (1, 100)
    assert r.price_at(ETH_FEED, 5_000) is None  # before the feed existed
    assert r.price_at(ETH_FEED, 10**12).n == 500  # after the latest update: latest


def test_chainlink_outage_and_budget_raise_transient():
    with pytest.raises(TransientError):
        ChainlinkReader(FakeFeed(down=True)).price_at(ETH_FEED, 600_000)
    with pytest.raises(TransientError, match="budget"):
        ChainlinkReader(FakeFeed(), max_calls=3).price_at(ETH_FEED, 400_000)


def test_coingecko_takes_each_days_last_quote():
    day = lambda d, h: int(datetime(2026, 11, d, h, tzinfo=UTC).timestamp() * 1000)  # noqa: E731
    seen = {}

    def handler(req):
        seen["url"] = str(req.url)
        return httpx.Response(200, json={"prices": [[day(14, 0), 1700.5], [day(14, 23), 1750.25], [day(15, 0), 1800], [day(18, 0), 9]]})

    cg = CoinGecko(httpx.Client(transport=httpx.MockTransport(handler)), TokenBucket(1000), RetryPolicy(sleep=lambda s: None))
    out = cg.daily_usd(("contract", "ethereum", "0x" + "c" * 40), date(2026, 11, 14), date(2026, 11, 15))
    assert {d: (str(v[0]), v[2]) for d, v in out.items()} == {
        date(2026, 11, 14): ("1750.25", "coingecko:ethereum:0x" + "c" * 40),
        date(2026, 11, 15): ("1800", "coingecko:ethereum:0x" + "c" * 40),
    }
    assert "/coins/ethereum/contract/0x" in seen["url"] and "vs_currency=usd" in seen["url"]


def test_registry_resolves_native_known_and_unknown_tokens():
    assert resolve(AssetRef(8453, None)).key == "ETH"  # Base's native coin is ETH: same feed
    assert resolve(AssetRef(1, "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599")).chainlink_feed == CHAINLINK_FEEDS["BTC"]
    other = resolve(AssetRef(137, "0x" + "a" * 40))
    assert other.key == f"erc20:137:0x{'a' * 40}" and other.chainlink_feed is None and other.coingecko[1] == "polygon-pos"
    assert resolve(AssetRef(11155111, None)) is None  # testnet coin has no price


# ---- price store (PostgreSQL) ---------------------------------------------------------------------


class FakeCoinGecko:
    def __init__(self):
        self.calls = 0

    def daily_usd(self, ref, start, end):
        self.calls += 1
        return {date(2026, 11, 14): (Decimal("0.5"), datetime(2026, 11, 14, 23, tzinfo=UTC), f"coingecko:{ref[-1]}")}


@pytest.mark.integration
def test_price_service_prefers_chainlink_falls_back_and_reuses_stored_rows(db):
    feed, cg = FakeFeed(), FakeCoinGecko()
    now = datetime(2026, 11, 17, tzinfo=UTC)
    svc = PriceService(db, feed, Settings(_env_file=None), coingecko=cg, clock=lambda: now)
    eth, odd, test = AssetRef(1, None), AssetRef(1, "0x" + "d" * 40), AssetRef(11155111, None)
    day = date(2026, 11, 14)

    out = svc.usd({(eth, day), (odd, day), (test, day)})
    assert out[(eth, day)].source == "chainlink" and out[(eth, day)].usd == Decimal("2500")  # latest round: fake time is old
    assert out[(odd, day)].source == "coingecko" and out[(odd, day)].usd == Decimal("0.5")
    assert out[(test, day)] is None and out[(eth, day)].row_id is not None

    calls = (feed.calls, cg.calls)
    again = PriceService(db, feed, Settings(_env_file=None), coingecko=cg, clock=lambda: now).usd({(eth, day), (odd, day)})
    assert (feed.calls, cg.calls) == calls  # served from the store
    assert again[(eth, day)].row_id == out[(eth, day)].row_id


@pytest.mark.integration
def test_production_never_uses_non_commercial_coingecko(db):
    day = date(2026, 11, 14)
    odd = AssetRef(1, "0x" + "d" * 40)
    PriceService(db, FakeFeed(), Settings(_env_file=None), coingecko=FakeCoinGecko()).usd({(odd, day)})  # stored in dev

    cg = FakeCoinGecko()
    prod = PriceService(db, FakeFeed(), Settings(_env_file=None, env="production"), coingecko=cg)
    assert prod.usd({(odd, day)})[(odd, day)] is None and cg.calls == 0
    assert "CoinGecko not enabled" in prod.notes[0]
    paid = PriceService(db, FakeFeed(), Settings(_env_file=None, env="production", coingecko_commercial_plan=True), coingecko=cg)
    assert paid.usd({(odd, day)})[(odd, day)].source == "coingecko"
