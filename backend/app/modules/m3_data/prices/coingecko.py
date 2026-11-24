"""CoinGecko daily prices: the fallback for assets without a Chainlink feed.

One `market_chart/range` call returns a whole period, so a wallet's history costs one call per asset.
The free (demo) plan is non-commercial and limited to the last 365 days.
"""

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

import httpx

from app.modules.m3_data.providers.base import BadResponseError
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket, request_json

PUBLIC_URL = "https://api.coingecko.com/api/v3"
PRO_URL = "https://pro-api.coingecko.com/api/v3"


class CoinGecko:
    def __init__(
        self, client: httpx.Client, limiter: TokenBucket, retry: RetryPolicy, *, base_url: str = PUBLIC_URL, timeout: float = 20.0
    ):
        self._client = client
        self._limiter = limiter
        self._retry = retry
        self._url = base_url
        self._timeout = timeout

    @staticmethod
    def _check(body):
        if not isinstance(body, dict) or not isinstance(body.get("prices"), list):
            raise BadResponseError("coingecko: expected a prices list")
        return body["prices"]

    def daily_usd(self, ref: tuple[str, ...], start: date, end: date) -> dict[date, tuple[Decimal, datetime, str]]:
        """{day: (usd, observed_at, source_ref)} for start..end inclusive. Each day takes the last
        quote at or before the end of that day (its close)."""
        if ref[0] == "coin":
            path, source_ref = f"/coins/{ref[1]}/market_chart/range", f"coingecko:{ref[1]}"
        else:
            path, source_ref = f"/coins/{ref[1]}/contract/{ref[2]}/market_chart/range", f"coingecko:{ref[1]}:{ref[2]}"
        frm = int(datetime(start.year, start.month, start.day, tzinfo=UTC).timestamp())
        to = int(datetime(end.year, end.month, end.day, tzinfo=UTC).timestamp()) + 86400
        points = request_json(
            self._client, "GET", self._url + path,
            params={"vs_currency": "usd", "from": frm, "to": to},
            provider="coingecko", limiter=self._limiter, retry=self._retry, timeout=self._timeout, check=self._check,
        )
        out: dict[date, tuple[Decimal, datetime, str]] = {}
        for p in points:
            try:
                ms, usd = int(p[0]), p[1]
            except (TypeError, ValueError, IndexError):
                raise BadResponseError("coingecko: malformed price point") from None
            if usd is None:
                continue
            at = datetime.fromtimestamp(ms / 1000, UTC)
            day = at.date()
            if start <= day <= end and (day not in out or at >= out[day][1]):
                out[day] = (Decimal(str(usd)), at, source_ref)
        return out


def build_coingecko(api_key: str | None, pro: bool, rps: float, max_retries: int) -> CoinGecko:
    headers = {"User-Agent": "chainintel-backend", "Accept": "application/json"}
    if api_key:
        headers["x-cg-pro-api-key" if pro else "x-cg-demo-api-key"] = api_key
    return CoinGecko(
        httpx.Client(headers=headers), TokenBucket(rps), RetryPolicy(max_attempts=max_retries),
        base_url=PRO_URL if pro else PUBLIC_URL,
    )


def day_bounds(day: date) -> tuple[int, int]:
    s = int(datetime(day.year, day.month, day.day, tzinfo=UTC).timestamp())
    return s, s + int(timedelta(days=1).total_seconds()) - 1
