"""
Seed the ChainIntel database with realistic investigation data.

Uses real known Ethereum addresses (OFAC-sanctioned, exchange wallets,
high-profile entities) so the graph API will pull real on-chain transactions.

Run from the backend directory:
    .venv\\Scripts\\python scripts/seed_db.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta, UTC
from app.core.db import _session_factory, get_engine
from app.core.db import Base
from app.modules.m6_cases.models import Case, CaseSubject, CaseEvidence, CaseNote, CaseTask, CaseMessage
from app.modules.m7_monitoring.models import Watchlist, WatchlistEntry, Alert

# Import all models so their tables are registered
from app.modules.m3_data.models import *  # noqa
from app.modules.m4_risk.models import *  # noqa
from app.modules.m5_flow.models import *  # noqa

def now(offset_days=0):
    return datetime.now(UTC) + timedelta(days=offset_days)

TENANT = "dev-tenant"
ADMIN  = "Sara Ali"
INV1   = "Sara Ali"
INV2   = "James Park"
COMP1  = "Maria Chen"

# ── Real Ethereum addresses ───────────────────────────────────────────────────
# OFAC-sanctioned / high-profile addresses (publicly known, used for research)
ADDR = {
    "lazarus_1":   "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",  # Lazarus Group (OFAC)
    "lazarus_2":   "0xa0e1c89Ef1a489c9C7dE96311eD5Ce5D32c20E4b",  # Lazarus Group (OFAC)
    "tornado_router": "0x722122dF12D4e14e13Ac3b6895a86e84145b6967",  # Tornado Cash router
    "tornado_proxy":  "0xDD4c48C0B24039969fC16D1cdF626eaB821d3384",  # Tornado Cash proxy
    "binance_14":  "0x28c6c06298d514db089934071355e5743bf21d60",  # Binance hot wallet 14
    "binance_7":   "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",  # Binance cold wallet 7
    "ftx_hot":     "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2",  # FTX exchange
    "ronin_hack":  "0x098B716B8Aaf21512996dC57EB0615e2383E2f96",  # Ronin bridge hack
    "bitfinex_hack":"0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE", # Bitfinex hack wallet
    "vitalik":     "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",  # Vitalik (reference)
    "uniswap_v3":  "0x1F98431c8aD98523631AE4a59f267346ea31F984",  # Uniswap V3 Factory
    "ofac_iran_1": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",  # OFAC-linked
}

def main():
    engine = get_engine()
    Base.metadata.create_all(engine)  # ensure tables exist

    factory = _session_factory()
    with factory() as db:
        # Wipe existing seed data first (idempotent re-runs)
        db.query(Alert).filter(Alert.tenant_id == TENANT).delete()
        db.query(WatchlistEntry).filter(
            WatchlistEntry.watchlist_id.in_(
                db.query(Watchlist.id).filter(Watchlist.tenant_id == TENANT)
            )
        ).delete(synchronize_session=False)
        db.query(Watchlist).filter(Watchlist.tenant_id == TENANT).delete()
        db.query(Case).filter(Case.tenant_id == TENANT).delete()
        db.flush()

        # ── CASES ────────────────────────────────────────────────────────────

        # Case 1: Lazarus Group ransomware laundering
        c1 = Case(
            case_ref="CASE-2026-00001",
            tenant_id=TENANT,
            title="Lazarus Group — Ronin Bridge laundering",
            description=(
                "Suspected Lazarus Group (North Korea) wallet identified moving funds from "
                "the Axie Infinity Ronin Bridge hack ($625M). Chain of transfers routed "
                "through Tornado Cash before attempting off-ramp to Binance."
            ),
            status="Under Review",
            priority="Critical",
            case_type="Sanctions",
            source="OFAC SDN Alert",
            created_at=now(-21),
            updated_at=now(-2),
            created_by=ADMIN,
            assigned_to=INV1,
            due_date=now(7),
            tags=["sanctions", "ofac", "north-korea", "bridge-hack"],
        )
        db.add(c1)
        db.flush()

        c1_subs = [
            CaseSubject(case_id=c1.id, kind="wallet", ref=ADDR["lazarus_1"],    role="Primary",  chain_id=1, risk_score=98, label="Lazarus Group (OFAC SDN)", added_at=now(-21), added_by=INV1),
            CaseSubject(case_id=c1.id, kind="wallet", ref=ADDR["lazarus_2"],    role="Secondary",chain_id=1, risk_score=95, label="Lazarus Affiliate",        added_at=now(-20), added_by=INV1),
            CaseSubject(case_id=c1.id, kind="wallet", ref=ADDR["tornado_router"],role="Linked",  chain_id=1, risk_score=87, label="Tornado Cash Router",      added_at=now(-19), added_by=INV1),
            CaseSubject(case_id=c1.id, kind="wallet", ref=ADDR["binance_14"],   role="Off-ramp", chain_id=1, risk_score=20, label="Binance Hot Wallet 14",    added_at=now(-18), added_by=INV1),
        ]
        db.add_all(c1_subs)

        db.add_all([
            CaseNote(case_id=c1.id, text="OFAC match confirmed on 2026-10-29. Freezing report submitted to compliance.", author=INV1, created_at=now(-21), updated_at=now(-21), is_internal=True),
            CaseNote(case_id=c1.id, text="Traced 15,250 ETH through 3 hops of Tornado Cash deposits. See attached graph.", author=INV1, created_at=now(-15), updated_at=now(-15), is_internal=True),
            CaseNote(case_id=c1.id, text="Binance KYC request outstanding — awaiting exchange response.", author=COMP1, created_at=now(-5), updated_at=now(-5), is_internal=False),
        ])
        db.add_all([
            CaseTask(case_id=c1.id, title="Submit SAR to FinCEN",          status="Open",      assignee=COMP1,  due_date=now(3),  created_at=now(-21), created_by=INV1),
            CaseTask(case_id=c1.id, title="Obtain Binance KYC records",    status="In Progress",assignee=INV1,  due_date=now(0),  created_at=now(-20), created_by=INV1),
            CaseTask(case_id=c1.id, title="Graph all second-hop wallets",  status="Completed", assignee=INV1,  due_date=now(-10),created_at=now(-19), created_by=INV1),
            CaseTask(case_id=c1.id, title="Coordinate with Chainalysis",   status="Open",      assignee=INV2,  due_date=now(5),  created_at=now(-15), created_by=ADMIN),
        ])
        db.add_all([
            CaseEvidence(case_id=c1.id, title="OFAC SDN Entry — Lazarus Group", evidence_type="Document",          content="SDN List entry as of 2022-04-14. Entity: Lazarus Group (NK)", added_at=now(-21), added_by=INV1, tags=["ofac","sanctions"]),
            CaseEvidence(case_id=c1.id, title="Transaction graph — Hop 1-3",    evidence_type="Graph image",        content=f"Graph: {ADDR['lazarus_1']} → {ADDR['tornado_router']} → {ADDR['binance_14']}", added_at=now(-15), added_by=INV1, tags=["graph"]),
            CaseEvidence(case_id=c1.id, title="Blockchain analytics report",    evidence_type="Transaction data",   content="15,250 ETH moved in 47 transactions between 2026-10-28 and 2026-11-01", added_at=now(-14), added_by=INV1, tags=["analytics"]),
        ])

        # Case 2: Tornado Cash mixer usage
        c2 = Case(
            case_ref="CASE-2026-00002",
            tenant_id=TENANT,
            title="Suspected layering via Tornado Cash — 820 ETH",
            description=(
                "Customer deposited 820 ETH across 41 transactions into Tornado Cash "
                "mixer within 72 hours. Unusual pattern inconsistent with stated occupation "
                "(software freelancer). Source of funds unclear."
            ),
            status="Analysis",
            priority="High",
            case_type="Investigation",
            source="Transaction Monitoring",
            created_at=now(-14),
            updated_at=now(-1),
            created_by=COMP1,
            assigned_to=INV2,
            due_date=now(14),
            tags=["mixer", "layering", "aml"],
        )
        db.add(c2)
        db.flush()

        db.add_all([
            CaseSubject(case_id=c2.id, kind="wallet", ref=ADDR["tornado_proxy"],  role="Primary", chain_id=1, risk_score=85, label="Tornado Cash Proxy",    added_at=now(-14), added_by=COMP1),
            CaseSubject(case_id=c2.id, kind="wallet", ref=ADDR["tornado_router"], role="Linked",  chain_id=1, risk_score=87, label="Tornado Cash Router",    added_at=now(-14), added_by=COMP1),
            CaseSubject(case_id=c2.id, kind="wallet", ref=ADDR["binance_7"],      role="Off-ramp",chain_id=1, risk_score=18, label="Binance Cold Wallet 7",  added_at=now(-13), added_by=INV2),
        ])
        db.add_all([
            CaseNote(case_id=c2.id, text="41 Tornado Cash deposits identified, avg 20 ETH each. Total: 820 ETH (~$2.05M).", author=COMP1, created_at=now(-14), updated_at=now(-14), is_internal=True),
            CaseNote(case_id=c2.id, text="Customer called to explain. Claims funds from crypto trading. No tax records provided.", author=INV2, created_at=now(-7), updated_at=now(-7), is_internal=True),
        ])
        db.add_all([
            CaseTask(case_id=c2.id, title="Request source-of-funds documentation", status="In Progress", assignee=INV2,  due_date=now(2),  created_at=now(-14), created_by=COMP1),
            CaseTask(case_id=c2.id, title="Risk score review",                      status="Open",       assignee=COMP1, due_date=now(5),  created_at=now(-14), created_by=COMP1),
            CaseTask(case_id=c2.id, title="STR filing decision",                    status="Open",       assignee=ADMIN, due_date=now(10), created_at=now(-10), created_by=COMP1),
        ])

        # Case 3: FTX-linked wallet
        c3 = Case(
            case_ref="CASE-2026-00003",
            tenant_id=TENANT,
            title="FTX creditor claim — asset recovery monitoring",
            description=(
                "Monitoring FTX hot wallet activity post-bankruptcy. Unexpected outbound "
                "transaction of 50,000 ETH on 2026-10-15 raises concerns about unauthorized "
                "asset movement during bankruptcy proceedings."
            ),
            status="Evidence Collection",
            priority="High",
            case_type="Investigation",
            source="Manual",
            created_at=now(-30),
            updated_at=now(-3),
            created_by=INV1,
            assigned_to=INV1,
            due_date=now(20),
            tags=["ftx", "bankruptcy", "asset-recovery"],
        )
        db.add(c3)
        db.flush()

        db.add_all([
            CaseSubject(case_id=c3.id, kind="wallet", ref=ADDR["ftx_hot"],    role="Primary",  chain_id=1, risk_score=72, label="FTX Exchange Hot Wallet", added_at=now(-30), added_by=INV1),
            CaseSubject(case_id=c3.id, kind="wallet", ref=ADDR["binance_14"], role="Recipient",chain_id=1, risk_score=20, label="Binance Hot Wallet 14",   added_at=now(-28), added_by=INV1),
        ])
        db.add_all([
            CaseNote(case_id=c3.id, text="50K ETH transfer detected. Possible unauthorized movement. Flagged to legal.", author=INV1, created_at=now(-30), updated_at=now(-30), is_internal=True),
        ])

        # Case 4: Bitfinex hack wallet
        c4 = Case(
            case_ref="CASE-2026-00004",
            tenant_id=TENANT,
            title="Bitfinex hack — wallet reactivation alert",
            description=(
                "Dormant wallet linked to 2016 Bitfinex hack has become active after "
                "5 years. 1,500 BTC equivalent in ETH moving through multiple hops. "
                "Coordinated investigation with FBI Cyber Division."
            ),
            status="Assigned",
            priority="Critical",
            case_type="Sanctions",
            source="Alert System",
            created_at=now(-5),
            updated_at=now(-1),
            created_by=ADMIN,
            assigned_to=INV2,
            due_date=now(10),
            tags=["bitfinex", "hack", "dormant-wallet", "law-enforcement"],
        )
        db.add(c4)
        db.flush()

        db.add_all([
            CaseSubject(case_id=c4.id, kind="wallet", ref=ADDR["bitfinex_hack"], role="Primary",chain_id=1, risk_score=96, label="Bitfinex Hack (2016)",      added_at=now(-5), added_by=ADMIN),
            CaseSubject(case_id=c4.id, kind="wallet", ref=ADDR["tornado_router"],role="Linked", chain_id=1, risk_score=87, label="Tornado Cash Router",       added_at=now(-4), added_by=INV2),
        ])

        # Case 5: Low priority structuring case
        c5 = Case(
            case_ref="CASE-2026-00005",
            tenant_id=TENANT,
            title="Potential structuring — repeated small ETH deposits",
            description=(
                "Customer making 23 deposits of 0.99 ETH each over 30 days, "
                "just below monitoring thresholds. Classic structuring pattern."
            ),
            status="Open",
            priority="Medium",
            case_type="STR",
            source="Transaction Monitoring",
            created_at=now(-7),
            updated_at=now(-7),
            created_by=COMP1,
            assigned_to=None,
            due_date=now(21),
            tags=["structuring", "smurfing"],
        )
        db.add(c5)
        db.flush()

        db.add_all([
            CaseSubject(case_id=c5.id, kind="wallet", ref=ADDR["vitalik"],   role="Reference", chain_id=1, risk_score=5,  label="Vitalik.eth (reference)",  added_at=now(-7), added_by=COMP1),
            CaseSubject(case_id=c5.id, kind="wallet", ref=ADDR["uniswap_v3"],role="Linked",    chain_id=1, risk_score=10, label="Uniswap V3 Factory",        added_at=now(-6), added_by=COMP1),
        ])

        # ── WATCHLISTS ────────────────────────────────────────────────────────

        wl1 = Watchlist(
            tenant_id=TENANT, name="OFAC Sanctions — Crypto", scope="Org",
            description="OFAC SDN list addresses linked to sanctioned entities (Lazarus Group, Iran, etc.)",
            rule_type="sanctions", rule_value="sanctions",
            created_at=now(-60), updated_at=now(-1), created_by=ADMIN,
        )
        db.add(wl1); db.flush()

        db.add_all([
            WatchlistEntry(watchlist_id=wl1.id, chain_id=1, address=ADDR["lazarus_1"],   label="Lazarus Group (OFAC SDN)",      risk_score=98, added_at=now(-60), added_by=ADMIN),
            WatchlistEntry(watchlist_id=wl1.id, chain_id=1, address=ADDR["lazarus_2"],   label="Lazarus Group Affiliate",        risk_score=95, added_at=now(-60), added_by=ADMIN),
            WatchlistEntry(watchlist_id=wl1.id, chain_id=1, address=ADDR["bitfinex_hack"],label="Bitfinex Hack 2016",            risk_score=96, added_at=now(-45), added_by=ADMIN),
            WatchlistEntry(watchlist_id=wl1.id, chain_id=1, address=ADDR["ofac_iran_1"], label="OFAC Iran (Crypto Exchange)",    risk_score=92, added_at=now(-30), added_by=ADMIN),
        ])

        wl2 = Watchlist(
            tenant_id=TENANT, name="High-Risk Mixer Addresses", scope="Team",
            description="Known mixing service contracts and associated deposit/withdrawal addresses",
            rule_type="label", rule_value="mixer",
            created_at=now(-45), updated_at=now(-2), created_by=INV1,
        )
        db.add(wl2); db.flush()

        db.add_all([
            WatchlistEntry(watchlist_id=wl2.id, chain_id=1, address=ADDR["tornado_router"],label="Tornado Cash Router",           risk_score=87, added_at=now(-45), added_by=INV1),
            WatchlistEntry(watchlist_id=wl2.id, chain_id=1, address=ADDR["tornado_proxy"], label="Tornado Cash Proxy",             risk_score=85, added_at=now(-45), added_by=INV1),
        ])

        wl3 = Watchlist(
            tenant_id=TENANT, name="Exchange Monitoring", scope="Org",
            description="Major exchange hot/cold wallets for outflow monitoring",
            rule_type="threshold", rule_value="30",
            created_at=now(-90), updated_at=now(-10), created_by=COMP1,
        )
        db.add(wl3); db.flush()

        db.add_all([
            WatchlistEntry(watchlist_id=wl3.id, chain_id=1, address=ADDR["binance_14"],  label="Binance Hot Wallet 14",           risk_score=20, added_at=now(-90), added_by=COMP1),
            WatchlistEntry(watchlist_id=wl3.id, chain_id=1, address=ADDR["binance_7"],   label="Binance Cold Wallet 7",           risk_score=18, added_at=now(-90), added_by=COMP1),
            WatchlistEntry(watchlist_id=wl3.id, chain_id=1, address=ADDR["ftx_hot"],     label="FTX Exchange Hot Wallet",         risk_score=72, added_at=now(-60), added_by=INV1),
            WatchlistEntry(watchlist_id=wl3.id, chain_id=1, address=ADDR["uniswap_v3"],  label="Uniswap V3 Factory",             risk_score=10, added_at=now(-30), added_by=COMP1),
        ])

        # ── ALERTS ───────────────────────────────────────────────────────────

        alerts = [
            Alert(tenant_id=TENANT, watchlist_id=wl1.id, chain_id=1, wallet=ADDR["lazarus_1"],    trigger="OFAC SDN match — Lazarus Group",             score=98, tier="crit", status="New",      at=now(-21), details={"rule":"sanctions","matched_entity":"Lazarus Group"}),
            Alert(tenant_id=TENANT, watchlist_id=wl1.id, chain_id=1, wallet=ADDR["lazarus_2"],    trigger="OFAC SDN match — Lazarus Group affiliate",   score=95, tier="crit", status="New",      at=now(-20), details={"rule":"sanctions"}),
            Alert(tenant_id=TENANT, watchlist_id=wl2.id, chain_id=1, wallet=ADDR["tornado_router"],trigger="Tornado Cash interaction — 15,250 ETH",     score=87, tier="high", status="New",      at=now(-19), details={"rule":"mixer","volume_eth":15250}),
            Alert(tenant_id=TENANT, watchlist_id=wl2.id, chain_id=1, wallet=ADDR["tornado_proxy"], trigger="Mixer deposit — 41 transactions in 72h",    score=85, tier="high", status="Reviewed", at=now(-14), details={"rule":"mixer","tx_count":41}),
            Alert(tenant_id=TENANT, watchlist_id=wl1.id, chain_id=1, wallet=ADDR["bitfinex_hack"], trigger="Dormant wallet reactivated — 5yr dormancy",  score=96, tier="crit", status="New",      at=now(-5),  details={"rule":"dormant","dormant_days":1825}),
            Alert(tenant_id=TENANT, watchlist_id=wl3.id, chain_id=1, wallet=ADDR["ftx_hot"],       trigger="Unusual outflow — 50,000 ETH in single tx",  score=72, tier="high", status="Reviewed", at=now(-30), details={"rule":"threshold","volume_eth":50000}),
            Alert(tenant_id=TENANT, watchlist_id=wl3.id, chain_id=1, wallet=ADDR["binance_14"],    trigger="High-volume inflow — possible layering exit", score=45, tier="mod",  status="Resolved", at=now(-18), resolved_at=now(-15), resolved_by=INV1, resolution="Legitimate exchange deposit, no further action", details={}),
            Alert(tenant_id=TENANT, watchlist_id=wl1.id, chain_id=1, wallet=ADDR["ofac_iran_1"],   trigger="Potential OFAC match — Iran-linked entity",  score=92, tier="crit", status="New",      at=now(-3),  details={"rule":"sanctions","matched_entity":"Iran crypto exchange"}),
            Alert(tenant_id=TENANT, watchlist_id=wl2.id, chain_id=1, wallet=ADDR["tornado_router"],trigger="Mixer volume spike — 2,400 ETH in 24h",      score=82, tier="high", status="New",      at=now(-2),  details={"rule":"mixer","volume_eth":2400}),
            Alert(tenant_id=TENANT, watchlist_id=wl3.id, chain_id=1, wallet=ADDR["ftx_hot"],       trigger="New transaction detected — post-bankruptcy",  score=72, tier="high", status="New",      at=now(-1),  details={"rule":"threshold"}),
            Alert(tenant_id=TENANT, watchlist_id=None,   chain_id=1, wallet=ADDR["vitalik"],        trigger="Monitored wallet — large outbound transfer",  score=12, tier="low",  status="Resolved", at=now(-10), resolved_at=now(-9), resolved_by=COMP1, resolution="Public donation — no AML concern", details={}),
        ]
        db.add_all(alerts)

        db.commit()
        print(f"✓ Seeded {5} cases, {3} watchlists, {len(alerts)} alerts")
        print(f"  Cases: {', '.join([c1.case_ref, c2.case_ref, c3.case_ref, c4.case_ref, c5.case_ref])}")
        print(f"  Wallets use real Ethereum addresses — graph API will pull live on-chain data")


if __name__ == "__main__":
    main()
