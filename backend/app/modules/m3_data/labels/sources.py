"""Label sources and their parsers. Each source carries its licence: this registry is copied into the
`label_sources` table (the licence register) on every import.

Adding a source = one `SourceSpec` + one parser that turns the raw file into `LabelRecord`s.
"""

import csv
import io
import json
import re
import tarfile
import xml.etree.ElementTree as ET
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date
from urllib.parse import urlparse

from app.modules.m3_data.labels import address_formats as af

_ADDRESS = re.compile(r"^0x[0-9a-f]{40}$")


@dataclass(frozen=True)
class LabelRecord:
    address: str
    category: str
    name: str
    confidence: float
    chain_id: int = 0  # 0 = every EVM chain (and always 0 on non-EVM networks)
    source_ref: str | None = None
    attributes: dict = field(default_factory=dict)
    network: str = af.EVM  # evm | bitcoin | tron | ... (address_formats.NETWORKS)


@dataclass(frozen=True)
class Parsed:
    records: list[LabelRecord]
    skipped: int  # rows dropped because the address was not valid for its network
    problems: list[str] = field(default_factory=list)  # why rows were skipped (first ones), for the import log


@dataclass(frozen=True)
class SourceSpec:
    key: str
    name: str
    url: str | None
    licence: str
    commercial_use: str  # allowed | not_allowed | unverified
    default_confidence: float
    refresh: str
    parser: Callable[[bytes, "SourceSpec"], Parsed]
    notes: str | None = None


def _addr(v: object) -> str | None:
    a = str(v or "").strip().lower()
    return a if _ADDRESS.match(a) else None


# ---- parsers --------------------------------------------------------------------------------------


def parse_ofac(raw: bytes, spec: SourceSpec) -> Parsed:
    """CSV with `address` and `name` columns (ultrasoundmoney/ofac-ethereum-addresses)."""
    records, skipped = [], 0
    for row in csv.DictReader(io.StringIO(raw.decode("utf-8-sig"))):
        a = _addr(row.get("address"))
        if not a:
            skipped += 1
            continue
        records.append(
            LabelRecord(address=a, category="sanctions", name=(row.get("name") or "").strip()[:300],
                        confidence=spec.default_confidence, source_ref="OFAC SDN")
        )
    return Parsed(records, skipped)


def parse_mew_darklist(raw: bytes, spec: SourceSpec) -> Parsed:
    """JSON list of {address, comment, date} (MyEtherWallet/ethereum-lists addresses-darklist.json)."""
    records, skipped = [], 0
    for item in json.loads(raw):
        a = _addr(item.get("address") if isinstance(item, dict) else None)
        if not a:
            skipped += 1
            continue
        comment = str(item.get("comment") or "").strip()
        category = "phishing" if "phish" in comment.lower() else "scam"
        records.append(
            LabelRecord(address=a, category=category, name=comment[:300], confidence=spec.default_confidence,
                        source_ref=str(item.get("date") or "") or None)
        )
    return Parsed(records, skipped)


_EXCHANGES = {
    "binance", "binance-deposit", "coinbase", "kraken", "kucoin", "okx", "okex", "huobi", "bitfinex",
    "gemini", "ftx", "bittrex", "poloniex", "gate-io", "bybit", "crypto-com", "bitstamp", "upbit",
    "exchange",
}
# Community tags never produce "sanctions": only an official list decides that. (Example: Tornado
# Cash was delisted by OFAC in March 2025, but old scrapes still tag it "ofac-sanctions-lists".)
# The original tags stay in `attributes` for analysts.
_TAG_CATEGORY = [
    ({"tornado-cash", "ethereum-mixer"}, "mixer"),
    ({"take-action", "exploit", "heist", "hack", "phish-hack"}, "hack"),
    ({"phishing"}, "phishing"),
    ({"scam"}, "scam"),
    ({"gambling"}, "gambling"),
    (_EXCHANGES, "exchange"),
    ({"bridge"}, "bridge"),
    ({"dex", "defi", "yield-farming", "staking", "lending", "sushiswap", "balancer", "curve-fi", "aave",
      "uniswap", "bancor", "compound", "yearn-finance"}, "defi"),
]


def _category_from_tags(tags: list[str]) -> str:
    s = set(tags)
    for keys, category in _TAG_CATEGORY:  # ordered: risk categories win over service categories
        if s & keys:
            return category
    return "other"


