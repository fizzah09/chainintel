"""Daily USD prices with provenance. Order: stored rows, then Chainlink, then CoinGecko.

Rules:
- Every price used is a stored row (source, day, observed time, feed/round or coin id), so a score
  can be rebuilt with exactly the prices it used. Rows are never updated.
- An asset nobody can price is "unpriced" (None). It is never silently valued at $0 or a guess.
- Chainlink is preferred when both sources have the day.
- CoinGecko's free plan is non-commercial: in production it is used only with a commercial plan.
"""

from collections import defaultdict
from collections.abc import Callable, Iterable
from dataclasses import dataclass
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.modules.m3_data.models import AssetPrice
from app.modules.m3_data.prices.chainlink import ChainlinkReader
from app.modules.m3_data.prices.coingecko import CoinGecko, day_bounds
from app.modules.m3_data.prices.registry import AssetRef, PriceKey, resolve
from app.modules.m3_data.providers.base import ProviderError, TransientError
from app.modules.m3_data.providers.router import ProviderRouter

_PREFERENCE = {"chainlink": 0, "coingecko": 1}


def _now() -> datetime:
    return datetime.now(UTC)


@dataclass(frozen=True)
class Price:
    price_key: str
    day: date
    usd: Decimal
    source: str
    observed_at: datetime
    source_ref: str
    row_id: int | None = None


class PriceService:
    def __init__(
        self,
        db: Session,
        router: ProviderRouter,
        settings: Settings,
        coingecko: CoinGecko | None = None,
        clock: Callable[[], datetime] = _now,
        as_of: datetime | None = None,
        allow_fetch: bool = True,
    ):
        self.db = db
        self.router = router
        self.settings = settings
        self.coingecko = coingecko
        self.clock = clock
        self.notes: list[str] = []  # why some prices are missing, for the assessment manifest
        # Re-runs read only rows fetched at or before the original knowledge time, and fetch nothing.
        self.as_of = as_of
        self.allow_fetch = allow_fetch

    @property
    def coingecko_allowed(self) -> bool:
        return self.coingecko is not None and (self.settings.env != "production" or self.settings.coingecko_commercial_plan)

    def usd(self, wanted: Iterable[tuple[AssetRef, date]]) -> dict[tuple[AssetRef, date], Price | None]:
        wanted = set(wanted)
        keys: dict[tuple[AssetRef, date], PriceKey | None] = {w: resolve(w[0]) for w in wanted}
        need: dict[str, set[date]] = defaultdict(set)
        specs: dict[str, PriceKey] = {}
        for (asset, day), pk in keys.items():
            if pk:
                need[pk.key].add(day)
                specs[pk.key] = pk

        found = self._load(need)
        missing = {k: {d for d in days if (k, d) not in found} for k, days in need.items()}
        missing = {k: v for k, v in missing.items() if v}
        if missing and self.allow_fetch:
            new_rows = self._fetch(missing, specs)
            if new_rows:
                self._store(new_rows)
                found = self._load(need)

        return {w: (found.get((pk.key, w[1])) if pk else None) for w, pk in keys.items()}

    # ---- storage ------------------------------------------------------------------------------

    def _load(self, need: dict[str, set[date]]) -> dict[tuple[str, date], Price]:
        if not need:
            return {}
        all_days = {d for days in need.values() for d in days}
        rows = self.db.scalars(
            select(AssetPrice).where(
                AssetPrice.price_key.in_(list(need)),
                AssetPrice.day.in_(list(all_days)),
                *([AssetPrice.fetched_at <= self.as_of] if self.as_of is not None else []),
            )
        )
        best: dict[tuple[str, date], Price] = {}
        for r in rows:
            if r.day not in need[r.price_key]:
                continue
            if r.source == "coingecko" and not self.coingecko_allowed and self.settings.env == "production":
                continue  # stored non-commercial prices are not used in production
            k = (r.price_key, r.day)
            if k not in best or _PREFERENCE[r.source] < _PREFERENCE[best[k].source]:
                best[k] = Price(r.price_key, r.day, r.usd, r.source, r.observed_at, r.source_ref, r.id)
        return best

    def _store(self, rows: list[dict]) -> None:
        for i in range(0, len(rows), 1000):
            stmt = pg_insert(AssetPrice).values(rows[i : i + 1000]).on_conflict_do_nothing(
                constraint="uq_asset_prices_key_day_source"
            )
            self.db.execute(stmt)
        self.db.commit()

    # ---- fetching -----------------------------------------------------------------------------

    def _fetch(self, missing: dict[str, set[date]], specs: dict[str, PriceKey]) -> list[dict]:
        now = self.clock()
        today = now.date()
        rows: list[dict] = []
        reader = ChainlinkReader(self.router, max_calls=self.settings.chainlink_max_calls_per_request)
        for key, days in sorted(missing.items()):
            pk = specs[key]
            left = set(days)
            if pk.chainlink_feed and self.router.providers:
                for day in sorted(left):
                    end = min(day_bounds(day)[1], int(now.timestamp()))
                    try:
                        r = reader.price_at(pk.chainlink_feed, end)
                    except TransientError as exc:
                        self.notes.append(f"chainlink {key}: {exc}")
                        break
                    except ProviderError as exc:
                        self.notes.append(f"chainlink {key}: {exc}")
                        break
                    if r is None or r.answer <= 0:
                        continue
                    rows.append(self._row(key, day, "chainlink", r.usd(), datetime.fromtimestamp(r.updated_at, UTC),
                                          f"chainlink:{pk.chainlink_feed}:round {r.round_id}", now))
                    left.discard(day)
            if left and pk.coingecko:
                if not self.coingecko_allowed:
                    self.notes.append(f"{key}: no Chainlink feed; CoinGecko not enabled for this environment")
                    continue
                try:
                    series = self.coingecko.daily_usd(pk.coingecko, min(left), min(max(left), today))
                except ProviderError as exc:
                    self.notes.append(f"coingecko {key}: {exc}")
                    continue
                for day, (usd, observed, ref) in series.items():
                    rows.append(self._row(key, day, "coingecko", usd, observed, ref, now))
        return rows

    @staticmethod
    def _row(key, day, source, usd, observed, ref, now) -> dict:
        return dict(price_key=key, day=day, source=source, usd=usd, observed_at=observed, source_ref=ref, fetched_at=now)
