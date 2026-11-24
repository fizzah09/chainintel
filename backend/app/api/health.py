"""Liveness and readiness probes for the load balancer, Kubernetes and the bank's monitoring."""

import time
from collections.abc import Callable
from typing import Literal

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel

from app.core.cache import ping_redis
from app.core.config import Settings, get_settings
from app.core.db import ping_db

router = APIRouter(prefix="/health", tags=["health"])


class Liveness(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
    version: str
    env: str


class Check(BaseModel):
    ok: bool
    latency_ms: float
    error: str | None = None


class Readiness(BaseModel):
    status: Literal["ready", "not_ready"]
    checks: dict[str, Check]


def get_checks() -> dict[str, Callable[[], None]]:
    """Dependency so tests (and future modules) can swap or extend the checks."""
    return {"database": ping_db, "redis": ping_redis}


def _run(fn: Callable[[], None]) -> Check:
    start = time.perf_counter()
    try:
        fn()
        return Check(ok=True, latency_ms=round((time.perf_counter() - start) * 1000, 1))
    except Exception as exc:  # noqa: BLE001 - any failure means "not ready"
        # Only the exception type is returned: connection strings and hosts stay out of responses.
        return Check(ok=False, latency_ms=round((time.perf_counter() - start) * 1000, 1), error=type(exc).__name__)


@router.get("", response_model=Liveness)
def liveness(settings: Settings = Depends(get_settings)) -> Liveness:
    """Process is up. Never touches dependencies, so a database outage does not restart the pod."""
    return Liveness(service=settings.app_name, version=settings.version, env=settings.env)


@router.get("/ready", response_model=Readiness)
def readiness(response: Response, checks: dict[str, Callable[[], None]] = Depends(get_checks)) -> Readiness:
    """Dependencies reachable. Returns 503 if any is down so traffic is routed elsewhere."""
    results = {name: _run(fn) for name, fn in checks.items()}
    ready = all(c.ok for c in results.values())
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return Readiness(status="ready" if ready else "not_ready", checks=results)