def parse_etherscan_labels(raw: bytes, spec: SourceSpec) -> Parsed:
    """{address: {name, labels[]}} (brianleect/etherscan-labels, as bundled in the legacy graph API)."""
    records, skipped = [], 0
    for address, info in json.loads(raw).items():
        a = _addr(address)
        if not a or not isinstance(info, dict):
            skipped += 1
            continue
        tags = [str(t) for t in info.get("labels") or []]
        records.append(
            LabelRecord(address=a, category=_category_from_tags(tags), name=str(info.get("name") or "")[:300],
                        confidence=spec.default_confidence, chain_id=1, attributes={"tags": sorted(tags)})
        )
    return Parsed(records, skipped)


# ---- R2: official sanctions lists (every network) -------------------------------------------------


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _child_text(el: ET.Element, name: str) -> str:
    for c in el:
        if _local(c.tag) == name:
            return (c.text or "").strip()
    return ""


class _Merger:
    """One label per (network, chain, address). When a list names the same address twice (two
    entries, or USDT and TRX for one Tron address), the references are merged into the first label."""

    def __init__(self) -> None:
        self.by_key: dict[tuple[str, int, str], LabelRecord] = {}

    def add(self, rec: LabelRecord, merge: dict[str, str]) -> None:
        key = (rec.network, rec.chain_id, rec.address)
        old = self.by_key.get(key)
        if old is None:
            attrs = dict(rec.attributes)
            for k, v in merge.items():
                attrs[k] = [v]
            self.by_key[key] = LabelRecord(**{**rec.__dict__, "attributes": attrs})
            return
        for k, v in merge.items():
            if v not in old.attributes[k]:
                old.attributes[k] = sorted([*old.attributes[k], v])

    def records(self) -> list[LabelRecord]:
        return list(self.by_key.values())


def parse_ofac_sdn_xml(raw: bytes, spec: SourceSpec) -> Parsed:
    """Treasury's sdn.xml: every `Digital Currency Address - <TICKER>` id of every SDN entry, on every
    network, checksum-validated. Name, SDN uid, type and programmes are kept for the analyst."""
    root = ET.fromstring(raw)
    merged, skipped, problems = _Merger(), 0, []
    for entry in root.iter():
        if _local(entry.tag) != "sdnEntry":
            continue
        uid = _child_text(entry, "uid")
        name = " ".join(p for p in (_child_text(entry, "firstName"), _child_text(entry, "lastName")) if p)
        sdn_type = _child_text(entry, "sdnType")
        programs = sorted((p.text or "").strip() for p in entry.iter() if _local(p.tag) == "program")
        for idel in entry.iter():
            if _local(idel.tag) != "id":
                continue
            kind, number = _child_text(idel, "idType"), _child_text(idel, "idNumber")
            if not kind.startswith("Digital Currency Address") or not number:
                continue
            ticker = kind.rsplit("-", 1)[-1].strip().upper()
            checked, mismatch = af.from_ticker(ticker, number)
            if checked is None:
                skipped += 1
                problems.append(f"SDN {uid} {ticker}: {number[:100]!r} is not a valid address")
                continue
            attrs = {"sdn_type": sdn_type, "programs": programs, "validation": checked.validation}
            if mismatch:
                attrs["listed_ticker_mismatch"] = True
            merged.add(
                LabelRecord(address=checked.address, network=checked.network, category="sanctions",
                            name=name[:300], confidence=spec.default_confidence, source_ref=f"SDN {uid}",
                            attributes=attrs),
                {"tickers": ticker, "sdn_uids": uid},
            )
    return Parsed(merged.records(), skipped, problems)


def _free_text_records(spec: SourceSpec, merged: _Merger, el: ET.Element, ref: str, name: str, extra: dict) -> None:
    text = " ".join(el.itertext()) + " " + " ".join(v for e in el.iter() for v in e.attrib.values())
    for c in af.addresses_in_text(text):
        merged.add(
            LabelRecord(address=c.address, network=c.network, category="sanctions", name=name[:300],
                        confidence=spec.default_confidence, source_ref=ref,
                        attributes={**extra, "validation": c.validation, "extracted_from": "free text"}),
            {"list_refs": ref},
        )


