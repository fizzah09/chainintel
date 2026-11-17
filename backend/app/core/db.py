"""PostgreSQL: the system of record. One engine per process; sessions per request."""

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, MetaData, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

# Stable constraint names so Alembic migrations are reproducible across databases.
NAMING = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING)


@lru_cache
def get_engine() -> Engine:
    s = get_settings()
    return create_engine(
        s.database_url,
        pool_pre_ping=True,
        connect_args={"connect_timeout": max(1, int(s.health_timeout))},
    )


@lru_cache
def _session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: one session per request, always closed."""
    with _session_factory()() as session:
        yield session


def ping_db() -> None:
    with get_engine().connect() as conn:
        conn.execute(text("SELECT 1"))
