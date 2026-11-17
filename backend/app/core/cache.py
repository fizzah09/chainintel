"""Redis: cache and job queue. Never the system of record."""

from functools import lru_cache

from redis import Redis

from app.core.config import get_settings


@lru_cache
def get_redis() -> Redis:
    s = get_settings()
    return Redis.from_url(
        s.redis_url,
        socket_connect_timeout=s.health_timeout,
        socket_timeout=s.health_timeout,
        decode_responses=True,
    )


def ping_redis() -> None:
    get_redis().ping()
