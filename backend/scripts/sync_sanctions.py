"""Daily OFAC SDN sanctions sync.

Downloads the OFAC SDN XML, extracts entities with Ethereum crypto addresses,
upserts into sanctions_entries, and writes corresponding address_labels rows
(category='sanctions') so the risk engine can look them up without joining.

Run manually:
    python -m scripts.sync_sanctions

Scheduled automatically at 03:00 UTC by the intel scheduler (m3_data/intel_scheduler.py).
"""

import hashlib
import io
import logging
import xml.etree.ElementTree as ET
from datetime import UTC, date, datetime

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.core.db import _session_factory
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource, SanctionsEntry

log = logging.getLogger(__name__)

OFAC_SDN_XML_URL = "https://sanctionslist.ofac.treas.gov/Home/SdnList"
OFAC_SDN_XML_DIRECT = "https://www.treasury.gov/ofac/downloads/sdn.xml"
SOURCE_KEY = "ofac_sdn"
CHAIN_ID_ETH = 1

# OFAC tags Digital Currency Address as these idType values:
ETH_ID_TYPES = {
    "Digital Currency Address - ETH",
    "Digital Currency Address - USDT",   # TRC-20 USDT but sometimes ETH
    "Digital Currency Address - USDC",
    "Digital Currency Address - DAI",
    "Digital Currency Address - WBTC",
}


def _fetch_xml() -> bytes:
    with httpx.Client(timeout=60, follow_redirects=True) as client:
        r = client.get(OFAC_SDN_XML_DIRECT)
        r.raise_for_status()
        return r.content


