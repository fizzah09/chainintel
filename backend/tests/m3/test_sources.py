"""R1 Data Source Matrix: matrix integrity, probe parsers (offline) and storage/API (PostgreSQL)."""

import json

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.main import create_app
from app.modules.m3_data.sources.matrix import BY_KEY, SOURCES
from app.modules.m3_data.sources.probes import (
    address_candidates, find_file_links, parse_address_json, parse_eu_consolidated, parse_github_repo, parse_ofac_sdn,
    parse_un_consolidated, run_probe,
)
from app.modules.m3_data.sources.service import matrix, probe_and_store

ETH = "0x" + "ab" * 20
BTC = "1BoatSLRHtKNngkdXEeobR76b53LETtpyT"
TRX = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf"


def test_matrix_is_complete_and_consistent():
    keys = [s.key for s in SOURCES]
    assert len(keys) == len(set(keys))
    tier1 = {"ofac_sdn_official", "un_consolidated", "eu_consolidated", "uk_sanctions_list", "law_enforcement_curated",
             "defihacklabs", "ransomwhere", "dune", "etherscan", "fatf_red_flags"}
    assert tier1 <= set(keys)  # the research checklist's must-haves
    for s in SOURCES:
        assert s.tier in (1, 2, 3) and 1 <= s.priority <= 10
        if s.status == "integrated":
            assert s.integrated_as, f"{s.key}: integrated sources must say where"
        if s.probe in ("ofac_xml", "un_xml", "eu_xml", "json_addresses", "github_repo"):
            assert s.probe_url, f"{s.key}: parser probes need a machine-readable URL"
    assert {s.bucket for s in SOURCES} == {"ground_truth", "blockchain_data", "behaviour_rules", "entity_labels"}


def test_address_candidates_by_chain():
    found = address_candidates(f"wallets {ETH}, {BTC} and {TRX}; not 0x123")
    assert found == {"ETH/EVM": 1, "BTC": 1, "TRX": 1}


def test_parse_ofac_sdn_counts_addresses_by_ticker():
    xml = f"""<sdnList xmlns="http://tempuri.org/sdnList.xsd">
      <publshInformation><Publish_Date>11/14/2026</Publish_Date></publshInformation>
      <sdnEntry><uid>1</uid><idList>
        <id><idType>Digital Currency Address - ETH</idType><idNumber>{ETH}</idNumber></id>
        <id><idType>Digital Currency Address - XBT</idType><idNumber>{BTC}</idNumber></id>
        <id><idType>Passport</idType><idNumber>X1</idNumber></id></idList></sdnEntry>
      <sdnEntry><uid>2</uid><idList><id><idType>Digital Currency Address - TRX</idType><idNumber>{TRX}</idNumber></id>
        <id><idType>Digital Currency Address - USDT</idType><idNumber>{TRX}</idNumber></id></idList></sdnEntry>
    </sdnList>""".encode()
    f = parse_ofac_sdn(xml)
    assert f["entries"] == 2 and f["published"] == "11/14/2026"
    assert f["digital_currency_addresses"] == 3  # TRX/USDT share one address
    assert f["addresses_by_ticker"] == {"ETH": 1, "XBT": 1, "TRX": 1, "USDT": 1}


def test_parse_un_and_eu():
    un = f'<CONSOLIDATED_LIST dateGenerated="2026-11-17"><INDIVIDUALS><INDIVIDUAL/><INDIVIDUAL/></INDIVIDUALS><ENTITIES><ENTITY><NOTE>{ETH}</NOTE></ENTITY></ENTITIES></CONSOLIDATED_LIST>'
    f = parse_un_consolidated(un.encode())
    assert (f["individuals"], f["entities"], f["generated"], f["address_candidates"]["ETH/EVM"]) == (2, 1, "2026-11-17", 1)
    eu = '<export xmlns="http://eu.europa.ec/fpi/fsd/export" generationDate="2026-11-16"><sanctionEntity/><sanctionEntity/></export>'
    assert parse_eu_consolidated(eu.encode())["entities"] == 2