def parse_uk_sanctions_xml(raw: bytes, spec: SourceSpec) -> Parsed:
    """UK Sanctions List (FCDO) XML. Wallet addresses only appear in the free-text fields of a
    designation, so they are extracted with a pattern and kept only if their checksum is valid."""
    merged = _Merger()
    for d in ET.fromstring(raw).iter():
        if _local(d.tag) != "Designation":
            continue
        uid = _child_text(d, "UniqueID")
        name = ""
        for n in d.iter():
            if _local(n.tag) == "Name" and _child_text(n, "NameType") == "Primary Name":
                name = " ".join(_child_text(n, f"Name{i}") for i in range(1, 7) if _child_text(n, f"Name{i}"))
                break
        extra = {"regime": _child_text(d, "RegimeName"), "sanctions_imposed": _child_text(d, "SanctionsImposed"),
                 "designated": _child_text(d, "DateDesignated")}
        _free_text_records(spec, merged, d, f"UK {uid}", name, extra)
    return Parsed(merged.records(), 0)


def parse_eu_sanctions_xml(raw: bytes, spec: SourceSpec) -> Parsed:
    """EU Financial Sanctions Files (consolidated list) XML. Wallet addresses sit in `remark` text."""
    merged = _Merger()
    for e in ET.fromstring(raw).iter():
        if _local(e.tag) != "sanctionEntity":
            continue
        ref = e.attrib.get("euReferenceNumber") or e.attrib.get("logicalId") or "?"
        name = next((a.attrib.get("wholeName", "") for a in e.iter() if _local(a.tag) == "nameAlias"), "")
        regulation = next((r.attrib.get("programme", "") for r in e.iter() if _local(r.tag) == "regulation"), "")
        _free_text_records(spec, merged, e, f"EU {ref}", name, {"programme": regulation})
    return Parsed(merged.records(), 0)


# ---- R2: DeFiHackLabs (attacker addresses from exploit reproductions) ------------------------------

_EXPLORER_CHAIN = {
    "etherscan.io": 1, "bscscan.com": 56, "polygonscan.com": 137, "arbiscan.io": 42161,
    "optimistic.etherscan.io": 10, "basescan.org": 8453, "snowtrace.io": 43114, "ftmscan.com": 250,
    "lineascan.build": 59144, "blastscan.io": 81457, "era.zksync.network": 324, "scrollscan.com": 534352,
    "gnosisscan.io": 100, "moonscan.io": 1284, "cronoscan.com": 25,
}
_EXPLORER = re.compile(r"https?://(?:www\.)?([a-z0-9.-]+)/(?:address|tx)/", re.I)
_HEX40 = r"0x[0-9a-fA-F]{40}(?![0-9a-fA-F])"
# "// Attacker : 0x..", "// Attack Contract : https://etherscan.io/address/0x..", "attacker EOA : 0x..",
# "address attacker = 0x..;". "Attack Tx" lines hold transaction hashes and are not matched.
_ATTACK_LINE = re.compile(
    r"^[ \t]*(?://|\*)?[ \t]*(?:address[ \t]+)?(attack(?:er)?[ \t_]*(?:eoa|address|contract|addr)?\d*)"
    r"[ \t]*[:=][^\n]*?(" + _HEX40 + ")",
    re.I | re.M,
)


def _chain_from_text(text: str) -> int:
    for host in _EXPLORER.findall(text):
        host = host.lower()
        for known, chain in _EXPLORER_CHAIN.items():
            if host == known or host.endswith("." + known):
                return chain
    return 0


def parse_defihacklabs_tar(raw: bytes, spec: SourceSpec) -> Parsed:
    """The repository tarball (codeload.github.com/.../tar.gz/refs/heads/main). Each exploit PoC under
    src/test/ names the attacker EOA and attack contract in its header; the chain comes from the block
    explorer links in the same header (0 = unknown, applies to every EVM chain)."""
    merged, skipped, problems = _Merger(), 0, []
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as tf:
        commit = (tf.pax_headers or {}).get("comment", "")[:12]
        for m in tf:
            if not (m.isfile() and "/src/test/" in m.name and m.name.endswith(".sol")) or m.size > 2_000_000:
                continue
            f = tf.extractfile(m)
            if f is None:
                continue
            head = f.read(8000).decode("utf-8", "replace")
            path = m.name.split("/src/test/", 1)[1]
            incident = path.rsplit("/", 1)[-1].removesuffix(".sol").removesuffix("_exp")
            month = path.split("/", 1)[0] if "/" in path else ""
            chain = _chain_from_text(head)
            for role_raw, address in _ATTACK_LINE.findall(head):
                role = "attack_contract" if "contract" in role_raw.lower() else "attacker"
                checked = af.validate(af.EVM, address)
                if checked is None:
                    skipped += 1
                    problems.append(f"{path}: {address} fails its EIP-55 checksum")
                    continue
                merged.add(
                    LabelRecord(address=checked.address, category="hack", name=f"{incident} exploit ({role})"[:300],
                                confidence=spec.default_confidence if role == "attacker" else 0.80,
                                chain_id=chain, source_ref=f"DeFiHackLabs@{commit} src/test/{path}",
                                attributes={"role": role, "incident_month": month}),
                    {"incidents": incident},
                )
    return Parsed(merged.records(), skipped, problems)


