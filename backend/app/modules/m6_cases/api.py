"""M6 HTTP API: case management."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import Principal, require_principal
from app.modules.m6_cases import service
from app.modules.m6_cases.models import Case, CaseEvidence, CaseMessage, CaseNote, CaseSubject, CaseTask

router = APIRouter(prefix="/api/v1", tags=["M6 cases"], dependencies=[Depends(require_principal)])
DB = Annotated[Session, Depends(get_db)]
Me = Annotated[Principal, Depends(require_principal)]


# ---- Request / response models -------------------------------------------------------

class SubjectIn(BaseModel):
    kind: str
    ref: str
    role: str = "Primary"
    chain_id: int | None = None
    risk_score: int | None = None
    label: str | None = None


class EvidenceIn(BaseModel):
    title: str
    type: str = "Document"
    content: str | None = None
    url: str | None = None
    hash: str | None = None
    tags: list[str] = []


class NoteIn(BaseModel):
    text: str
    is_internal: bool = True


class TaskIn(BaseModel):
    title: str
    assignee: str | None = None
    due_date: datetime | None = None


class MessageIn(BaseModel):
    text: str


class CaseIn(BaseModel):
    title: str
    description: str = ""
    priority: str = "Medium"
    case_type: str = "Investigation"
    source: str = ""
    assigned_to: str | None = None
    due_date: datetime | None = None
    tags: list[str] = []
    subjects: list[SubjectIn] = []


class StatusIn(BaseModel):
    status: str
    reason: str = ""


class SubjectOut(BaseModel):
    id: int
    kind: str
    ref: str
    role: str
    added_at: datetime
    added_by: str
    chain_id: int | None
    risk_score: int | None
    label: str | None


class EvidenceOut(BaseModel):
    id: int
    public_id: str
    title: str
    evidence_type: str
    content: str | None
    url: str | None
    added_at: datetime
    added_by: str
    tags: list[str]


class NoteOut(BaseModel):
    id: int
    text: str
    author: str
    created_at: datetime
    is_internal: bool


class TaskOut(BaseModel):
    id: int
    title: str
    status: str
    assignee: str | None
    due_date: datetime | None
    created_at: datetime
    created_by: str


class MessageOut(BaseModel):
    id: int
    text: str
    author: str
    at: datetime
    is_system: bool


class CaseOut(BaseModel):
    id: int
    public_id: str
    case_ref: str
    title: str
    description: str
    status: str
    priority: str
    case_type: str
    source: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    assigned_to: str | None
    due_date: datetime | None
    closed_at: datetime | None
    close_reason: str | None
    tags: list[str]
    subjects: list[SubjectOut]
    evidence: list[EvidenceOut]
    notes: list[NoteOut]
    tasks: list[TaskOut]
    messages: list[MessageOut]


class CaseSummary(BaseModel):
    id: int
    public_id: str
    case_ref: str
    title: str
    status: str
    priority: str
    case_type: str
    created_at: datetime
    updated_at: datetime
    created_by: str
    assigned_to: str | None


def _subject_out(s: CaseSubject) -> SubjectOut:
    return SubjectOut(id=s.id, kind=s.kind, ref=s.ref, role=s.role,
                      added_at=s.added_at, added_by=s.added_by,
                      chain_id=s.chain_id, risk_score=s.risk_score, label=s.label)


def _evidence_out(e: CaseEvidence) -> EvidenceOut:
    return EvidenceOut(id=e.id, public_id=e.public_id, title=e.title, evidence_type=e.evidence_type,
                       content=e.content, url=e.url, added_at=e.added_at, added_by=e.added_by, tags=e.tags)


def _note_out(n: CaseNote) -> NoteOut:
    return NoteOut(id=n.id, text=n.text, author=n.author, created_at=n.created_at, is_internal=n.is_internal)


def _task_out(t: CaseTask) -> TaskOut:
    return TaskOut(id=t.id, title=t.title, status=t.status, assignee=t.assignee,
                   due_date=t.due_date, created_at=t.created_at, created_by=t.created_by)


def _msg_out(m: CaseMessage) -> MessageOut:
    return MessageOut(id=m.id, text=m.text, author=m.author, at=m.at, is_system=m.is_system)


def _case_out(c: Case) -> CaseOut:
    return CaseOut(
        id=c.id, public_id=c.public_id, case_ref=c.case_ref,
        title=c.title, description=c.description, status=c.status,
        priority=c.priority, case_type=c.case_type, source=c.source,
        created_at=c.created_at, updated_at=c.updated_at, created_by=c.created_by,
        assigned_to=c.assigned_to, due_date=c.due_date,
        closed_at=c.closed_at, close_reason=c.close_reason, tags=c.tags,
        subjects=[_subject_out(s) for s in c.subjects],
        evidence=[_evidence_out(e) for e in c.evidence],
        notes=[_note_out(n) for n in c.notes],
        tasks=[_task_out(t) for t in c.tasks],
        messages=[_msg_out(m) for m in c.messages],
    )


def _get_or_404(db: Session, public_id: str, tenant_id: str) -> Case:
    c = service.get_case(db, public_id, tenant_id)
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Case not found")
    return c


# ---- Routes --------------------------------------------------------------------------

@router.post("/cases", response_model=CaseOut, status_code=201)
def create_case(body: CaseIn, db: DB, me: Me):
    return _case_out(service.create_case(db, me, body.model_dump()))


@router.get("/cases", response_model=list[CaseSummary])
def list_cases(db: DB, me: Me, status: str | None = None, limit: int = Query(50, le=200), offset: int = 0):
    rows = service.list_cases(db, me.tenant_id, status=status, limit=limit, offset=offset)
    return [CaseSummary(
        id=c.id, public_id=c.public_id, case_ref=c.case_ref, title=c.title, status=c.status,
        priority=c.priority, case_type=c.case_type, created_at=c.created_at,
        updated_at=c.updated_at, created_by=c.created_by, assigned_to=c.assigned_to,
    ) for c in rows]


@router.get("/cases/{case_id}", response_model=CaseOut)
def get_case(case_id: str, db: DB, me: Me):
    return _case_out(_get_or_404(db, case_id, me.tenant_id))


@router.patch("/cases/{case_id}", response_model=CaseOut)
def update_case(case_id: str, body: dict, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _case_out(service.update_case(db, c, body, me.user_id))


@router.post("/cases/{case_id}/status", response_model=CaseOut)
def set_status(case_id: str, body: StatusIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _case_out(service.advance_status(db, c, body.status, me.user_id, body.reason))


@router.post("/cases/{case_id}/subjects", response_model=SubjectOut, status_code=201)
def add_subject(case_id: str, body: SubjectIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _subject_out(service.add_subject(db, c, body.model_dump(), me.user_id))


@router.post("/cases/{case_id}/evidence", response_model=EvidenceOut, status_code=201)
def add_evidence(case_id: str, body: EvidenceIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _evidence_out(service.add_evidence(db, c, body.model_dump(), me.user_id))


@router.post("/cases/{case_id}/notes", response_model=NoteOut, status_code=201)
def add_note(case_id: str, body: NoteIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _note_out(service.add_note(db, c, body.text, me.user_id, body.is_internal))


@router.post("/cases/{case_id}/tasks", response_model=TaskOut, status_code=201)
def add_task(case_id: str, body: TaskIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _task_out(service.add_task(db, c, body.model_dump(), me.user_id))


@router.patch("/cases/{case_id}/tasks/{task_id}", response_model=TaskOut)
def update_task(case_id: str, task_id: int, body: dict, db: DB, me: Me):
    _get_or_404(db, case_id, me.tenant_id)
    from sqlalchemy import select as _sel
    task = db.scalar(_sel(CaseTask).where(CaseTask.id == task_id))
    if not task:
        raise HTTPException(404, "Task not found")
    for f in ("title", "status", "assignee"):
        if f in body:
            setattr(task, f, body[f])
    db.commit()
    db.refresh(task)
    return _task_out(task)


@router.post("/cases/{case_id}/messages", response_model=MessageOut, status_code=201)
def send_message(case_id: str, body: MessageIn, db: DB, me: Me):
    c = _get_or_404(db, case_id, me.tenant_id)
    return _msg_out(service.add_message(db, c, body.text, me.user_id))


@router.delete("/cases/{case_id}/evidence/{evidence_id}", status_code=204)
def delete_evidence(case_id: str, evidence_id: int, db: DB, me: Me):
    _get_or_404(db, case_id, me.tenant_id)
    from sqlalchemy import select as _sel, delete as _del
    db.execute(_del(CaseEvidence).where(CaseEvidence.id == evidence_id))
    db.commit()
