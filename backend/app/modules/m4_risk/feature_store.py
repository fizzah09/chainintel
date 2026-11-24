"""R4 feature store: the wallet feature vector the illicit model reads, stored as append-only snapshots.

Features come from the same code the risk engine uses (`engine/features.py`), so the model and the store
can never disagree. The vector depends only on stored transfer amounts (token units, not USD), never on
prices or live provider calls, so a stored snapshot can be recomputed exactly: `verify` does that.

Scope: EVM wallets (the model was trained on Ethereum accounts). A snapshot is a point-in-time record:
it holds the transfers known at `as_of`, not the wallet's state today.
"""

from datetime import UTC, datetime

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import Principal
from app.modules.m4_risk.engine.classifier import load_model
from app.modules.m4_risk.engine.config import RULESET_V1, RuleSet
from app.modules.m4_risk.engine.features import compute_features
from app.modules.m4_risk.inputs import _wallet_view
from app.modules.m4_risk import features_v2
from app.modules.m4_risk.models import FeatureSnapshot
from app.modules.m4_risk.service import sha256
from app.modules.m3_data.providers.base import normalize_address

FEATURE_SET_V1 = "wallet-features-v1"  # the 17 model features only
FEATURE_SET = FEATURE_SET_V2 = features_v2.FEATURE_SET_V2  # v1 features plus the R4 set (default for new builds)

# What each feature means, for analysts. Names must match the model artifact (checked on every build).
DESCRIPTIONS: dict[str, str] = {
    "avg_min_between_sent": "average minutes between outgoing native transfers",
    "avg_min_between_received": "average minutes between incoming native transfers",
    "time_diff_first_last_min": "minutes between the first and last transfer",
    "sent_tnx": "number of outgoing native transfers",
    "received_tnx": "number of incoming native transfers",
    "unique_received_from": "distinct senders of native transfers in",
    "unique_sent_to": "distinct recipients of native transfers out",
    "min_value_received": "smallest incoming native amount",
    "max_value_received": "largest incoming native amount",
    "avg_value_received": "average incoming native amount",
    "min_value_sent": "smallest outgoing native amount",
    "max_value_sent": "largest outgoing native amount",
    "avg_value_sent": "average outgoing native amount",
    "total_ether_sent": "total native amount sent",
    "total_ether_received": "total native amount received",
    "total_ether_balance": "received minus sent (native)",
    "erc20_total_tnxs": "number of token transfers involving the wallet",
}


class FeatureOut(BaseModel):
    id: int
    public_id: str
    address: str
    chain_id: int
    as_of: datetime
    created_at: datetime
    created_by: str
    feature_set: str
    transfers: int
    features: dict[str, float]
    feature_sha256: str
    data_quality: dict


def _now() -> datetime:
    return datetime.now(UTC)


def model_features() -> list[str]:
    names = list(load_model().data["features"])
    missing = set(names) - set(DESCRIPTIONS)
    if missing:
        raise RuntimeError(f"model needs features without a description: {sorted(missing)}")
    return names


def compute_vector(
    db: Session, address: str, chain_id: int, as_of: datetime, settings: Settings, rules: RuleSet = RULESET_V1,
    feature_set: str = FEATURE_SET_V2,
) -> tuple[dict[str, float], int, dict]:
    """(features, usable transfer count, data quality) from transfers known at `as_of`, for one feature set."""
    if feature_set not in (FEATURE_SET_V1, FEATURE_SET_V2):
        raise ValueError(f"unknown feature set {feature_set!r}")
    me = normalize_address(address)
    _wallet, mine, _priced, txs, labels = _wallet_view(db, me, chain_id, as_of, as_of, None, rules, settings)
    raw = compute_features(txs)
    names = model_features()
    vector = {n: float(raw[n]) for n in names}
    native = sum(1 for t in txs if t["sym"] == "ETH")
    quality = {
        "usable_transfers": len(mine),
        "native_transfers": native,
        "token_transfers": len(txs) - native,
        "empty": len(txs) == 0,
        "no_native_activity": native == 0,
    }
    if feature_set == FEATURE_SET_V2:
        extra, v2_quality = features_v2.v2_features(txs, labels, to_iso_at(as_of), set(rules.risk_cats))
        vector = {**vector, **extra}
        quality = {**quality, **v2_quality}
    return vector, len(mine), quality


def to_iso_at(at: datetime) -> str:
    return at.astimezone(UTC).isoformat().replace("+00:00", "Z")


def build(
    db: Session, principal: Principal, address: str, chain_id: int, settings: Settings,
    as_of: datetime | None = None, rules: RuleSet = RULESET_V1,
) -> FeatureSnapshot:
    """Append one snapshot. Never updates or deletes an earlier one."""
    at = as_of or _now()
    vector, count, quality = compute_vector(db, address, chain_id, at, settings, rules, FEATURE_SET_V2)
    row = FeatureSnapshot(
        tenant_id=principal.tenant_id, chain_id=chain_id, address=normalize_address(address), as_of=at,
        created_at=_now(), created_by=principal.user_id, feature_set=FEATURE_SET, transfers=count,
        features=vector, feature_sha256=sha256(vector), data_quality=quality,
    )
    db.add(row)
    db.commit()
    return row


def latest(db: Session, principal: Principal, address: str, chain_id: int) -> FeatureSnapshot | None:
    return db.scalar(
        select(FeatureSnapshot)
        .where(
            FeatureSnapshot.tenant_id == principal.tenant_id,
            FeatureSnapshot.chain_id == chain_id,
            FeatureSnapshot.address == normalize_address(address),
        )
        .order_by(FeatureSnapshot.id.desc())
        .limit(1)
    )


def verify(db: Session, principal: Principal, snapshot: FeatureSnapshot, settings: Settings) -> bool:
    """Recompute the vector as of the stored knowledge time and compare hashes."""
    vector, _count, _quality = compute_vector(
        db, snapshot.address, snapshot.chain_id, snapshot.as_of, settings, feature_set=snapshot.feature_set
    )
    return sha256(vector) == snapshot.feature_sha256 and vector == snapshot.features


def out(row: FeatureSnapshot) -> FeatureOut:
    return FeatureOut(
        id=row.id, public_id=str(row.public_id), address=row.address, chain_id=row.chain_id, as_of=row.as_of,
        created_at=row.created_at, created_by=row.created_by, feature_set=row.feature_set,
        transfers=row.transfers, features=row.features, feature_sha256=row.feature_sha256,
        data_quality=row.data_quality,
    )
