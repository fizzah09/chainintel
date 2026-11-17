"""Rate limiting, retries with back-off, and one safe HTTP call used by every adapter.

The token bucket is per process. When ingestion runs in several Celery workers (M3 later), the
limit must move to Redis so all workers share one budget per API key.
"""

import random
import threading
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

import httpx

from app.modules.m3_data.providers.base import (
    AuthError,
    ProviderError,
    RateLimitedError,
    TransientError,
)


class TokenBucket:
    """Allows `rate` calls per second on average, bursts up to `capacity`. Blocks until a token is free."""

    def __init__(
        self,
        rate: float,
        capacity: float | None = None,
        clock: Callable[[], float] = time.monotonic,
        sleep: Callable[[float], None] = time.sleep,
    ):
        if rate <= 0:
            raise ValueError("rate must be positive")
        self.rate = rate
        self.capacity = capacity if capacity is not None else max(1.0, rate)
        self._tokens = self.capacity
        self._clock = clock
        self._sleep = sleep
        self._updated = clock()
        self._lock = threading.Lock()

    def acquire(self) -> None:
        with self._lock:  # waiters queue behind the lock, so the rate holds across threads
            while True:
                now = self._clock()
                self._tokens = min(self.capacity, self._tokens + (now - self._updated) * self.rate)
                self._updated = now
                if self._tokens >= 1:
                    self._tokens -= 1
                    return
                self._sleep((1 - self._tokens) / self.rate)


@dataclass
class RetryPolicy:
    """Retries TransientError with exponential back-off and jitter; anything else fails at once."""

    max_attempts: int = 4
    base_delay: float = 0.5
    max_delay: float = 8.0
    sleep: Callable[[float], None] = field(default=time.sleep, repr=False)
    rand: Callable[[], float] = field(default=random.random, repr=False)

    def run[T](self, fn: Callable[[], T]) -> T:
        for attempt in range(1, self.max_attempts + 1):
            try:
                return fn()
            except TransientError as exc:
                if attempt == self.max_attempts:
                    raise
                delay = min(self.max_delay, self.base_delay * 2 ** (attempt - 1))
                delay = delay / 2 + self.rand() * delay / 2  # "equal jitter": spread retries out
                if isinstance(exc, RateLimitedError) and exc.retry_after:
                    delay = max(delay, min(exc.retry_after, self.max_delay))
                self.sleep(delay)
        raise AssertionError("unreachable")


def _retry_after(response: httpx.Response) -> float | None:
    try:
        return float(response.headers.get("retry-after", ""))
    except ValueError:
        return None


def request_json(
    client: httpx.Client,
    method: str,
    url: str,
    *,
    provider: str,
    limiter: TokenBucket,
    retry: RetryPolicy,
    timeout: float,
    check: Callable[[Any], Any],
    params: dict | None = None,
    json: dict | None = None,
) -> Any:
    """One rate-limited, retried call. `check` turns the body into a result or raises a ProviderError,
    and runs inside the retry loop so in-body rate-limit replies are retried too.

    Exceptions are re-raised without their cause: httpx messages can contain the URL, and some
    provider URLs carry the API key.
    """

    def attempt() -> Any:
        limiter.acquire()
        try:
            r = client.request(method, url, params=params, json=json, timeout=timeout)
        except httpx.TimeoutException:
            raise TransientError(f"{provider}: timeout") from None
        except httpx.TransportError as exc:
            raise TransientError(f"{provider}: network error ({type(exc).__name__})") from None
        if r.status_code == 429:
            raise RateLimitedError(f"{provider}: HTTP 429 rate limited", _retry_after(r))
        if r.status_code in (401, 403):
            raise AuthError(f"{provider}: HTTP {r.status_code} (check API key and plan)")
        if r.status_code >= 500:
            raise TransientError(f"{provider}: HTTP {r.status_code}")
        if r.status_code >= 400:
            raise ProviderError(f"{provider}: HTTP {r.status_code}")
        try:
            body = r.json()
        except ValueError:
            # Gateways and CDNs answer with HTML pages during outages.
            raise TransientError(f"{provider}: response was not JSON") from None
        return check(body)

    return retry.run(attempt)
