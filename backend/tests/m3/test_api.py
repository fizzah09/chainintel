"""M3.5 HTTP API tests. Endpoint tests use the throwaway PostgreSQL database and a scripted provider."""

import json

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.main import create_app
from app.modules.m3_data.api import format_amount, get_provider_router
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES
from app.modules.m3_data.providers.base import TransferKind
from app.modules.m3_data.providers.router import ProviderRouter
from tests.m3.test_sync import USDC, W, X, Scripted, tx


def test_format_amount_is_exact():
    assert format_amount(0, 18) == "0"
    assert format_amount(10**18, 18) == "1"
    assert format_amount(1, 18) == "0.000000000000000001"
    assert format_amount(2_500_000, 6) == "2.5"
    assert format_amount(10**30 + 7, 18) == "1000000000000.000000000000000007"
    assert format_amount(5, 0) == "5"
    assert format_amount(5, None) is None


def test_api_refuses_outside_development_but_health_stays_up():
    app = create_app()
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None, env="production")
    c = TestClient(app)
    assert c.get("/api/v1/chains").status_code == 503
    assert c.get("/health").status_code == 200


def client(db, providers):
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_provider_router] = lambda: ProviderRouter(providers)
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None, default_confirmations=12)
    return TestClient(app)


@pytest.mark.integration
def test_sync_then_read_transfers_with_exact_amounts_and_paging(db):
    chain = [
        tx(80, "0x80", value=10**30 + 7),
        tx(81, "0x81", kind=TransferKind.ERC20, token=USDC, decimals=6, sub="log:2", value=2_500_000),
        tx(95, "0x95", value=10**18),
    ]
    c = client(db, [Scripted(head=100, chain=chain, decimals={USDC: 6})])

    r = c.post(f"/api/v1/chains/1/addresses/{W.upper().replace('0X', '0x')}/sync", params={"kinds": ["native", "erc20"]})
    assert r.status_code == 200, r.text
    rep = r.json()
    assert rep["head_block"] == 100 and not rep["stale"] and rep["tokens_checked"] == 1

    r = c.get(f"/api/v1/chains/1/addresses/{W}/transfers", params={"kinds": ["native", "erc20"], "limit": 2})
    body = r.json()
    assert body["total"] == 3 and [i["tx_hash"] for i in body["items"]] == ["0x95", "0x81"]  # newest first
    assert not body["stale"]
    usdc = body["items"][1]
    assert (usdc["value_raw"], usdc["amount"], usdc["decimals_source"]) == ("2500000", "2.5", "contract")
    assert body["items"][0]["confirmed"] is False

    r = c.get(f"/api/v1/chains/1/addresses/{W}/transfers", params={"kinds": "native", "order": "oldest"})
    first = r.json()["items"][0]
    assert first["value_raw"] == str(10**30 + 7) and isinstance(first["value_raw"], str)
    assert first["amount"] == "1000000000000.000000000000000007"


@pytest.mark.integration
def test_transfers_for_unsynced_address_are_empty_and_stale(db):
    c = client(db, [Scripted(head=100, chain=[])])
    body = c.get(f"/api/v1/chains/1/addresses/{X}/transfers", params={"as_of": "2026-11-17T10:00:00"}).json()
    assert body["items"] == [] and body["stale"] and body["freshness"]["native"]["status"] == "never_synced"


@pytest.mark.integration
def test_validation_and_missing_provider(db):
    c = client(db, [])
    assert c.get("/api/v1/chains/1/addresses/0x123/transfers").status_code == 422
    assert c.get(f"/api/v1/chains/0/addresses/{W}/transfers").status_code == 422
    assert c.get(f"/api/v1/chains/1/addresses/{W}/transfers", params={"limit": 99999}).status_code == 422
    r = c.post(f"/api/v1/chains/1/addresses/{W}/sync")
    assert r.status_code == 503 and "CI_ETHERSCAN_API_KEY" in r.json()["detail"]
    assert c.get("/api/v1/chains/1/labels", params={"address": "nope"}).status_code == 422


@pytest.mark.integration
def test_chains_lists_providers_per_chain(db):
    chains = {c["chain_id"]: c for c in client(db, [Scripted(head=1, chain=[])]).get("/api/v1/chains").json()}
    assert chains[1]["providers"] == ["fake"] and chains[1]["name"] == "Ethereum"
    assert chains[137]["providers"] == [] and chains[137]["confirmations"] == 128


@pytest.mark.integration
def test_labels_register_and_import_log(db):
    imp = LabelImporter(db)
    imp.run(SOURCES["ofac_sdn"], f"address,name\n{W},LAZARUS\n".encode(), "file:ofac.csv")
    imp.run(
        SOURCES["etherscan_labels_community"],
        json.dumps({W: {"name": "Lazarus", "labels": ["heist"]}}).encode(),
        "file:community.json",
    )
    c = client(db, [])

    labels = c.get("/api/v1/chains/1/labels", params={"address": [W, X]}).json()
    assert [l["source_key"] for l in labels[W]] == ["ofac_sdn", "etherscan_labels_community"] and labels[X] == []
    assert labels[W][0]["licence"].startswith("US government")
    only = c.get("/api/v1/chains/1/labels", params={"address": W, "commercial_only": True}).json()
    assert [l["source_key"] for l in only[W]] == ["ofac_sdn"]

    sources = {s["key"]: s for s in c.get("/api/v1/label-sources").json()}
    assert sources["ofac_sdn"]["active_labels"] == 1 and sources["ofac_sdn"]["last_import_status"] == "applied"
    assert sources["etherscan_labels_community"]["commercial_use"] == "unverified"

    imports = c.get("/api/v1/label-imports", params={"source": "ofac_sdn"}).json()
    assert len(imports) == 1 and imports[0]["retrieved_from"] == "file:ofac.csv" and imports[0]["added"] == 1
