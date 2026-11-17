"""R4 feature store: append-only snapshots, parity with the engine's features, reproducibility, tenancy, roles."""

from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.core.security import Principal
from app.main import create_app
from app.modules.m3_data.api import get_provider_router
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.sync import TransferSync
from app.modules.m4_risk import feature_store
from app.modules.m4_risk.api import get_coingecko
from app.modules.m4_risk.engine.classifier import load_model
from app.modules.m4_risk.models import FeatureSnapshot
from tests.m3.test_sync import Scripted, tx
from tests.m4.test_assessments import FRIEND, LATE, SDN, W, world

pytestmark = pytest.mark.integration

T0 = datetime(2026, 11, 17, 10, 0, tzinfo=UTC)
ALICE = Principal(user_id="alice@bank-a", tenant_id="bank-a", roles=["compliance_manager"])
BOB_OTHER_TENANT = Principal(user_id="bob@bank-z", tenant_id="bank-z", roles=["compliance_manager"])
SETTINGS = Settings(_env_file=None, default_confirmations=12, risk_neighbours=2)


def synced(db):
    """W has received 2 ETH from FRIEND and sent 1 ETH to LATE; the sanctioned SDN paid FRIEND."""
    from tests.m4.test_assessments import Clock

    provider = world(db, Clock(T0))
    TransferSync(db, ProviderRouter([provider]), SETTINGS, clock=lambda: T0).sync(W, 1)
    return provider


def test_snapshot_matches_engine_features_and_model_order(db):
    synced(db)
    row = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0)
    assert set(load_model().data["features"]) <= set(row.features)  # every model feature is present (JSONB sorts keys)
    assert {"w30_tx_count", "rapid_pass_through_share", "fan_out_24h_max"} <= set(row.features)  # v2 additions
    f = row.features
    assert (f["received_tnx"], f["sent_tnx"]) == (1, 1)
    assert (f["total_ether_received"], f["total_ether_sent"], f["total_ether_balance"]) == (2.0, 1.0, 1.0)
    assert row.transfers == 2 and row.data_quality["native_transfers"] == 2 and not row.data_quality["empty"]
    assert row.feature_set == "wallet-features-v2" and row.created_by == "alice@bank-a"


def test_snapshot_is_reproducible_from_stored_transfers(db):
    synced(db)
    row = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0)
    assert feature_store.verify(db, ALICE, row, SETTINGS)
    # A tampered copy (the stored row itself is append-only) must fail verification.
    tampered = FeatureSnapshot(address=row.address, chain_id=row.chain_id, as_of=row.as_of, feature_set=row.feature_set,
                               features={**row.features, "sent_tnx": 99.0}, feature_sha256=row.feature_sha256)
    assert not feature_store.verify(db, ALICE, tampered, SETTINGS)


def test_knowledge_time_is_point_in_time(db):
    synced(db)
    before_any_transfer = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0 - timedelta(days=365))
    assert before_any_transfer.transfers == 0 and before_any_transfer.data_quality["empty"]
    assert set(before_any_transfer.features.values()) == {0.0}


def test_snapshots_are_append_only(db):
    synced(db)
    row = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0)
    with pytest.raises(DBAPIError):
        db.execute(text("UPDATE feature_snapshots SET transfers = 0 WHERE id = :i"), {"i": row.id})
    db.rollback()
    with pytest.raises(DBAPIError):
        db.execute(text("DELETE FROM feature_snapshots WHERE id = :i"), {"i": row.id})
    db.rollback()
    assert db.get(FeatureSnapshot, row.id) is not None


def test_latest_returns_newest_and_is_tenant_scoped(db):
    synced(db)
    first = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0)
    second = feature_store.build(db, ALICE, W, 1, SETTINGS, as_of=T0 + timedelta(days=1))
    assert feature_store.latest(db, ALICE, W, 1).id == second.id
    assert feature_store.latest(db, BOB_OTHER_TENANT, W, 1) is None
    assert db.get(FeatureSnapshot, first.id) is not None  # history kept


def test_v1_snapshots_still_verify_after_v2_ships(db):
    synced(db)
    old = FeatureSnapshot(tenant_id=ALICE.tenant_id, chain_id=1, address=W, as_of=T0, created_at=T0,
                          created_by="old", feature_set=feature_store.FEATURE_SET_V1, transfers=0,
                          features={}, feature_sha256="x", data_quality={})
    vector, _c, _q = feature_store.compute_vector(db, W, 1, T0, SETTINGS, feature_set=feature_store.FEATURE_SET_V1)
    from app.modules.m4_risk.service import sha256
    old.features, old.feature_sha256 = vector, sha256(vector)
    assert set(vector) == set(load_model().data["features"]) and feature_store.verify(db, ALICE, old, SETTINGS)


def test_wallet_never_synced_gives_empty_vector_not_an_error(db):
    row = feature_store.build(db, ALICE, "0x" + "9" * 40, 1, SETTINGS, as_of=T0)
    assert row.data_quality["empty"] and row.transfers == 0


@pytest.fixture
def api(db):
    synced(db)
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_settings] = lambda: SETTINGS
    app.dependency_overrides[get_provider_router] = lambda: ProviderRouter([Scripted(head=100, chain=[])])
    app.dependency_overrides[get_coingecko] = lambda: None
    return TestClient(app)


def test_feature_endpoints_roles_and_read(api):
    url = f"/api/v1/chains/1/addresses/{W}/features"
    analyst = {"X-Dev-User": "ana", "X-Dev-Roles": "analyst"}
    manager = {"X-Dev-User": "mia", "X-Dev-Roles": "compliance_manager"}
    assert api.post(url, headers=analyst).status_code == 403
    assert api.get(f"{url}/latest", headers=analyst).status_code == 404  # nothing built yet
    made = api.post(url, headers=manager)
    assert made.status_code == 201 and made.json()["features"]["received_tnx"] == 1.0
    got = api.get(f"{url}/latest", headers=analyst)
    assert got.status_code == 200 and got.json()["feature_sha256"] == made.json()["feature_sha256"]
