"""M6 case management service: CRUD and stage transitions."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.m6_cases.models import Case, CaseEvidence, CaseMessage, CaseNote, CaseSubject, CaseTask

STAGES = ["Open", "Assigned", "Evidence Collection", "Analysis", "Under Review", "Decision", "Closed"]
NEXT_STAGE = {s: STAGES[i + 1] for i, s in enumerate(STAGES[:-1])}


def _now() -> datetime:
    return datetime.now(UTC)


def _next_ref(db: Session, tenant_id: str) -> str:
    count = db.scalar(select(func.count()).select_from(Case).where(Case.tenant_id == tenant_id)) or 0
    return f"CASE-{str(count + 1).zfill(4)}"


def create_case(db: Session, principal, data: dict) -> Case:
    case = Case(
        public_id=__import__("uuid").uuid4().__str__(),
        case_ref=_next_ref(db, principal.tenant_id),
        tenant_id=principal.tenant_id,
        title=data["title"],
        description=data.get("description", ""),
        status=data.get("status", "Open"),
        priority=data.get("priority", "Medium"),
        case_type=data.get("case_type", "Investigation"),
        source=data.get("source", ""),
        created_at=_now(),
        updated_at=_now(),
        created_by=principal.user_id,
        assigned_to=data.get("assigned_to"),
        due_date=data.get("due_date"),
        tags=data.get("tags", []),
    )
    db.add(case)
    db.flush()
    # Initial subjects
    for s in data.get("subjects", []):
        db.add(CaseSubject(
            case_id=case.id, kind=s["kind"], ref=s["ref"], role=s.get("role", "Primary"),
            added_at=_now(), added_by=principal.user_id,
            chain_id=s.get("chain_id"), risk_score=s.get("risk_score"), label=s.get("label"),
        ))
    db.commit()
    db.refresh(case)
    return case


def update_case(db: Session, case: Case, data: dict, user_id: str) -> Case:
    for field in ("title", "description", "priority", "case_type", "assigned_to", "due_date", "tags"):
        if field in data:
            setattr(case, field, data[field])
    case.updated_at = _now()
    db.commit()
    db.refresh(case)
    return case


def advance_status(db: Session, case: Case, new_status: str, user_id: str, reason: str = "") -> Case:
    case.prev_status = case.status
    case.status = new_status
    case.updated_at = _now()
    if new_status == "Closed":
        case.closed_at = _now()
        case.closed_by = user_id
        case.close_reason = reason
    db.add(CaseMessage(
        case_id=case.id, text=f"Status changed to {new_status}" + (f": {reason}" if reason else ""),
        author=user_id, at=_now(), is_system=True,
    ))
    db.commit()
    db.refresh(case)
    return case


def add_subject(db: Session, case: Case, data: dict, user_id: str) -> CaseSubject:
    s = CaseSubject(
        case_id=case.id, kind=data["kind"], ref=data["ref"], role=data.get("role", "Related"),
        added_at=_now(), added_by=user_id,
        chain_id=data.get("chain_id"), risk_score=data.get("risk_score"), label=data.get("label"),
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def add_evidence(db: Session, case: Case, data: dict, user_id: str) -> CaseEvidence:
    ev = CaseEvidence(
        case_id=case.id, title=data["title"], evidence_type=data.get("type", "Document"),
        content=data.get("content"), url=data.get("url"), hash_sha256=data.get("hash"),
        added_at=_now(), added_by=user_id, tags=data.get("tags", []),
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def add_note(db: Session, case: Case, text: str, author: str, is_internal: bool = True) -> CaseNote:
    note = CaseNote(
        case_id=case.id, text=text, author=author,
        created_at=_now(), updated_at=_now(), is_internal=is_internal,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def add_task(db: Session, case: Case, data: dict, user_id: str) -> CaseTask:
    task = CaseTask(
        case_id=case.id, title=data["title"], status="Open",
        assignee=data.get("assignee"), due_date=data.get("due_date"),
        created_at=_now(), created_by=user_id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def add_message(db: Session, case: Case, text: str, author: str) -> CaseMessage:
    msg = CaseMessage(case_id=case.id, text=text, author=author, at=_now())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_case(db: Session, public_id: str, tenant_id: str) -> Case | None:
    return db.scalar(select(Case).where(Case.public_id == public_id, Case.tenant_id == tenant_id))


def list_cases(db: Session, tenant_id: str, status: str | None = None, limit: int = 50, offset: int = 0) -> list[Case]:
    q = select(Case).where(Case.tenant_id == tenant_id)
    if status:
        q = q.where(Case.status == status)
    return list(db.scalars(q.order_by(Case.id.desc()).limit(limit).offset(offset)).all())
