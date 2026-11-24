import pytest
from fastapi.testclient import TestClient

from app.api.health import get_checks
from app.main import create_app


def _client(checks=None) -> TestClient:
    app = create_app()
    if checks is not None:
        app.dependency_overrides[get_checks] = lambda: checks
    return TestClient(app)


def _ok() -> None:
    pass


def _down() -> None:
    raise ConnectionError("postgresql://user:secret@db-host:5432 refused")


def test_liveness_never_touches_dependencies():
    r = _client({"database": _down}).get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_ready_when_all_checks_pass():
    r = _client({"database": _ok, "redis": _ok}).get("/health/ready")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ready"
    assert set(body["checks"]) == {"database", "redis"}


def test_not_ready_returns_503_without_leaking_connection_details():
    r = _client({"database": _down, "redis": _ok}).get("/health/ready")
    assert r.status_code == 503
    body = r.json()
    assert body["status"] == "not_ready"
    assert body["checks"]["database"] == {"ok": False, "latency_ms": body["checks"]["database"]["latency_ms"], "error": "ConnectionError"}
    assert "secret" not in r.text and "db-host" not in r.text


@pytest.mark.integration
def test_ready_against_real_services():
    """Run with: docker compose up -d, then pytest -m integration."""
    r = _client().get("/health/ready")
    assert r.status_code == 200, r.json()
