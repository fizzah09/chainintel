"""Weekly UN Security Council Consolidated List sync.

Downloads the UN SC XML, extracts INDIVIDUAL and ENTITY records with
Ethereum crypto addresses, and upserts into sanctions_entries + address_labels.

Source: https://scsanctions.un.org/resources/xml/en/consolidated.xml

Run manually:
    python -m scripts.sync_un_sanctions
Scheduled Sundays at 03:45 UTC.
"""

import hashlib
import logging
import xml.etree.ElementTree as ET
from datetime import UTC, date, datetime

import httpx
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource, SanctionsEntry

log = logging.getLogger(__name__)

UN_XML_URL = "https://scsanctions.un.org/resources/xml/en/consolidated.xml"
SOURCE_KEY = "un_consolidated"
CHAIN_ID_ETH = 1


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d %b %Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _build_name(elem, ns: str) -> str:
    t = lambda n: f"{ns}{n}" if ns else n  # noqa: E731
    parts = [
        elem.findtext(t("FIRST_NAME")) or "",
        elem.findtext(t("SECOND_NAME")) or "",
        elem.findtext(t("THIRD_NAME")) or "",
        elem.findtext(t("FOURTH_NAME")) or "",
        elem.findtext(t("NAME")) or "",           # ENTITY name field
    ]
    return " ".join(p for p in parts if p).strip()


def _extract_crypto(elem, ns: str) -> list[dict]:
    t = lambda n: f"{ns}{n}" if ns else n  # noqa: E731
    crypto = []
    for doc in elem.findall(f".//{t('INDIVIDUAL_DOCUMENT')}") + elem.findall(f".//{t('ENTITY_DOCUMENT')}"):
        doc_type = (doc.findtext(t("TYPE_OF_DOCUMENT")) or "").lower()
        number = (doc.findtext(t("NUMBER")) or "").strip().lower()
        if "crypto" in doc_type or "ethereum" in doc_type or "digital currency" in doc_type:
            if number.startswith("0x") and len(number) == 42:
                crypto.append({"chain": "ETH", "address": number})
    return crypto


def _extract_entities(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    ns = ""
    if "}" in root.tag:
        ns = root.tag.split("}")[0] + "}"
    t = lambda n: f"{ns}{n}" if ns else n  # noqa: E731

    entities = []
    # Process INDIVIDUALS
    for indiv in root.iter(t("INDIVIDUAL")):
        crypto = _extract_crypto(indiv, ns)
        if not crypto:
            continue
        ref = indiv.findtext(t("DATAID")) or indiv.findtext(t("REFERENCE_NUMBER")) or ""
        name = _build_name(indiv, ns)
        nationality = indiv.findtext(f".//{t('NATIONALITY')}/{t('VALUE')}") or ""
        listed_on = _parse_date(indiv.findtext(t("LISTED_ON")))
        committee = indiv.findtext(t("UN_LIST_TYPE")) or ""
        entities.append({
            "entity_ref": f"UN-I-{ref}",
            "entity_name": name or f"UN-INDIVIDUAL-{ref}",
            "entity_type": "individual",
            "program": committee or None,
            "designated_at": listed_on,
            "crypto_addresses": crypto,
            "aliases": [],
            "countries": [nationality] if nationality else [],
        })

    # Process ENTITIES
    for ent in root.iter(t("ENTITY")):
        crypto = _extract_crypto(ent, ns)
        if not crypto:
            continue
        ref = ent.findtext(t("DATAID")) or ent.findtext(t("REFERENCE_NUMBER")) or ""
        name = _build_name(ent, ns) or ent.findtext(f".//{t('ENTITY_NAME')}") or f"UN-ENTITY-{ref}"
        listed_on = _parse_date(ent.findtext(t("LISTED_ON")))
        committee = ent.findtext(t("UN_LIST_TYPE")) or ""
        entities.append({
            "entity_ref": f"UN-E-{ref}",
            "entity_name": name,
            "entity_type": "entity",
            "program": committee or None,
            "designated_at": listed_on,
            "crypto_addresses": crypto,
            "aliases": [],
            "countries": [],
        })

    return entities


def run_sync() -> dict:
    log.info("UN SC sanctions sync starting")
    started_at = datetime.now(UTC)

    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(UN_XML_URL)
        r.raise_for_status()
        xml_bytes = r.content

    content_sha = hashlib.sha256(xml_bytes).hexdigest()
    entities = _extract_entities(xml_bytes)
    log.info("UN: %d entities with ETH addresses", len(entities))

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            return {"status": "error", "message": f"label_source '{SOURCE_KEY}' not seeded — run migration 0016"}

        label_import = LabelImport(
            source_key=SOURCE_KEY,
            started_at=started_at,
            retrieved_from=UN_XML_URL,
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
                    list_source="UN",
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
                        attributes={"program": ent["program"], "list": "UN"},
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
    log.info("UN sanctions sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
