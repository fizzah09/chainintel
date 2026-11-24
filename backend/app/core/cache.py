"""Redis: optional cache/queue. App runs without it; health check reports degraded."""

from functools import lru_cache

from app.core.config import get_settings


@lru_cache
def _get_redis():
    try:
        from redis import Redis
        s = get_settings()
        return Redis.from_url(
            s.redis_url,
            socket_connect_timeout=s.health_timeout,
            socket_timeout=s.health_timeout,
            decode_responses=True,
        )
    except Exception:
        return None


def ping_redis() -> None:
    r = _get_redis()
    if r is None:
        raise RuntimeError("Redis not configured")
    r.ping()
