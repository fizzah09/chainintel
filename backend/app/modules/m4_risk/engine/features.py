"""Classifier features and profile facts (port of src/engine/features.js).

Transaction shape (same as the prototype): {hash, time (ISO), from, to, cp, dir: 'in'|'out', sym,
value (token units), usd, contract}.
"""

from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.engine.jscompat import DAY_MS, js_sum, parse_ms

FEATURE_KEYS = (
    "avg_min_between_sent", "avg_min_between_received", "time_diff_first_last_min", "sent_tnx", "received_tnx",
    "unique_received_from", "unique_sent_to", "min_value_received", "max_value_received", "avg_value_received",
    "min_value_sent", "max_value_sent", "avg_value_sent", "total_ether_sent", "total_ether_received",
    "total_ether_balance", "erc20_total_tnxs",
)


def _mins(t: str) -> float:
    return parse_ms(t) / 60000


def _avg_gap(txs: list[dict]) -> float:
    if len(txs) < 2:
        return 0
    ts = sorted(_mins(x["time"]) for x in txs)
    return (ts[-1] - ts[0]) / (len(ts) - 1)


def _stats(vals: list[float]) -> dict:
    if not vals:
        return {"min": 0, "max": 0, "avg": 0, "sum": 0}
    s = js_sum(vals)
    return {"min": min(vals), "max": max(vals), "avg": s / len(vals), "sum": s}


def compute_features(txs: list[dict]) -> dict:
    eth = [t for t in txs if t["sym"] == "ETH"]
    sent = [t for t in eth if t["dir"] == "out"]
    recv = [t for t in eth if t["dir"] == "in"]
    allm = [_mins(t["time"]) for t in txs]
    s = _stats([t["value"] for t in sent])
    r = _stats([t["value"] for t in recv])
    return {
        "avg_min_between_sent": _avg_gap(sent),
        "avg_min_between_received": _avg_gap(recv),
        "time_diff_first_last_min": max(allm) - min(allm) if len(allm) > 1 else 0,
        "sent_tnx": len(sent),
        "received_tnx": len(recv),
        "unique_received_from": len({t["cp"].lower() for t in recv}),
        "unique_sent_to": len({t["cp"].lower() for t in sent}),
        "min_value_received": r["min"],
        "max_value_received": r["max"],
        "avg_value_received": r["avg"],
        "min_value_sent": s["min"],
        "max_value_sent": s["max"],
        "avg_value_sent": s["avg"],
        "total_ether_sent": s["sum"],
        "total_ether_received": r["sum"],
        "total_ether_balance": r["sum"] - s["sum"],
        "erc20_total_tnxs": len(txs) - len(eth),
    }


def usd_of(t: dict, rules: RuleSet) -> float:
    """t.usd ?? (ETH ? value * reference price : value)"""
    u = t.get("usd")
    if u is not None:
        return u
    if rules.eth_usd is None:
        return 0  # rule set 2+: unpriced is unknown, not guessed (see data quality)
    return t["value"] * rules.eth_usd if t["sym"] == "ETH" else t["value"]


def profile_facts(txs: list[dict], address: str, rules: RuleSet) -> dict:
    inflow = js_sum(usd_of(t, rules) for t in txs if t["dir"] == "in")
    outflow = js_sum(usd_of(t, rules) for t in txs if t["dir"] == "out")
    times = sorted(t["time"] for t in txs)
    days = max(1, (parse_ms(times[-1]) - parse_ms(times[0])) / DAY_MS) if times else 1
    largest = 0
    for t in txs:
        largest = max(largest, usd_of(t, rules))
    return {
        "address": address,
        "transactions": len(txs),
        "firstSeen": times[0] if times else None,
        "lastActive": times[-1] if times else None,
        "inflowUsd": inflow,
        "outflowUsd": outflow,
        "counterparties": len({t["cp"].lower() for t in txs}),
        "contracts": len({t["cp"].lower() for t in txs if t.get("contract")}),
        "avgTxUsd": (inflow + outflow) / len(txs) if txs else 0,
        "txPerDay": len(txs) / days,
        "largestTxUsd": largest,
    }
