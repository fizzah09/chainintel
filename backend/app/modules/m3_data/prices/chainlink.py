"""Historical Chainlink prices by reading the feed contract (no archive node needed).

A feed proxy keeps every past round. Round ids are (phase << 64) | round-in-phase. In an existing phase
a missing round returns zeros; a phase that never existed reverts. To find the price in force at time
T: take the newest phase whose first round is not after T, then search its rounds by timestamp.
"""

from dataclasses import dataclass
from decimal import Decimal

from app.modules.m3_data.providers.base import ProviderError, TransientError
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.prices.registry import CHAINLINK_CHAIN

LATEST = "0xfeaf968c"  # latestRoundData()
GET_ROUND = "0x9a6fc8f5"  # getRoundData(uint80)
FEED_DECIMALS = 8
_LOW64 = (1 << 64) - 1


@dataclass(frozen=True)
class Round:
    round_id: int
    answer: int
    updated_at: int  # unix seconds; 0 = no such round

    @property
    def phase(self) -> int:
        return self.round_id >> 64

    @property
    def n(self) -> int:
        return self.round_id & _LOW64

    def usd(self) -> Decimal:
        return Decimal(self.answer).scaleb(-FEED_DECIMALS)


def _decode(result: str) -> Round:
    b = bytes.fromhex(result[2:])
    if len(b) < 160:
        raise ProviderError("chainlink: short round data")
    return Round(int.from_bytes(b[0:32]), int.from_bytes(b[32:64], signed=True), int.from_bytes(b[96:128]))


class ChainlinkReader:
    """Price at a moment, with a per-instance cache of rounds and phase bounds. `calls` counts contract
    reads so the caller can cap the work done in one request."""

    def __init__(self, router: ProviderRouter, max_calls: int = 200):
        self.router = router
        self.max_calls = max_calls
        self.calls = 0
        self._rounds: dict[tuple[str, int], Round | None] = {}
        self._last_in_phase: dict[tuple[str, int], int] = {}

    def _call(self, feed: str, data: str) -> str:
        if self.calls >= self.max_calls:
            raise TransientError("chainlink: lookup budget for this request used up")
        self.calls += 1
        result, _ = self.router.call(CHAINLINK_CHAIN, feed, data)
        return result

    def latest(self, feed: str) -> Round:
        return _decode(self._call(feed, LATEST))

    def round(self, feed: str, phase: int, n: int) -> Round | None:
        """None when the phase does not exist (revert) or the round is empty."""
        key = (feed, (phase << 64) | n)
        if key not in self._rounds:
            try:
                r = _decode(self._call(feed, GET_ROUND + format((phase << 64) | n, "064x")))
                self._rounds[key] = r if r.updated_at else None
            except TransientError:
                raise
            except ProviderError:
                self._rounds[key] = None
        return self._rounds[key]

    def _last_round(self, feed: str, phase: int) -> int:
        """Highest round number in a finished phase: exponential probe, then bisect."""
        key = (feed, phase)
        if key in self._last_in_phase:
            return self._last_in_phase[key]
        lo, hi = 1, 2
        while self.round(feed, phase, hi) is not None:
            lo, hi = hi, hi * 2
        while hi - lo > 1:
            mid = (lo + hi) // 2
            if self.round(feed, phase, mid) is not None:
                lo = mid
            else:
                hi = mid
        self._last_in_phase[key] = lo
        return lo

    def price_at(self, feed: str, at: int) -> Round | None:
        """The round in force at unix time `at` (last update at or before it). None if before the feed."""
        latest = self.latest(feed)
        if latest.updated_at <= at:
            return latest
        for phase in range(latest.phase, 0, -1):
            first = self.round(feed, phase, 1)
            if first is None or first.updated_at > at:
                continue
            last_n = latest.n if phase == latest.phase else self._last_round(feed, phase)
            last = latest if phase == latest.phase else self.round(feed, phase, last_n)
            if last is not None and last.updated_at <= at:
                return last
            return self._search(feed, phase, first, last, at)
        return None

    def _search(self, feed: str, phase: int, lo: Round, hi: Round, at: int) -> Round:
        """Interpolation search on timestamps (rounds are roughly evenly spaced), with a bisection step
        every other iteration so a lopsided phase still converges. Invariant: lo <= at < hi."""
        bisect = False
        while hi.n - lo.n > 1:
            if bisect or hi.updated_at == lo.updated_at:
                guess = (lo.n + hi.n) // 2
            else:
                frac = (at - lo.updated_at) / (hi.updated_at - lo.updated_at)
                guess = lo.n + int(frac * (hi.n - lo.n))
            guess = min(max(guess, lo.n + 1), hi.n - 1)
            bisect = not bisect
            r = self.round(feed, phase, guess)
            if r is not None and r.updated_at <= at:
                lo = r
            else:
                hi = r if r is not None else Round((phase << 64) | guess, 0, hi.updated_at)
        return lo
