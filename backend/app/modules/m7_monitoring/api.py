"""M7 HTTP API: watchlists and alerts."""

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import Principal, require_principal
from app.modules.m7_monitoring.models import Alert, Watchlist, WatchlistEntry

router = APIRouter(prefix="/api/v1", tags=["M7 monitoring"], dependencies=[Depends(require_principal)])
DB = Annotated[Session, Depends(get_db)]
Me = Annotated[Principal, Depends(require_principal)]


def _now() -> datetime:
    return datetime.now(UTC)


# ---- Request / response models -------------------------------------------------------

class WatchlistIn(BaseModel):
    name: str
    description: str = ""
    scope: str = "Private"
    rule_type: str = "threshold"
    rule_value: str = "50"


class WatchlistEntryIn(BaseModel):
    chain_id: int = 1
    address: str
    label: str | None = None
    risk_score: int | None = None


class AlertResolveIn(BaseModel):
    resolution: str = ""


class EntryOut(BaseModel):
    id: int
    chain_id: int
    address: str
    label: str | None
    risk_score: int | None
    added_at: datetime
    added_by: str


class WatchlistOut(BaseModel):
    id: int
    public_id: str
    name: str
    description: str
    scope: str
    rule_type: str
    rule_value: str
    created_at: datetime
    created_by: str
    entries: list[EntryOut]


class WatchlistSummary(BaseModel):
    id: int
    public_id: str
    name: str
    scope: str
    rule_type: str
    rule_value: str
    wallet_count: int
    created_at: datetime


class AlertOut(BaseModel):
    id: int
    public_id: str
    chain_id: int
    wallet: str
    trigger: str
    score: int
    tier: str
    status: str
    at: datetime
    resolved_at: datetime | None
    resolved_by: str | None
    resolution: str | None
    watchlist_id: int | None


def _entry_out(e: WatchlistEntry) -> EntryOut:
    return EntryOut(id=e.id, chain_id=e.chain_id, address=e.address, label=e.label,
                    risk_score=e.risk_score, added_at=e.added_at, added_by=e.added_by)


def _wl_out(w: Watchlist) -> WatchlistOut:
    return WatchlistOut(
        id=w.id, public_id=w.public_id, name=w.name, description=w.description,
        scope=w.scope, rule_type=w.rule_type, rule_value=w.rule_value,
        created_at=w.created_at, created_by=w.created_by,
        entries=[_entry_out(e) for e in w.entries],
    )


def _alert_out(a: Alert) -> AlertOut:
    return AlertOut(
        id=a.id, public_id=a.public_id, chain_id=a.chain_id, wallet=a.wallet,
        trigger=a.trigger, score=a.score, tier=a.tier, status=a.status, at=a.at,
        resolved_at=a.resolved_at, resolved_by=a.resolved_by, resolution=a.resolution,
        watchlist_id=a.watchlist_id,
    )


def _get_wl(db: Session, public_id: str, tenant_id: str) -> Watchlist:
    w = db.scalar(select(Watchlist).where(Watchlist.public_id == public_id, Watchlist.tenant_id == tenant_id))
    if not w:
        raise HTTPException(404, "Watchlist not found")
    return w


# ---- Watchlist routes ----------------------------------------------------------------

@router.post("/watchlists", response_model=WatchlistOut, status_code=201)
def create_watchlist(body: WatchlistIn, db: DB, me: Me):
    w = Watchlist(
        public_id=str(uuid.uuid4()), tenant_id=me.tenant_id,
        name=body.name, description=body.description, scope=body.scope,
        rule_type=body.rule_type, rule_value=body.rule_value,
        created_at=_now(), created_by=me.user_id, updated_at=_now(),
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return _wl_out(w)


@router.get("/watchlists", response_model=list[WatchlistSummary])
def list_watchlists(db: DB, me: Me):
    rows = db.scalars(select(Watchlist).where(Watchlist.tenant_id == me.tenant_id).order_by(Watchlist.id.desc())).all()
    return [WatchlistSummary(
        id=w.id, public_id=w.public_id, name=w.name, scope=w.scope,
        rule_type=w.rule_type, rule_value=w.rule_value,
        wallet_count=len(w.entries), created_at=w.created_at,
    ) for w in rows]


@router.get("/watchlists/{watchlist_id}", response_model=WatchlistOut)
def get_watchlist(watchlist_id: str, db: DB, me: Me):
    return _wl_out(_get_wl(db, watchlist_id, me.tenant_id))


@router.delete("/watchlists/{watchlist_id}", status_code=204)
def delete_watchlist(watchlist_id: str, db: DB, me: Me):
    w = _get_wl(db, watchlist_id, me.tenant_id)
    db.delete(w)
    db.commit()


@router.post("/watchlists/{watchlist_id}/entries", response_model=EntryOut, status_code=201)
def add_entry(watchlist_id: str, body: WatchlistEntryIn, db: DB, me: Me):
    w = _get_wl(db, watchlist_id, me.tenant_id)
    e = WatchlistEntry(
        watchlist_id=w.id, chain_id=body.chain_id, address=body.address.lower(),
        label=body.label, risk_score=body.risk_score, added_at=_now(), added_by=me.user_id,
    )
    db.add(e)
    db.commit()
    db.refresh(e)
    return _entry_out(e)


@router.delete("/watchlists/{watchlist_id}/entries/{entry_id}", status_code=204)
def remove_entry(watchlist_id: str, entry_id: int, db: DB, me: Me):
    _get_wl(db, watchlist_id, me.tenant_id)
    from sqlalchemy import delete as _del
    db.execute(_del(WatchlistEntry).where(WatchlistEntry.id == entry_id))
    db.commit()


# ---- Alert routes --------------------------------------------------------------------

@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    db: DB, me: Me,
    alert_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, le=200),
):
    q = select(Alert).where(Alert.tenant_id == me.tenant_id)
    if alert_status:
        q = q.where(Alert.status == alert_status)
    rows = db.scalars(q.order_by(Alert.id.desc()).limit(limit)).all()
    return [_alert_out(a) for a in rows]


@router.get("/alerts/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, db: DB, me: Me):
    a = db.scalar(select(Alert).where(Alert.public_id == alert_id, Alert.tenant_id == me.tenant_id))
    if not a:
        raise HTTPException(404, "Alert not found")
    return _alert_out(a)


@router.post("/alerts/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: str, body: AlertResolveIn, db: DB, me: Me):
    a = db.scalar(select(Alert).where(Alert.public_id == alert_id, Alert.tenant_id == me.tenant_id))
    if not a:
        raise HTTPException(404, "Alert not found")
    a.status = "Resolved"
    a.resolved_at = _now()
    a.resolved_by = me.user_id
    a.resolution = body.resolution
    db.commit()
    db.refresh(a)
    return _alert_out(a)


@router.post("/alerts", response_model=AlertOut, status_code=201)
def create_alert(body: dict, db: DB, me: Me):
    """Internal: create an alert (called by monitoring jobs or when a risk assessment triggers a rule)."""
    a = Alert(
        public_id=str(uuid.uuid4()), tenant_id=me.tenant_id,
        chain_id=body.get("chain_id", 1), wallet=body["wallet"].lower(),
        trigger=body["trigger"], score=body.get("score", 0), tier=body.get("tier", "low"),
        status="New", at=_now(), watchlist_id=body.get("watchlist_id"),
        details=body.get("details", {}),
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return _alert_out(a)
