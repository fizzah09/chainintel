"""R5 rule set 4 (offline): five bands, decay and share-weighted exposure, FATF factors, and rule sets 1-3
left exactly as they were."""

from datetime import UTC, datetime, timedelta

from app.modules.m4_risk.engine.config import RULESET_V1, RULESET_V2, RULESET_V3, RULESET_V4, RULESETS, TIER_NAME
from app.modules.m4_risk.engine.fatf import fatf_factors
from app.modules.m4_risk.engine.rules import score_rules

AS_OF = datetime(2026, 11, 17, 12, 0, tzinfo=UTC)
ME = "0x" + "1" * 40
SDN = "0x" + "5" * 40


def iso(days_before: float = 0, hours_after: float = 0) -> str:
    return (AS_OF - timedelta(days=days_before) + timedelta(hours=hours_after)).strftime("%Y-%m-%dT%H:%M:%SZ")


AS_OF_ISO = iso()


def tx(dir_: str, cp: str, usd: float | None, when: str, h: str | None = None) -> dict:
    return {"dir": dir_, "cp": cp, "usd": usd, "time": when, "sym": "ETH", "value": 1.0, "hash": h or when + cp}


def exposure(usd: float, first: str, hops: int = 1, cat: str = "mixer") -> dict:
    return {"address": SDN, "cat": cat, "hops": hops, "usd": usd, "txs": [], "firstObserved": first,
            "direction": "in", "relationship": "Direct" if hops == 1 else "Indirect", "source": "t", "name": "x",
            "path": [SDN, ME]}


def run(rules, exp=(), txs=(), inflow=0.0, outflow=0.0, labels=None):
    return score_rules(
        exposure=list(exp), behaviour={"score": 0, "signals": []}, counterparties={"risky": [], "total": 0, "mix": {}},
        facts={"firstSeen": None, "inflowUsd": inflow, "outflowUsd": outflow}, txs=list(txs), as_of=AS_OF_ISO,
        labels=labels or (lambda a: None), rules=rules, address=ME,
    )


def factor(res, fid):
    return next((f for f in res["factors"] if f["id"] == fid), None)


# ---- immutability and registry --------------------------------------------------------------------


def test_rule_sets_1_to_3_are_unchanged():
    assert RULESET_V1.tiers == (25, 50, 75) and RULESET_V1.bands == ("low", "mod", "high", "crit")
    assert RULESET_V2.tiers == (25, 50, 75) and RULESET_V3.score_own_label is True
    for r in (RULESET_V1, RULESET_V2, RULESET_V3):
        assert r.decay_half_life_days is None and r.share_weighting is False and r.fatf_rules is False
    assert "passThrough" not in RULESET_V3.points
    assert sorted(RULESETS) == [1, 2, 3, 4]


# ---- bands ----------------------------------------------------------------------------------------


def test_five_bands_for_rule_set_4_with_boundaries():
    cases = {0: "low", 19.9: "low", 20: "mod", 39.9: "mod", 40: "elev", 59.9: "elev", 60: "high", 79.9: "high", 80: "crit", 100: "crit"}
    for score, band in cases.items():
        assert RULESET_V4.tier_for(score) == band, score
    assert RULESET_V4.bound("crit") == 80 and RULESET_V4.bound("mod") == 20 and RULESET_V4.bound("high") == 60
    assert TIER_NAME["elev"] == "Elevated"


def test_rule_set_1_bands_are_unchanged():
    assert [RULESET_V1.tier_for(x) for x in (24.9, 25, 50, 75)] == ["low", "mod", "high", "crit"]
    assert RULESET_V1.bound("crit") == 75 and RULESET_V1.bound("high") == 50


# ---- sanctions floor ------------------------------------------------------------------------------


def test_direct_sanctions_floor_is_80_under_rule_set_4():
    res = run(RULESET_V4, exp=[exposure(100.0, iso(1), hops=1, cat="sanctions")])
    assert res["score"] == 80 and res["tier"] == "crit" and "Raised from" in res["floor"]
    assert "80" in res["floor"]


# ---- decay and share weighting --------------------------------------------------------------------


def test_old_exposure_counts_for_less_but_never_below_half():
    recent = run(RULESET_V4, exp=[exposure(10000.0, iso(10))], inflow=10000.0)
    old = run(RULESET_V4, exp=[exposure(10000.0, iso(365 * 3))], inflow=10000.0)
    assert old["score"] < recent["score"]
    floor_hit = run(RULESET_V4, exp=[exposure(10000.0, iso(365 * 30))], inflow=10000.0)
    assert floor_hit["score"] >= old["score"] * 0.5 - 1  # the decay floor keeps very old exposure at half weight


def test_rule_set_3_ignores_age():
    recent = run(RULESET_V3, exp=[exposure(10000.0, iso(10))], inflow=10000.0)
    old = run(RULESET_V3, exp=[exposure(10000.0, iso(365 * 3))], inflow=10000.0)
    assert old["score"] == recent["score"]


def test_small_share_of_volume_is_weighted_down():
    small = run(RULESET_V4, exp=[exposure(500.0, iso(5))], inflow=500.0, outflow=1_000_000.0)
    big = run(RULESET_V4, exp=[exposure(500.0, iso(5))], inflow=500.0, outflow=0.0)
    assert small["score"] < big["score"]
    assert "share of volume" in factor(small, "mixer")["calc"]


# ---- FATF factors ---------------------------------------------------------------------------------


def pass_through_txs():
    return [
        tx("in", "0x" + "a" * 40, 1000.0, iso(5)), tx("out", "0x" + "b" * 40, 950.0, iso(5, 1)),
        tx("in", "0x" + "c" * 40, 500.0, iso(10)), tx("out", "0x" + "d" * 40, 480.0, iso(10, 2)),
    ]


def test_pass_through_is_a_factor_with_evidence_under_rule_set_4():
    txs = pass_through_txs()
    res = run(RULESET_V4, txs=txs, inflow=1500.0, outflow=1430.0)
    f = factor(res, "passThrough")
    assert f is not None and f["points"] > 0 and f["evidence"][0]["txs"]
    assert f["evidence"][0]["txs"][0] == txs[0]["hash"]
    assert factor(run(RULESET_V3, txs=txs, inflow=1500.0, outflow=1430.0), "passThrough") is None


def test_fan_out_burst_factor():
    txs = [tx("out", f"0x{i:040x}", 10.0, iso(1, i * 0.5)) for i in range(1, 6)]
    res = run(RULESET_V4, txs=txs)
    f = factor(res, "fanBurst")
    assert f is not None and "5 distinct counterparties" in f["summary"]


def test_structuring_and_round_amounts_need_enough_priced_transfers():
    under = [tx("in", f"0x{i:040x}", 9500.0, iso(i)) for i in range(1, 5)]
    rnd = [tx("in", f"0x{i:040x}", 5000.0, iso(i)) for i in range(1, 5)]
    few = [tx("in", f"0x{i:040x}", 9500.0, iso(i)) for i in range(1, 3)]
    assert factor(run(RULESET_V4, txs=under), "structuring") is not None
    assert factor(run(RULESET_V4, txs=rnd), "roundAmounts") is not None
    assert factor(run(RULESET_V4, txs=few), "structuring") is None  # two transfers prove nothing


def test_fatf_factors_are_off_for_rule_sets_1_to_3():
    assert fatf_factors(pass_through_txs(), lambda a: None, AS_OF_ISO, RULESET_V3) == []