# ---- R2: curated law-enforcement evidence (FBI, DOJ, Europol ...) -----------------------------------

CURATED_COLUMNS = (
    "network", "chain_id", "address", "category", "name", "agency", "evidence_url", "published_on",
    "reviewed_by", "confidence", "notes",
)
CURATED_CATEGORIES = {"sanctions", "scam", "phishing", "hack", "mixer", "ransomware", "darknet"}
# Evidence must be an official publication. Suffix match on the host name.
OFFICIAL_HOST_SUFFIXES = (
    ".gov", ".gov.uk", ".police.uk", ".europa.eu", ".gc.ca", ".gov.au", ".govt.nz", ".gov.sg",
    "interpol.int", "fatf-gafi.org",
)


def _official(url: str) -> bool:
    u = urlparse(url)
    host = (u.hostname or "").lower()
    return u.scheme == "https" and any(host == s.lstrip(".") or host.endswith(s) for s in OFFICIAL_HOST_SUFFIXES)


def parse_curated_evidence(raw: bytes, spec: SourceSpec) -> Parsed:
    """CSV kept by the bank's own analysts: one row per address published by a law-enforcement agency
    (FBI PSA/flash alert, DOJ seizure complaint, Europol release ...). Each row must cite an official
    https URL, its publication date and the analyst who reviewed it; rows that do not are skipped and
    listed in the import log. Template: docs/curated-labels-template.csv."""
    records, skipped, problems = [], 0, []
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
    missing = {"network", "address", "category", "name", "agency", "evidence_url", "published_on", "reviewed_by"} - set(
        reader.fieldnames or []
    )
    if missing:
        return Parsed([], 0, [f"missing columns: {', '.join(sorted(missing))}"])
    for line, row in enumerate(reader, start=2):
        row = {k: (v or "").strip() for k, v in row.items() if k}

        def bad(why: str, line: int = line) -> None:
            nonlocal skipped
            skipped += 1
            problems.append(f"line {line}: {why}")

        network = row["network"].lower()
        if network not in af.NETWORKS:
            bad(f"unknown network {network!r}")
            continue
        checked = af.validate(network, row["address"])
        if checked is None:
            bad(f"{row['address'][:100]!r} is not a valid {network} address")
            continue
        if row["category"] not in CURATED_CATEGORIES:
            bad(f"category must be one of {sorted(CURATED_CATEGORIES)}")
            continue
        if not _official(row["evidence_url"]):
            bad("evidence_url must be an https link on an official government or agency site")
            continue
        try:
            published = date.fromisoformat(row["published_on"])
        except ValueError:
            bad("published_on must be YYYY-MM-DD")
            continue
        if not row["reviewed_by"] or not row["name"] or not row["agency"]:
            bad("name, agency and reviewed_by are required")
            continue
        try:
            chain_id = int(row.get("chain_id") or 0) if network == af.EVM else 0
            confidence = min(float(row.get("confidence") or spec.default_confidence), 0.99)
        except ValueError:
            bad("chain_id and confidence must be numbers")
            continue
        records.append(
            LabelRecord(
                address=checked.address, network=network, chain_id=chain_id, category=row["category"],
                name=row["name"][:300], confidence=confidence, source_ref=row["evidence_url"],
                attributes={"agency": row["agency"], "published_on": published.isoformat(),
                            "reviewed_by": row["reviewed_by"], "notes": row.get("notes", ""),
                            "validation": checked.validation},
            )
        )
    return Parsed(records, skipped, problems)


# ---- registry -------------------------------------------------------------------------------------

