"""Run probes, store their results, and present the matrix with the latest probe for each source."""

from dataclasses import asdict

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.modules.m3_data.models import SourceProbe
from app.modules.m3_data.sources.matrix import BY_KEY, SOURCES, Source
from app.modules.m3_data.sources.probes import now, run_probe


class ProbeOut(BaseModel):
    checked_at: str
    checked_by: str
    ok: bool
    outcome: str
    http_status: int | None
    final_url: str | None
    bytes: int | None
    findings: dict
    error: str | None


class MatrixRow(BaseModel):
    source: dict
    last_probe: ProbeOut | None


def _out(p: SourceProbe) -> ProbeOut:
    return ProbeOut(checked_at=p.checked_at.isoformat(), checked_by=p.checked_by, ok=p.ok, outcome=p.outcome,
                    http_status=p.http_status, final_url=p.final_url, bytes=p.bytes, findings=p.findings, error=p.error)


def probe_and_store(db: Session, source: Source, settings: Settings, actor: str, client=None) -> SourceProbe:
    r = run_probe(source, settings, client)
    row = SourceProbe(source_key=source.key, checked_at=now(), checked_by=actor, ok=r.ok, outcome=r.outcome,
                      http_status=r.http_status, final_url=r.final_url, bytes=r.bytes, findings=r.findings, error=r.error)
    db.add(row)
    db.commit()
    return row


def latest_probes(db: Session) -> dict[str, SourceProbe]:
    newest = select(SourceProbe.source_key, func.max(SourceProbe.id).label("id")).group_by(SourceProbe.source_key).subquery()
    rows = db.scalars(select(SourceProbe).join(newest, SourceProbe.id == newest.c.id))
    return {r.source_key: r for r in rows}


def matrix(db: Session, bucket: str | None = None, status: str | None = None) -> list[MatrixRow]:
    last = latest_probes(db)
    out = []
    for s in sorted(SOURCES, key=lambda s: (s.tier, -s.priority, s.key)):
        if (bucket and s.bucket != bucket) or (status and s.status != status):
            continue
        out.append(MatrixRow(source=asdict(s), last_probe=_out(last[s.key]) if s.key in last else None))
    return out


def get_source(key: str) -> Source | None:
    return BY_KEY.get(key)
