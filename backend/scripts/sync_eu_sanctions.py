"""Daily EU Consolidated Financial Sanctions sync.

Downloads the EU sanctions XML from Europa webgate, extracts entities with
Ethereum crypto addresses, and upserts into sanctions_entries + address_labels.

EU XML schema: each <sanctionEntity> has <identificationDocument> elements where
documentType="Cryptocurrency Address" carries the value.

Source: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content

Run manually:
    python -m scripts.sync_eu_sanctions
Scheduled at 03:15 UTC.
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

EU_XML_URL = (
    "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content"
    "?token=dG9rZW4tMjAxNy0wMS0wMVQwMDowMDowMA=="
)
SOURCE_KEY = "eu_consolidated"
CHAIN_ID_ETH = 1

CRYPTO_DOC_TYPES = {
    "Cryptocurrency Address",
    "Digital Currency Address",
    "Virtual Asset Identifier",
}


def _fetch_xml() -> bytes:
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(EU_XML_URL)
        r.raise_for_status()
        return r.content


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d %b %Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _extract_entities(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    # EU XML uses namespace: xmlns="http://eu.europa.ec/fsd/export/xmlFullSanctionsList/1.1"
    ns = ""
    if "}" in root.tag:
        ns = root.tag.split("}")[0] + "}"

    t = lambda name: f"{ns}{name}"  # noqa: E731

    entities = []
    for entity in root.iter(t("sanctionEntity")):
        logical_id = entity.get("logicalId", "")
        subject_type = entity.findtext(f".//{t('subjectType')}/{t('code')}") or "entity"
        entity_type = {
            "P": "individual",
            "E": "entity",
            "V": "vessel",
            "A": "aircraft",
        }.get(subject_type, "entity")

        # Names — take the first "WHOLE_NAME" or build from parts
        names = []
        for name_alias in entity.findall(f".//{t('nameAlias')}"):
            whole = name_alias.get("wholeName") or name_alias.findtext(t("wholeName")) or ""
            if whole:
                names.append(whole.strip())
        entity_name = names[0] if names else f"EU-{logical_id}"
        aliases = names[1:] if len(names) > 1 else []

        # Designation date
        reg_date = entity.findtext(f".//{t('regulationSummary')}/{t('publicationDate')}") or ""
        designated_at = _parse_date(reg_date)

        # Programs / regulation
        regulation = entity.findtext(f".//{t('regulationSummary')}/{t('numberTitle')}") or ""

        # Countries
        countries = list({
            c.get("iso2Code", "")
            for c in entity.findall(f".//{t('citizenship')}")
            if c.get("iso2Code")
        })

        # Crypto addresses
        crypto = []
        for id_doc in entity.findall(f".//{t('identificationDocument')}"):
            doc_type = (
                id_doc.findtext(t("documentType"))
                or id_doc.get("documentType", "")
            ).strip()
            if doc_type not in CRYPTO_DOC_TYPES:
                continue
            number = (id_doc.findtext(t("number")) or "").strip().lower()
            if number.startswith("0x") and len(number) == 42:
                crypto.append({"chain": "ETH", "address": number})

        if not crypto:
            continue

        entities.append({
            "entity_ref": logical_id,
            "entity_name": entity_name,
            "entity_type": entity_type,
            "program": regulation or None,
            "designated_at": designated_at,
            "crypto_addresses": crypto,
            "aliases": aliases,
            "countries": countries,
        })

    return entities


def run_sync() -> dict:
    log.info("EU sanctions sync starting")
    started_at = datetime.now(UTC)

    xml_bytes = _fetch_xml()
    content_sha = hashlib.sha256(xml_bytes).hexdigest()
    entities = _extract_entities(xml_bytes)
    log.info("EU: %d entities with ETH addresses", len(entities))

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            return {"status": "error", "message": f"label_source '{SOURCE_KEY}' not seeded — run migration 0016"}

        label_import = LabelImport(
            source_key=SOURCE_KEY,
            started_at=started_at,
            retrieved_from=EU_XML_URL,
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
            stmt = (
                pg_insert(SanctionsEntry)
                .values(
                    list_source="EU",
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
                        "aliases": ent["aliases"],
                        "countries": ent["countries"],
                        "raw_data": ent,
                        "import_id": label_import.id,
                        "content_sha256": sha,
                        "synced_at": started_at,
                    },
                    where=SanctionsEntry.__table__.c.content_sha256 != sha,
                )
                .returning(SanctionsEntry.__table__.c.id)
            )
            result = db.execute(stmt)
            (upserted if result.rowcount else unchanged).__class__  # count
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
                        attributes={"program": ent["program"], "list": "EU"},
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
    log.info("EU sanctions sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    print(run_sync())