SOURCES: dict[str, SourceSpec] = {
    s.key: s
    for s in [
        SourceSpec(
            key="ofac_sdn",
            name="OFAC SDN list (Ethereum addresses)",
            url="https://raw.githubusercontent.com/ultrasoundmoney/ofac-ethereum-addresses/main/data.csv",
            licence="US government public data (OFAC). Extract maintained by ultrasoundmoney on GitHub.",
            commercial_use="allowed",
            default_confidence=0.99,
            refresh="daily",
            parser=parse_ofac,
            notes="Legal floor for sanctions screening. Refresh daily; cross-check hits with Chainalysis free API.",
        ),
        SourceSpec(
            key="mew_darklist",
            name="MyEtherWallet darklist",
            url="https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/src/addresses/addresses-darklist.json",
            licence="MIT (MyEtherWallet/ethereum-lists)",
            commercial_use="allowed",
            default_confidence=0.85,
            refresh="weekly",
            parser=parse_mew_darklist,
            notes="Community-reported scam and phishing addresses; some noise, mostly older entries.",
        ),
        SourceSpec(
            key="etherscan_labels_community",
            name="etherscan-labels (community scrape of Etherscan name tags)",
            url="https://github.com/brianleect/etherscan-labels",
            licence="Repository is MIT, but the data is scraped from Etherscan, whose terms restrict reuse.",
            commercial_use="unverified",
            default_confidence=0.70,
            refresh="manual",
            parser=parse_etherscan_labels,
            notes="Development and demo only. Replace with Etherscan Metadata API or a vendor feed before a pilot.",
        ),
        SourceSpec(
            key="ofac_sdn_official",
            name="OFAC SDN list, official XML (all networks)",
            url="https://www.treasury.gov/ofac/downloads/sdn.xml",
            licence="US government work, public domain (17 U.S.C. 105). Published by US Treasury OFAC.",
            commercial_use="allowed",
            default_confidence=0.99,
            refresh="daily",
            parser=parse_ofac_sdn_xml,
            notes="Primary sanctions source. Every digital currency address on every network, checksum-checked. "
            "Supersedes the ultrasoundmoney Ethereum extract (ofac_sdn), which stays as a cross-check.",
        ),
        SourceSpec(
            key="uk_sanctions_list",
            name="UK Sanctions List (FCDO), wallet addresses from free text",
            url="https://sanctionslist.fcdo.gov.uk/docs/UK-Sanctions-List.xml",
            licence="Open Government Licence v3.0 (UK Crown copyright).",
            commercial_use="allowed",
            default_confidence=0.95,
            refresh="daily",
            parser=parse_uk_sanctions_xml,
            notes="Addresses are extracted from designation text and kept only with a valid checksum; "
            "confidence below OFAC because the list has no structured address field.",
        ),
        SourceSpec(
            key="eu_sanctions_list",
            name="EU consolidated financial sanctions list, wallet addresses from remarks",
            url="https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw",
            licence="EU Commission reuse policy (Decision 2011/833/EU): reuse allowed with acknowledgement.",
            commercial_use="allowed",
            default_confidence=0.95,
            refresh="daily",
            parser=parse_eu_sanctions_xml,
            notes="Addresses are extracted from remark text and kept only with a valid checksum.",
        ),
        SourceSpec(
            key="defihacklabs",
            name="DeFiHackLabs exploit reproductions (attacker EOAs and attack contracts)",
            url="https://codeload.github.com/SunWeb3Sec/DeFiHackLabs/tar.gz/refs/heads/main",
            licence="Apache-2.0 (SunWeb3Sec/DeFiHackLabs).",
            commercial_use="allowed",
            default_confidence=0.90,
            refresh="weekly",
            parser=parse_defihacklabs_tar,
            notes="Community research, not an official finding. Attack contracts get 0.80. Chain comes from "
            "the explorer links in each PoC header; 0 when none.",
        ),
        SourceSpec(
            key="curated_law_enforcement",
            name="Curated law-enforcement publications (FBI, DOJ, Europol ...)",
            url=None,
            licence="Official government publications; curation by the deploying institution's analysts.",
            commercial_use="allowed",
            default_confidence=0.95,
            refresh="manual",
            parser=parse_curated_evidence,
            notes="Import with --file from the analysts' CSV (docs/curated-labels-template.csv). Every row "
            "cites an official https URL, its publication date and the reviewer.",
        ),
    ]
}
