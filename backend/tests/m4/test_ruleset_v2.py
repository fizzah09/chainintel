"""M4.2: rule set 2 fixes (offline) and the M3 -> engine pipeline end to end (PostgreSQL)."""

import json
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

import pytest

from app.core.config import Settings
from app.modules.m3_data.labels.importer import LabelImporter
from app.modules.m3_data.labels.sources import SOURCES
from app.modules.m3_data.models import AssetPrice
from app.modules.m3_data.prices.service import PriceService
from app.modules.m3_data.providers.base import TransferKind
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.sync import TransferSync
from app.modules.m4_risk.engine import RULESET_V1, RULESET_V2, assess_from_data
from app.modules.m4_risk.inputs import load_inputs, pick_neighbours
from tests.m3.test_sync import Scripted, tx

W = "0x" + "1" * 40
CEX = "0x" + "e" * 40
SDN = "0x" + "5" * 40
PHISH = "0x" + "f" * 40
FRIEND = "0x" + "2" * 40
USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7"
ODD = "0x" + "9" * 40


def etx(cp, direction, usd, time, value=1.0, sym="ETH"):
    return {"hash": f"0x{abs(hash((cp, direction, time))):x}", "time": time, "cp": cp, "dir": direction, "sym": sym,
            "value": value, "usd": usd, "from": cp if direction == "in" else W, "to": W if direction == "in" else cp, "contract": False}


def run(rules, txs, edges, labels):
    return assess_from_data(address=W, txs=txs, edges=edges, as_of="2026-02-01T00:00:00.000Z", mode="live",
                            labels=lambda a: labels.get(a.lower()), rules=rules, with_forecast=False)


def test_v2_does_not_trace_exposure_through_an_exchange():
    txs = [etx(CEX, "in", 20000, "2026-01-10T00:00:00.000Z")]
    edges = [{"from": CEX, "to": W, "usd": 20000, "hash": "0xa", "time": "2026-01-10T00:00:00.000Z"},
             {"from": SDN, "to": CEX, "usd": 50000, "hash": "0xb", "time": "2026-01-09T00:00:00.000Z"}]
    labels = {CEX: {"cat": "exchange", "name": "Big Exchange", "source": "t", "confidence": 0.9},
              SDN: {"cat": "sanctions", "name": "SDN", "source": "OFAC", "confidence": 0.99}}
    assert any(e["cat"] == "sanctions" for e in run(RULESET_V1, txs, edges, labels)["exposure"])  # the old flaw
    assert run(RULESET_V2, txs, edges, labels)["exposure"] == []


def test_v2_counts_phishing_and_hack_labels():
    txs = [etx(PHISH, "in", 12000, "2026-01-10T00:00:00.000Z")]
    edges = [{"from": PHISH, "to": W, "usd": 12000, "hash": "0xc", "time": "2026-01-10T00:00:00.000Z"}]
    labels = {PHISH: {"cat": "phishing", "name": "Fake wallet site", "source": "MEW", "confidence": 0.85}}
    assert run(RULESET_V1, txs, edges, labels)["factors"] == []
    f = run(RULESET_V2, txs, edges, labels)["factors"]
    # Scam/fraud exposure at full points, plus the direct risky counterparty factor.
    assert [x["id"] for x in f] == ["scam", "counterparties"] and f[0]["points"] == 15


def test_v2_never_guesses_a_price():
    txs = [etx(FRIEND, "in", None, "2026-01-10T00:00:00.000Z", value=100.0)]  # 100 ETH, unpriced
    edges = [{"from": FRIEND, "to": W, "usd": 0, "hash": "0xd", "time": "2026-01-10T00:00:00.000Z"}]
    assert run(RULESET_V1, txs, edges, {})["facts"]["inflowUsd"] == 300000  # prototype: fixed $3,000
    assert run(RULESET_V2, txs, edges, {})["facts"]["inflowUsd"] == 0


def test_neighbour_choice_skips_risky_and_service_addresses():
    txs = [etx(CEX, "in", 9e6, "t"), etx(SDN, "in", 8e6, "t"), etx(FRIEND, "in", 100, "t"), etx(ODD, "out", None, "t")]
    labels = {CEX: {"cat": "exchange"}, SDN: {"cat": "sanctions"}}
    assert pick_neighbours(txs, labels, RULESET_V2, 5) == [FRIEND, ODD]


# ---- end to end on stored data --------------------------------------------------------------------


