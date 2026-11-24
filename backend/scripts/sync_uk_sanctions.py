"""Daily UK OFSI Consolidated Sanctions sync.

Downloads the OFSI ConList.json from Azure blob, extracts Ethereum addresses
from FinancialIdentifiers, and upserts into sanctions_entries + address_labels.

Source: https://ofsistorage.blob.core.windows.net/publishlive/2022format/ConList.json

Run manually:
    python -m scripts.sync_uk_sanctions
Scheduled at 03:30 UTC.
"""

import hashlib
import logging
from datetime import UTC, date, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource, SanctionsEntry

log = logging.getLogger(__name__)

UK_JSON_URL = "https://ofsistorage.blob.core.windows.net/publishlive/2022format/ConList.json"
SOURCE_KEY = "uk_ofsi"
CHAIN_ID_ETH = 1

ETH_ID_TYPES = {
    "Cryptocurrency Address",
    "Digital Currency Address",
    "Ethereum Address",
    "Virtual Currency",
}


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s.strip()[:10], fmt[:8]).date()
        except (ValueError, IndexError):
            pass
    try:
        return datetime.fromisoformat(s.strip().replace("Z", "+00:00")).date()
    except ValueError:
        return None


def _extract_entities(data: dict) -> list[dict]:
    entities = []
    for designation in data.get("Designations", []):
        ref = str(designation.get("UniqueID", ""))
        names_data = designation.get("Names", [])
        name6 = designation.get("Name6", "")  # 2022 format primary name field
        # Build primary name
        if name6:
            entity_name = name6
        elif names_data:
            n = names_data[0]
            parts = [n.get("Title",""), n.get("Name1",""), n.get("Name2",""),
                     n.get("Name3",""), n.get("Name4",""), n.get("Name5","")]
            entity_name = " ".join(p for p in parts if p).strip()
        else:
            entity_name = f"UK-{ref}"

        aliases = [name6] if name6 and names_data else []
        for n in (names_data[1:] if names_data else []):
            parts = [n.get("Name1",""), n.get("Name2",""), n.get("Name6","")]
            alias = " ".join(p for p in parts if p).strip()
            if alias:
                aliases.append(alias)

        entity_type_raw = designation.get("GroupType", "Individual")
        entity_type = "individual" if entity_type_raw == "Individual" else "entity"

        regime = designation.get("RegimeName", "")
        date_designated = _parse_date(designation.get("DateDesignated"))

        # Countries
        nationalities = [designation.get("Nationality", "")] if designation.get("Nationality") else []
        countries = [c for c in nationalities if c]

        # Crypto addresses
        crypto = []
        for fi in designation.get("FinancialIdentifiers", []):
            fi_type = fi.get("FinancialIdentifierType", "")
            fi_value = (fi.get("FinancialIdentifierValue") or "").strip().lower()
            if fi_type in ETH_ID_TYPES and fi_value.startswith("0x") and len(fi_value) == 42:
                crypto.append({"chain": "ETH", "address": fi_value})

        if not crypto:
            continue

        entities.append({
            "entity_ref": ref,
            "entity_name": entity_name,
            "entity_type": entity_type,
            "program": regime or None,
            "designated_at": date_designated,
            "crypto_addresses": crypto,
            "aliases": aliases,
            "countries": countries,
        })

    return entities


def run_sync() -> dict:
    log.info("UK OFSI sync starting")
    started_at = datetime.now(UTC)

    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(UK_JSON_URL)
        r.raise_for_status()
        raw_bytes = r.content
        data = r.json()

    content_sha = hashlib.sha256(raw_bytes).hexdigest()
    entities = _extract_entities(data)
    log.info("UK OFSI: %d entities with ETH addresses", len(entities))

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            return {"status": "error", "message": f"label_source '{SOURCE_KEY}' not seeded — run migration 0016"}

        label_import = LabelImport(
            source_key=SOURCE_KEY,
            started_at=started_at,
            retrieved_from=UK_JSON_URL,
            content_sha256=content_sha,
            licence=source.licence,
            commercial_use=source.commercial_use,
            status="applied",
            records=len(entities),
        )
        db.add(label_import)
        db.flush()

        upserted = unchanged = label_written = 0
        for ent in entities:
            sha = hashlib.sha256(str(ent).encode()).hexdigest()
            result = db.execute(
                pg_insert(SanctionsEntry)
                .values(
                    list_source="UK",
                    entity_ref=ent["entity_ref"],
                    entity_name=ent["entity_name"],
                    entity_type=ent["entity_type"],
                    program=ent["program"],
                    designation_reason=None,
                    designated_at=ent["designated_at"],
                    is_active=True,
                    crypto_addresses=ent["crypto_addresses"],
                    aliases=ent["aliases"],
                    countries=ent["countries"],
                    raw_data=ent,
                    import_id=label_import.id,
                    content_sha256=sha,
                    synced_at=started_at,
                )
                .on_conflict_do_update(
                    constraint="uq_sanctions_entries_ref",
                    set_={
                        "entity_name": ent["entity_name"],
                        "program": ent["program"],
                        "is_active": True,
                        "crypto_addresses": ent["crypto_addresses"],
                        "import_id": label_import.id,
                        "content_sha256": sha,
                        "synced_at": started_at,
                    },
                    where=SanctionsEntry.__table__.c.content_sha256 != sha,
                )
                .returning(SanctionsEntry.__table__.c.id)
            )
            if result.rowcount:
                upserted += 1
            else:
                unchanged += 1

            for addr_rec in ent["crypto_addresses"]:
                db.execute(
                    pg_insert(AddressLabel)
                    .values(
                        source_key=SOURCE_KEY,
                        network="evm",
                        chain_id=CHAIN_ID_ETH,
                        address=addr_rec["address"],
                        category="sanctions",
                        name=ent["entity_name"],
                        confidence=source.default_confidence,
                        source_ref=ent["entity_ref"],
                        attributes={"program": ent["program"], "list": "UK"},
                        valid_from=started_at,
                        valid_to=None,
                        import_id=label_import.id,
                        ended_by_import_id=None,
                    )
                    .on_conflict_do_update(
                        constraint="uq_address_labels_current",
                        set_={"name": ent["entity_name"], "import_id": label_import.id},
                    )
                )
                label_written += 1

        db.commit()

    summary = {
        "status": "ok", "source": SOURCE_KEY,
        "entities": len(entities), "upserted": upserted, "unchanged": unchanged,
        "labels": label_written,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("UK OFSI sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
