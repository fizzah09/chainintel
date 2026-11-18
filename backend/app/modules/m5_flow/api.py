"""M5 HTTP API: fund flow tracing."""

import uuid
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.core.security import Principal, require_principal
from app.modules.m3_data.providers.base import normalize_address
from app.modules.m5_flow.models import TraceRun
from app.modules.m5_flow.tracer import run_trace

router = APIRouter(prefix="/api/v1", tags=["M5 fund flow"], dependencies=[Depends(require_principal)])

Address = Annotated[str, Path(pattern=r"^0x[0-9a-fA-F]{40}$")]
ChainId = Annotated[int, Path(ge=1)]
DB = Annotated[Session, Depends(get_db)]
Me = Annotated[Principal, Depends(require_principal)]


class TraceRequest(BaseModel):
    hops: int = Field(default=3, ge=1, le=5)
    direction: str = Field(default="both")  # forward | backward | both
    period_days: int = Field(default=30, ge=1, le=365)
    min_usd: float = Field(default=0, ge=0)
    method: str = Field(default="proportional")  # proportional | fifo | temporal
    as_of: datetime | None = None


class NodeOut(BaseModel):
    address: str
    hop: int
    entity_type: str
    group: str
    label: str
    confidence: float


class EdgeOut(BaseModel):
    id: str
    from_addr: str = Field(alias="from")
    to_addr: str = Field(alias="to")
    usd: float | None
    amount: str
    symbol: str
    hash: str
    time: str
    hop: int
    basis: str

    class Config:
        populate_by_name = True


class TraceOut(BaseModel):
    id: str
    chain_id: int
    start: str
    nodes: list[dict]
    edges: list[dict]
    path: list[str]
    hop_summary: list[dict]
    total_nodes: int
    shown_nodes: int
    total_edges: int
    truncated: bool
    created_at: datetime
    hops: int
    direction: str
    period_days: int
    min_usd: float
    method: str


class TraceSummary(BaseModel):
    id: str
    chain_id: int
    start: str
    created_at: datetime
    hops: int
    direction: str
    period_days: int
    total_nodes: int
    total_edges: int
    truncated: bool


def _to_out(run: TraceRun) -> TraceOut:
    return TraceOut(
        id=str(run.public_id),
        chain_id=run.chain_id,
        start=run.start_address,
        nodes=run.nodes or [],
        edges=run.edges or [],
        path=run.path or [],
        hop_summary=[],
        total_nodes=run.total_nodes,
        shown_nodes=run.total_nodes,
        total_edges=run.total_edges,
        truncated=run.truncated,
        created_at=run.created_at,
        hops=run.hops,
        direction=run.direction,
        period_days=run.period_days,
        min_usd=run.min_usd,
        method=run.method,
    )


@router.post("/chains/{chain_id}/addresses/{address}/trace", response_model=TraceOut, status_code=201)
def trace_wallet(
    chain_id: ChainId, address: Address, body: TraceRequest, db: DB, me: Me,
    settings: Settings = Depends(get_settings),
):
    as_of = body.as_of or datetime.now(UTC)
    result = run_trace(
        db=db, settings=settings, start=address, chain_id=chain_id,
        hops=body.hops, direction=body.direction, period_days=body.period_days,
        min_usd=body.min_usd, method=body.method, as_of=as_of,
    )
    run = TraceRun(
        public_id=uuid.uuid4(),
        tenant_id=me.tenant_id,
        chain_id=chain_id,
        start_address=normalize_address(address),
        created_at=datetime.now(UTC),
        created_by=me.user_id,
        hops=body.hops,
        direction=body.direction,
        period_days=body.period_days,
        min_usd=int(body.min_usd),
        method=body.method,
        as_of=as_of,
        total_nodes=result["total_nodes"],
        total_edges=result["total_edges"],
        truncated=result["truncated"],
        nodes=result["nodes"],
        edges=result["edges"],
        path=result["path"],
    )
    db.add(run)
    db.commit()
    result["id"] = str(run.public_id)
    result["chain_id"] = chain_id
    result["created_at"] = run.created_at
    result["hops"] = body.hops
    result["direction"] = body.direction
    result["period_days"] = body.period_days
    result["min_usd"] = body.min_usd
    result["method"] = body.method
    result["shown_nodes"] = result["total_nodes"]
    return result


@router.get("/chains/{chain_id}/addresses/{address}/traces", response_model=list[TraceSummary])
def list_traces(chain_id: ChainId, address: Address, db: DB, me: Me, limit: int = Query(default=20, le=100)):
    rows = db.scalars(
        select(TraceRun)
        .where(TraceRun.tenant_id == me.tenant_id, TraceRun.chain_id == chain_id,
               TraceRun.start_address == normalize_address(address))
        .order_by(TraceRun.id.desc())
        .limit(limit)
    ).all()
    return [TraceSummary(
        id=str(r.public_id), chain_id=r.chain_id, start=r.start_address,
        created_at=r.created_at, hops=r.hops, direction=r.direction,
        period_days=r.period_days, total_nodes=r.total_nodes,
        total_edges=r.total_edges, truncated=r.truncated,
    ) for r in rows]


@router.get("/traces/{trace_id}", response_model=TraceOut)
def get_trace(trace_id: str, db: DB, me: Me):
    run = db.scalar(select(TraceRun).where(
        TraceRun.public_id == trace_id, TraceRun.tenant_id == me.tenant_id
    ))
    if not run:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trace not found")
    return _to_out(run)
