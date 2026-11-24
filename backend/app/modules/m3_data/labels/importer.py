"""Versioned label import. Never overwrites: a changed label closes the old row and adds a new one;
a label the source dropped is closed (inactive) and kept. Every run is logged in `label_imports`.

Safety: if a download suddenly has far fewer rows than the labels currently active (a truncated file,
an outage page), the import is rejected instead of closing most of the sanctions list.
"""

import hashlib
from collections.abc import Callable
from datetime import UTC, datetime
from decimal import Decimal

from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.modules.m3_data.labels.sources import LabelRecord, SourceSpec
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource

SHRINK_GUARD_MIN_ACTIVE = 20
SHRINK_GUARD_RATIO = 0.5


def _now() -> datetime:
    return datetime.now(UTC)


class ImportReport(BaseModel):
    import_id: int
    source_key: str
    status: str  # applied | unchanged | rejected
    records: int
    skipped: int
    added: int = 0
    changed: int = 0
    removed: int = 0
    unchanged: int = 0
    message: str | None = None


def sync_source_register(db: Session, spec: SourceSpec, now: datetime) -> LabelSource:
    src = db.get(LabelSource, spec.key) or LabelSource(key=spec.key)
    src.name, src.url, src.licence = spec.name, spec.url, spec.licence
    src.commercial_use, src.refresh, src.notes = spec.commercial_use, spec.refresh, spec.notes
    src.default_confidence = Decimal(str(spec.default_confidence))
    src.updated_at = now
    db.add(src)
    db.flush()
    return src


def _content(r: LabelRecord) -> tuple:
    return (r.category, r.name, Decimal(str(r.confidence)).quantize(Decimal("0.01")), r.source_ref, r.attributes)


def _row_content(row: AddressLabel) -> tuple:
    return (row.category, row.name, Decimal(row.confidence).quantize(Decimal("0.01")), row.source_ref, row.attributes)


def _problems_note(problems: list[str], skipped: int) -> str | None:
    if not problems:
        return None
    shown = problems[:20]
    more = f" (+{skipped - len(shown)} more)" if skipped > len(shown) else ""
    return f"skipped {skipped}: " + "; ".join(shown) + more


class LabelImporter:
    def __init__(self, db: Session, clock: Callable[[], datetime] = _now):
        self.db = db
        self.clock = clock

    def run(self, spec: SourceSpec, raw: bytes, retrieved_from: str, force: bool = False) -> ImportReport:
        now = self.clock()
        digest = hashlib.sha256(raw).hexdigest()
        parsed = spec.parser(raw, spec)
        sync_source_register(self.db, spec, now)

        log = LabelImport(
            source_key=spec.key, started_at=now, retrieved_from=retrieved_from, content_sha256=digest,
            licence=spec.licence, commercial_use=spec.commercial_use, status="applied",
            records=len(parsed.records), skipped=parsed.skipped,
            added=0, changed=0, removed=0, unchanged=0,
            message=_problems_note(parsed.problems, parsed.skipped),
        )
        self.db.add(log)
        self.db.flush()

        last = self.db.scalar(
            select(LabelImport)
            .where(LabelImport.source_key == spec.key, LabelImport.status == "applied", LabelImport.id != log.id)
            .order_by(LabelImport.id.desc())
            .limit(1)
        )
        if last is not None and last.content_sha256 == digest and not force:
            log.status, log.message = "unchanged", f"same content as import {last.id}"
            return self._finish(log)

        # Keep the first record per (network, chain, address); sources occasionally repeat an entry.
        incoming: dict[tuple[str, int, str], LabelRecord] = {}
        for r in parsed.records:
            incoming.setdefault((r.network, r.chain_id, r.address), r)

        current = {
            (row.network, row.chain_id, row.address): row
            for row in self.db.scalars(
                select(AddressLabel).where(AddressLabel.source_key == spec.key, AddressLabel.valid_to.is_(None))
            )
        }
        if (
            not force
            and len(current) >= SHRINK_GUARD_MIN_ACTIVE
            and len(incoming) < SHRINK_GUARD_RATIO * len(current)
        ):
            log.status = "rejected"
            log.message = (
                f"refused: {len(incoming)} records vs {len(current)} active labels "
                f"(below {int(SHRINK_GUARD_RATIO * 100)}%). Check the download, or re-run with force."
            )
            return self._finish(log)

        to_close: list[int] = []
        new_rows: list[AddressLabel] = []
        for key, rec in incoming.items():
            row = current.get(key)
            if row is None:
                log.added += 1
            elif _row_content(row) != _content(rec):
                log.changed += 1
                to_close.append(row.id)
            else:
                log.unchanged += 1
                continue
            new_rows.append(
                AddressLabel(
                    source_key=spec.key, network=rec.network, chain_id=rec.chain_id, address=rec.address,
                    category=rec.category,
                    name=rec.name, confidence=Decimal(str(rec.confidence)), source_ref=rec.source_ref,
                    attributes=rec.attributes, valid_from=now, valid_to=None, import_id=log.id,
                )
            )
        gone = [row.id for key, row in current.items() if key not in incoming]
        log.removed = len(gone)
        to_close += gone

        # Close first so the "one current label" unique index never sees two open rows.
        for i in range(0, len(to_close), 5000):
            self.db.execute(
                update(AddressLabel)
                .where(AddressLabel.id.in_(to_close[i : i + 5000]))
                .values(valid_to=now, ended_by_import_id=log.id)
            )
        self.db.add_all(new_rows)
        return self._finish(log)

    def _finish(self, log: LabelImport) -> ImportReport:
        self.db.commit()
        return ImportReport(
            import_id=log.id, source_key=log.source_key, status=log.status, records=log.records,
            skipped=log.skipped, added=log.added, changed=log.changed, removed=log.removed,
            unchanged=log.unchanged, message=log.message,
        )