def _parse_date(s: str | None) -> date | None:
    if not s:
        return None
    for fmt in ("%d %b %Y", "%Y-%m-%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(s.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _extract_entities(xml_bytes: bytes) -> list[dict]:
    """Return list of entity dicts that have at least one Ethereum address."""
    root = ET.fromstring(xml_bytes)
    ns = {"s": root.tag.split("}")[0].lstrip("{") if "}" in root.tag else ""}
    # OFAC XML has no namespace prefix after 2023 rebuild — handle both.
    tag = lambda name: f"{{{ns['s']}}}{name}" if ns["s"] else name  # noqa: E731

    entities = []
    for entry in root.iter(tag("sdnEntry")):
        uid = entry.findtext(tag("uid")) or ""
        last = entry.findtext(tag("lastName")) or ""
        first = entry.findtext(tag("firstName")) or ""
        entity_name = f"{last}, {first}".strip(", ") or last

        entity_type_raw = entry.findtext(tag("sdnType")) or "entity"
        entity_type = {
            "Individual": "individual",
            "Entity": "entity",
            "Vessel": "vessel",
            "Aircraft": "aircraft",
        }.get(entity_type_raw, "entity")

        # Programs
        programs = [p.text for p in entry.findall(f".//{tag('program')}") if p.text]

        # Aliases
        aliases = []
        for aka in entry.findall(f".//{tag('aka')}"):
            fn = aka.findtext(tag("firstName")) or ""
            ln = aka.findtext(tag("lastName")) or ""
            alias = f"{ln}, {fn}".strip(", ") or ln
            if alias:
                aliases.append(alias)

        # Designation date (not in SDN XML directly, use remarks approximation)
        # OFAC SDN XML does not include designation date — use None; EU/UK do.
        designated_at = None

        # Countries
        nationalities = [
            n.text for n in entry.findall(f".//{tag('nationality')}/{tag('country')}") if n.text
        ]
        addresses_countries = [
            a.findtext(tag("country"))
            for a in entry.findall(f".//{tag('address')}")
            if a.findtext(tag("country"))
        ]
        countries = list(dict.fromkeys(nationalities + addresses_countries))

        # Crypto addresses (Ethereum only)
        crypto = []
        for id_elem in entry.findall(f".//{tag('id')}"):
            id_type = id_elem.findtext(tag("idType")) or ""
            id_number = id_elem.findtext(tag("idNumber")) or ""
            if id_type in ETH_ID_TYPES and id_number.startswith("0x") and len(id_number) == 42:
                crypto.append({"chain": "ETH", "address": id_number.lower()})

        if not crypto:
            continue  # skip entities with no Ethereum addresses

        entities.append({
            "entity_ref": uid,
            "entity_name": entity_name,
            "entity_type": entity_type,
            "program": "; ".join(programs) if programs else None,
            "designated_at": designated_at,
            "is_active": True,
            "crypto_addresses": crypto,
            "aliases": aliases,
            "countries": countries,
        })

    return entities


def run_sync() -> dict:
    """Download OFAC SDN, upsert into sanctions_entries + address_labels. Returns summary."""
    log.info("OFAC SDN sync starting")
    started_at = datetime.now(UTC)

    xml_bytes = _fetch_xml()
    content_sha = hashlib.sha256(xml_bytes).hexdigest()
    log.info("OFAC SDN fetched: %d bytes, sha256=%s…", len(xml_bytes), content_sha[:12])

    entities = _extract_entities(xml_bytes)
    log.info("Entities with ETH addresses: %d", len(entities))

    with _session_factory()() as db:
        source: LabelSource = db.get(LabelSource, SOURCE_KEY)
        if source is None:
            log.error("label_source '%s' not found — run migration 0014 first", SOURCE_KEY)
            return {"status": "error", "message": "label_source not seeded"}

        # Create label_import record
        label_import = LabelImport(
            source_key=SOURCE_KEY,
            started_at=started_at,
            retrieved_from=OFAC_SDN_XML_DIRECT,
            content_sha256=content_sha,
            licence=source.licence,
            commercial_use=source.commercial_use,
            status="applied",
            records=len(entities),
        )
        db.add(label_import)
        db.flush()  # get import id

        added = updated = unchanged = label_added = label_updated = 0

        for ent in entities:
            sha = hashlib.sha256(str(ent).encode()).hexdigest()

            # Upsert into sanctions_entries
            stmt = (
                pg_insert(SanctionsEntry)
                .values(
                    list_source="OFAC_SDN",
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
                    where=SanctionsEntry.__table__.c.content_sha256 != sha,  # skip unchanged
                )
                .returning(SanctionsEntry.__table__.c.id)
            )
            result = db.execute(stmt)
            if result.rowcount:
                added += 1  # simplified — could distinguish add vs update with extra query
            else:
                unchanged += 1

            # Upsert each ETH address into address_labels (category='sanctions')
            for addr_rec in ent["crypto_addresses"]:
                addr = addr_rec["address"]
                label_stmt = (
                    pg_insert(AddressLabel)
                    .values(
                        source_key=SOURCE_KEY,
                        network="evm",
                        chain_id=CHAIN_ID_ETH,
                        address=addr,
                        category="sanctions",
                        name=ent["entity_name"],
                        confidence=source.default_confidence,
                        source_ref=ent["entity_ref"],
                        attributes={"program": ent["program"], "entity_type": ent["entity_type"]},
                        valid_from=started_at,
                        valid_to=None,
                        import_id=label_import.id,
                        ended_by_import_id=None,
                    )
                    .on_conflict_do_update(
                        index_elements=None,
                        constraint="uq_address_labels_current",
                        set_={
                            "name": ent["entity_name"],
                            "attributes": {"program": ent["program"]},
                            "import_id": label_import.id,
                        },
                    )
                )
                db.execute(label_stmt)
                label_added += 1

        # Mark previously active labels from this source as ended if address no longer in list
        active_in_this_run = {
            a["address"]
            for ent in entities
            for a in ent["crypto_addresses"]
        }
        stale = db.scalars(
            select(AddressLabel)
            .where(
                AddressLabel.source_key == SOURCE_KEY,
                AddressLabel.valid_to.is_(None),
                AddressLabel.address.notin_(active_in_this_run),
            )
        ).all()
        for lbl in stale:
            lbl.valid_to = started_at
            lbl.ended_by_import_id = label_import.id
        label_updated += len(stale)

        label_import.added = added
        label_import.changed = updated
        label_import.unchanged = unchanged
        label_import.removed = label_updated

        db.commit()

    summary = {
        "status": "ok",
        "source": SOURCE_KEY,
        "xml_bytes": len(xml_bytes),
        "entities_with_eth": len(entities),
        "upserted": added,
        "unchanged": unchanged,
        "labels_written": label_added,
        "labels_delisted": label_updated,
        "duration_s": round((datetime.now(UTC) - started_at).total_seconds(), 1),
    }
    log.info("OFAC SDN sync complete: %s", summary)
    return summary


if __name__ == "__main__":
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    result = run_sync()
    print(result)
