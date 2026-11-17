"""Live checks of each data source: reachable? what does it actually contain?

Each probe downloads the machine-readable endpoint once and records facts, not opinions: entry
counts, wallet addresses found per chain, publication date, licence reported by GitHub. Parsing is
split from fetching so the parsers are tested offline. Nothing downloaded here is imported as
labels; that is R2's job.
"""

import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from dataclasses import dataclass, field
from datetime import UTC, datetime
from urllib.parse import urljoin

import httpx

from app.core.config import Settings
from app.modules.m3_data.sources.matrix import Source

MAX_BYTES = 80 * 1024 * 1024
USER_AGENT = "chainintel-source-probe"

ADDRESS_PATTERNS = {
    "ETH/EVM": re.compile(r"\b0x[a-fA-F0-9]{40}\b"),
    "BTC": re.compile(r"\b(?:bc1[ac-hj-np-z02-9]{11,71}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})\b"),
    "TRX": re.compile(r"\bT[1-9A-HJ-NP-Za-km-z]{33}\b"),
}


@dataclass
class ProbeResult:
    ok: bool
    outcome: str  # reachable | unreachable | needs_key | manual | parse_error
    http_status: int | None = None
    final_url: str | None = None
    bytes: int | None = None
    findings: dict = field(default_factory=dict)
    error: str | None = None


# ---- parsers (pure) ---------------------------------------------------------------------------------


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def address_candidates(text: str) -> dict[str, int]:
    """Unique strings shaped like wallet addresses, per chain family. Shape only: a hint, not proof."""
    return {name: len(set(p.findall(text))) for name, p in ADDRESS_PATTERNS.items()}


def parse_ofac_sdn(raw: bytes) -> dict:
    root = ET.fromstring(raw)
    entries = 0
    tickers: Counter = Counter()
    addresses: set[str] = set()
    published = None
    for el in root.iter():
        name = _local(el.tag)
        if name == "sdnEntry":
            entries += 1
        elif name == "Publish_Date":
            published = (el.text or "").strip()
        elif name == "id":
            kind = number = None
            for child in el:
                if _local(child.tag) == "idType":
                    kind = (child.text or "").strip()
                elif _local(child.tag) == "idNumber":
                    number = (child.text or "").strip()
            if kind and kind.startswith("Digital Currency Address") and number:
                tickers[kind.rsplit("-", 1)[-1].strip()] += 1
                addresses.add(number)
    return {
        "entries": entries,
        "published": published,
        "digital_currency_addresses": len(addresses),
        "addresses_by_ticker": dict(tickers.most_common()),
    }


def parse_un_consolidated(raw: bytes) -> dict:
    root = ET.fromstring(raw)
    counts = Counter(_local(el.tag) for el in root.iter() if _local(el.tag) in ("INDIVIDUAL", "ENTITY"))
    return {
        "individuals": counts["INDIVIDUAL"],
        "entities": counts["ENTITY"],
        "generated": root.attrib.get("dateGenerated"),
        "address_candidates": address_candidates(raw.decode("utf-8", "replace")),
    }


def parse_eu_consolidated(raw: bytes) -> dict:
    root = ET.fromstring(raw)
    entities = sum(1 for el in root.iter() if _local(el.tag) == "sanctionEntity")
    return {
        "entities": entities,
        "generated": root.attrib.get("generationDate"),
        "address_candidates": address_candidates(raw.decode("utf-8", "replace")),
    }


def find_file_links(html: str, base: str) -> list[str]:
    links = re.findall(r'href="([^"]+\.(?:csv|xml|ods|json)(?:\?[^"]*)?)"', html, flags=re.I)
    return list(dict.fromkeys(urljoin(base, link) for link in links))


def parse_delimited(raw: bytes) -> dict:
    text = raw.decode("utf-8-sig", "replace")
    return {"rows": max(0, text.count("\n") - 1), "address_candidates": address_candidates(text)}


def parse_address_json(raw: bytes) -> dict:
    data = json.loads(raw)
    rows = data
    if isinstance(data, dict):
        rows = next((v for v in data.values() if isinstance(v, list)), [])
    rows = [r for r in rows if isinstance(r, dict)]
    chain_key = next((k for k in ("blockchain", "chain", "network", "coin") if rows and k in rows[0]), None)
    family_key = next((k for k in ("family", "category", "type") if rows and k in rows[0]), None)
    return {
        "records": len(rows),
        "fields": sorted(rows[0].keys()) if rows else [],
        "by_chain": dict(Counter(str(r.get(chain_key)) for r in rows).most_common(10)) if chain_key else {},
        "top_families": dict(Counter(str(r.get(family_key)) for r in rows).most_common(10)) if family_key else {},
    }