@pytest.mark.integration
def test_assessment_from_m3_data_finds_2hop_sanctions_via_a_synced_neighbour(db):
    t0 = datetime(2026, 11, 17, 10, 0, tzinfo=UTC)
    chain = [
        tx(80, "0x80", frm=FRIEND, to=W, value=2 * 10**18),  # 2 ETH from FRIEND
        tx(81, "0x81", frm=CEX, to=W, value=5 * 10**18),  # 5 ETH from an exchange
        tx(82, "0x82", kind=TransferKind.ERC20, frm=W, to=FRIEND, token=USDT, decimals=6, sub="log:1", value=3_000 * 10**6),
        tx(83, "0x83", kind=TransferKind.ERC20, frm=FRIEND, to=W, token=ODD, decimals=18, sub="log:2", value=10**18),
        tx(70, "0x70", frm=SDN, to=FRIEND, value=10**18),  # sanctioned address paid FRIEND earlier
        tx(71, "0x71", frm=SDN, to=CEX, value=10**18),  # ...and the exchange (must not count)
    ]
    p = Scripted(head=100, chain=chain, decimals={USDT: 6, ODD: 18})
    settings = Settings(_env_file=None, default_confirmations=12, risk_neighbours=3)
    sync = TransferSync(db, ProviderRouter([p]), settings, clock=lambda: t0)
    sync.sync(W, 1)
    sync.sync(FRIEND, 1)

    imp = LabelImporter(db, clock=lambda: t0 - timedelta(hours=1))  # labels known before the assessment
    imp.run(SOURCES["ofac_sdn"], f"address,name\n{SDN},TEST SDN\n".encode(), "file:test")
    imp.run(SOURCES["etherscan_labels_community"], json.dumps({CEX: {"name": "Big Exchange", "labels": ["binance"]}}).encode(), "file:test")

    # Prices for the day: ETH and USDT from Chainlink rows already in the store; ODD has none.
    day = date(2026, 11, 17)
    for key, usd in (("ETH", "1779"), ("USDT", "0.999")):
        db.add(AssetPrice(price_key=key, day=day, source="chainlink", usd=Decimal(usd), observed_at=t0,
                          source_ref=f"chainlink:test:{key}", fetched_at=t0))
    db.commit()
    prices = PriceService(db, ProviderRouter([]), settings)  # offline: store only

    inp = load_inputs(db, W, 1, rules=RULESET_V2, settings=settings, prices=prices, as_of=t0 + timedelta(minutes=1))
    rep = assess_from_data(address=W, txs=inp.txs, edges=inp.edges, as_of=inp.as_of_iso, mode="live",
                           labels=inp.label_lookup(), rules=RULESET_V2, data_quality=inp.data_quality, with_forecast=False)

    sanctions = [e for e in rep["exposure"] if e["cat"] == "sanctions"]
    assert [(e["hops"], e["path"]) for e in sanctions] == [(2, [W, FRIEND, SDN])]  # via FRIEND, not via the exchange
    assert inp.manifest["neighbours"] == [FRIEND]  # exchange never expanded
    assert inp.data_quality["unpriced"] == 1 and inp.data_quality["unpricedAssets"] == [ODD]
    usdt = next(t for t in inp.txs if t["token"] == USDT)
    assert usdt["usd"] == pytest.approx(2997.0)
    assert rep["facts"]["inflowUsd"] == pytest.approx(7 * 1779)  # 2 + 5 ETH at the stored Chainlink price
    assert any(p["name"] == "Price coverage" and p["value"] == 75 for p in rep["confidence"]["parts"])
    assert inp.manifest["priceSources"] == ["chainlink"] and len(inp.manifest["priceRowIds"]) == 2
    assert len(inp.manifest["labelImportIds"]) == 2 and inp.manifest["transferFetchIds"]

    # Knowledge time before the data was synced: nothing to assess.
    empty = load_inputs(db, W, 1, rules=RULESET_V2, settings=settings, prices=prices, as_of=t0 - timedelta(days=1))
    assert empty.txs == [] and empty.edges == []


def test_v3_scores_a_sanctioned_wallet_with_no_counterparties_as_critical():
    from app.modules.m4_risk.engine import RULESETS

    labels = {W: {"cat": "sanctions", "name": "TEST SDN", "source": "OFAC SDN", "confidence": 0.99}}
    v2 = run(RULESET_V2, [], [], labels)
    v3 = run(RULESETS[3], [], [], labels)
    assert (v2["score"], v2["tier"]) == (0, "low")  # the gap rule set 3 closes
    assert (v3["score"], v3["tier"]) == (75, "crit") and "sanctions list is always Critical" in v3["floor"]
    assert v3["factors"][0]["calc"] == "35 max × 1 (the wallet itself) = 35"