def test_parse_json_addresses_and_github():
    raw = json.dumps({"result": [{"address": BTC, "blockchain": "bitcoin", "family": "Conti"},
                                 {"address": ETH, "blockchain": "ethereum", "family": "Conti"}]}).encode()
    f = parse_address_json(raw)
    assert f["records"] == 2 and f["by_chain"] == {"bitcoin": 1, "ethereum": 1} and f["top_families"] == {"Conti": 2}
    g = parse_github_repo(json.dumps({"license": {"spdx_id": "MIT"}, "pushed_at": "2026-11-01T00:00:00Z", "stargazers_count": 9}).encode())
    assert g["licence"] == "MIT" and g["last_push"].startswith("2026-11-01")
    assert parse_github_repo(b'{"license": null}')["licence"] == "none stated"


def test_find_file_links_resolves_relative_urls():
    html = '<a href="/media/x/UK-Sanctions-List.csv">CSV</a> <a href="https://a.test/list.xml?v=2">XML</a> <a href="/page">x</a>'
    assert find_file_links(html, "https://www.gov.uk/pub") == ["https://www.gov.uk/media/x/UK-Sanctions-List.csv", "https://a.test/list.xml?v=2"]


def test_run_probe_handles_keys_manual_errors_and_parsing():
    s = Settings(_env_file=None)
    assert run_probe(BY_KEY["etherscan"], s).outcome == "needs_key"
    assert run_probe(BY_KEY["law_enforcement_curated"], s).outcome == "manual"

    def handler(req):
        if "ransomwhe" in str(req.url):
            return httpx.Response(200, json={"result": [{"address": BTC, "blockchain": "bitcoin"}]})
        return httpx.Response(503)

    client = httpx.Client(transport=httpx.MockTransport(handler))
    ok = run_probe(BY_KEY["ransomwhere"], s, client)
    assert ok.ok and ok.findings["records"] == 1 and ok.findings["by_chain"] == {"bitcoin": 1}
    down = run_probe(BY_KEY["defihacklabs"], s, client)
    assert (down.ok, down.outcome, down.http_status) == (False, "unreachable", 503)
    bad = run_probe(BY_KEY["un_consolidated"], s, httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, text="<not xml"))))
    assert bad.outcome == "parse_error"


@pytest.mark.integration
def test_probes_are_stored_append_only_and_shown_in_the_matrix(db):
    client = httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, json={"license": {"spdx_id": "MIT"}})))
    probe_and_store(db, BY_KEY["defihacklabs"], Settings(_env_file=None), "tester", client)
    row = next(r for r in matrix(db) if r.source["key"] == "defihacklabs")
    assert row.last_probe.ok and row.last_probe.findings["licence"] == "MIT" and row.last_probe.checked_by == "tester"
    assert next(r for r in matrix(db) if r.source["key"] == "dune").last_probe is None
    with pytest.raises(DBAPIError, match="append-only"):
        db.execute(text("DELETE FROM source_probes"))
    db.rollback()

    app = create_app()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None)
    c = TestClient(app)
    ground = c.get("/api/v1/data-sources", params={"bucket": "ground_truth"}).json()
    assert ground and all(r["source"]["bucket"] == "ground_truth" for r in ground)
    assert c.post("/api/v1/data-sources/nope/probe").status_code == 404
    assert c.post("/api/v1/data-sources/etherscan/probe", headers={"X-Dev-Roles": "analyst"}).status_code == 403
    assert c.post("/api/v1/data-sources/etherscan/probe").json()["outcome"] == "needs_key"


def test_compressed_responses_are_read_once():
    import gzip

    body = gzip.compress(json.dumps({"license": {"spdx_id": "MIT"}}).encode())
    client = httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, content=body, headers={"content-encoding": "gzip"})))
    r = run_probe(BY_KEY["defihacklabs"], Settings(_env_file=None), client)
    assert r.ok and r.findings["licence"] == "MIT"