def parse_github_repo(raw: bytes) -> dict:
    d = json.loads(raw)
    return {
        "licence": (d.get("license") or {}).get("spdx_id") or "none stated",
        "last_push": d.get("pushed_at"),
        "stars": d.get("stargazers_count"),
        "archived": d.get("archived"),
        "size_kb": d.get("size"),
        "description": (d.get("description") or "")[:200],
    }


# ---- fetching --------------------------------------------------------------------------------------

RPC_BODIES = {
    "eth_public_rpc": {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []},
    "solana_rpc": {"jsonrpc": "2.0", "id": 1, "method": "getSlot"},
    "trongrid": {},
}
PARSERS = {"ofac_xml": parse_ofac_sdn, "un_xml": parse_un_consolidated, "eu_xml": parse_eu_consolidated,
           "json_addresses": parse_address_json, "github_repo": parse_github_repo}


def _get(client: httpx.Client, url: str, json_body: dict | None = None) -> httpx.Response:
    if json_body is not None:
        return client.post(url, json=json_body)
    with client.stream("GET", url) as r:
        chunks, size = [], 0
        for chunk in r.iter_bytes():
            size += len(chunk)
            if size > MAX_BYTES:
                raise ValueError(f"response larger than {MAX_BYTES // 1024 // 1024} MB")
            chunks.append(chunk)
        # A plain response holding the capped body (the streamed one is closed on exit). The body is
        # already decompressed, so drop the encoding headers or httpx would try to decode it twice.
        headers = {k: v for k, v in r.headers.items() if k.lower() not in ("content-encoding", "content-length", "transfer-encoding")}
        return httpx.Response(r.status_code, headers=headers, content=b"".join(chunks), request=r.request)


def run_probe(source: Source, settings: Settings, client: httpx.Client | None = None) -> ProbeResult:
    if source.probe == "manual":
        return ProbeResult(ok=True, outcome="manual", findings={"note": "no machine-readable feed; curated by analysts"})
    if source.probe == "needs_key":
        configured = {"etherscan": settings.etherscan_api_key, "alchemy": settings.alchemy_api_key}.get(source.key)
        return ProbeResult(ok=configured is not None, outcome="needs_key",
                           findings={"key_configured": configured is not None, "note": "requires an account or API key"})

    own = client is None
    client = client or httpx.Client(timeout=60, follow_redirects=True, headers={"User-Agent": USER_AGENT})
    url = source.probe_url or source.url
    try:
        r = _get(client, url, RPC_BODIES.get(source.key))
        result = ProbeResult(ok=r.status_code < 400, outcome="reachable" if r.status_code < 400 else "unreachable",
                             http_status=r.status_code, final_url=str(r.url), bytes=len(r.content))
        if not result.ok:
            return result
        result.findings["content_type"] = r.headers.get("content-type", "").split(";")[0]
        if source.probe in PARSERS:
            result.findings |= PARSERS[source.probe](r.content)
        elif source.probe == "uk_page":
            links = find_file_links(r.text, str(r.url))
            result.findings["file_links"] = links[:10]
            pick = next((link for link in links if link.lower().split("?")[0].endswith(".csv")), None) or \
                next((link for link in links if link.lower().split("?")[0].endswith(".xml")), None)
            if pick:
                f = _get(client, pick)
                result.findings["file"] = pick
                result.findings["file_status"] = f.status_code
                if f.status_code < 400:
                    result.findings |= parse_delimited(f.content) if pick.lower().split("?")[0].endswith(".csv") else \
                        {"address_candidates": address_candidates(f.content.decode("utf-8", "replace"))}
        elif source.key in RPC_BODIES:
            body = r.json()
            result.findings["sample"] = str(body.get("result", body.get("block_header", {}).get("raw_data", {}).get("number")))[:80]
        return result
    except (httpx.HTTPError, ValueError) as exc:
        return ProbeResult(ok=False, outcome="unreachable", final_url=url, error=f"{type(exc).__name__}: {str(exc)[:200]}")
    except (ET.ParseError, json.JSONDecodeError, KeyError, TypeError, AttributeError) as exc:
        return ProbeResult(ok=False, outcome="parse_error", final_url=url, error=f"{type(exc).__name__}: {str(exc)[:200]}")
    finally:
        if own:
            client.close()


def now() -> datetime:
    return datetime.now(UTC)
