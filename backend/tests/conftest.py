from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import get_settings

TEST_DB = "chainintel_test"
TABLES = "chain_transfers, chain_fetch_log, address_sync_state, tokens, address_labels, label_imports, label_sources, asset_prices, risk_assessments, model_reviews, model_versions, reviewed_cases, backtest_runs, source_probes"


@pytest.fixture(scope="session")
def pg_engine():
    """A throwaway database migrated with the real Alembic migrations. Needs `docker compose up -d`."""
    base = make_url(get_settings().database_url)
    admin = create_engine(base, isolation_level="AUTOCOMMIT")
    with admin.connect() as c:
        c.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
        c.execute(text(f"CREATE DATABASE {TEST_DB}"))
    engine = create_engine(base.set(database=TEST_DB))
    cfg = Config(str(Path(__file__).parents[1] / "alembic.ini"))
    with engine.begin() as conn:
        cfg.attributes["connection"] = conn
        command.upgrade(cfg, "head")
    yield engine
    engine.dispose()
    with admin.connect() as c:
        c.execute(text(f"DROP DATABASE IF EXISTS {TEST_DB} WITH (FORCE)"))
    admin.dispose()


@pytest.fixture
def db(pg_engine):
    with pg_engine.begin() as c:
        c.execute(text(f"TRUNCATE {TABLES} RESTART IDENTITY CASCADE"))
    with Session(pg_engine) as session:
        yield session
