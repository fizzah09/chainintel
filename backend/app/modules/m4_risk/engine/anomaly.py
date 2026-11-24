"""Behavioural analysis (port of src/engine/anomaly.js).

Compares the recent window with the wallet's own baseline using robust statistics (median and MAD)
and looks for laundering-style patterns. Returns signals with plain-language reasons and a 0-100 score.
"""

import math

from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.engine.features import usd_of
from app.modules.m4_risk.engine.jscompat import DAY_MS, en_us, js_round, js_sum, parse_ms, to_fixed


def _median(xs: list[float]) -> float:
    if not xs:
        return 0
    s = sorted(xs)
    m = len(s) >> 1
    return s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2


def _mad(xs: list[float], m: float) -> float:
    return _median([abs(x - m) for x in xs])


def _daily(txs: list[dict], frm: int, to: int, rules: RuleSet) -> dict:
    n = max(1, js_round((to - frm) / DAY_MS))
    count, vol, fresh = [0] * n, [0] * n, [0] * n
    seen: set[str] = set()
    for t in sorted(txs, key=lambda x: x["time"]):
        ts = parse_ms(t["time"])
        cp = t["cp"].lower()
        is_new = cp not in seen
        seen.add(cp)
        if ts < frm or ts >= to:
            continue
        i = min(n - 1, math.floor((ts - frm) / DAY_MS))
        count[i] += 1
        vol[i] += usd_of(t, rules)
        if is_new:
            fresh[i] += 1
    return {"count": count, "vol": vol, "fresh": fresh}


def _compare(name: str, unit: str, base: list[float], recent: list[float]) -> dict:
    m = _median(base)
    d = _mad(base, m)
    r = js_sum(recent) / max(1, len(recent))
    floor = 50 if unit == "USD" else 0.5
    ratio = r / max(m, floor)
    z = (r - m) / (1.4826 * d + floor * 0.5)
    return {"metric": name, "unit": unit, "baseline": m, "recent": r, "ratio": ratio, "z": z}


def _fmt(v: float, unit: str) -> str:
    if unit == "USD":
        return f"${en_us(js_round(v))}"
    return en_us(js_round(v)) if v >= 10 else to_fixed(v, 1)


def analyse_behaviour(txs: list[dict], as_of: str, rules: RuleSet) -> dict:
    now = parse_ms(as_of)
    recent_from = now - rules.recent_days * DAY_MS
    base_from = recent_from - rules.baseline_days * DAY_MS
    b = _daily(txs, base_from, recent_from, rules)
    r = _daily(txs, recent_from, now, rules)
    metrics = [
        _compare("Transactions per day", "tx", b["count"], r["count"]),
        _compare("Volume per day", "USD", b["vol"], r["vol"]),
        _compare("New counterparties per day", "cp", b["fresh"], r["fresh"]),
    ]
    signals: list[dict] = []
    for m in metrics:
        if m["ratio"] >= 3 and m["z"] >= 3:
            signals.append(
                {
                    "type": "spike",
                    "severity": "High" if m["ratio"] >= 6 else "Medium",
                    "title": f"{m['metric']} {to_fixed(m['ratio'], 1)}x above baseline",
                    "detail": f"Last {rules.recent_days} days average {_fmt(m['recent'], m['unit'])} vs "
                    f"{rules.baseline_days}-day median {_fmt(m['baseline'], m['unit'])}.",
                    "weight": 35 if m["ratio"] >= 6 else 20,
                }
            )

    srt = sorted(txs, key=lambda x: x["time"])
    usd = lambda t: usd_of(t, rules)  # noqa: E731

    # Rapid pass-through: most of an inbound amount leaves within 30 minutes.
    passes = []
    for i, t in enumerate(srt):
        if t["dir"] != "in" or parse_ms(t["time"]) < base_from:
            continue
        ts = parse_ms(t["time"])
        out = 0
        outs = []
        j = i + 1
        while j < len(srt) and parse_ms(srt[j]["time"]) - ts <= 30 * 60000:
            if srt[j]["dir"] == "out":
                out += usd(srt[j])
                outs.append(srt[j])
            j += 1
        if usd(t) >= 1000 and out >= 0.8 * usd(t):
            passes.append({"in": t, "outs": outs, "share": out / usd(t)})
    if passes:
        top = passes[0]
        for c in passes[1:]:
            if usd(c["in"]) > usd(top["in"]):
                top = c
        mins = js_round((parse_ms(top["outs"][-1]["time"]) - parse_ms(top["in"]["time"])) / 60000)
        n = len(passes)
        signals.append(
            {
                "type": "pass-through",
                "severity": "High" if n >= 3 else "Medium",
                "title": f"Rapid pass-through ({n} time{'s' if n > 1 else ''})",
                "detail": f"Example: received {_fmt(usd(top['in']), 'USD')}, {js_round(top['share'] * 100)}% sent on within "
                f"{mins} minutes to {len({o['cp'] for o in top['outs']})} address(es).",
                "txs": ([top["in"]["hash"]] + [o["hash"] for o in top["outs"]])[:5],
                "weight": 30 if n >= 3 else 18,
            }
        )
    # Fan-out: an inbound amount split to 3 or more addresses within 30 minutes.
    fan = [p for p in passes if len({o["cp"] for o in p["outs"]}) >= 3]
    if fan:
        signals.append(
            {
                "type": "fan-out",
                "severity": "Medium",
                "title": "Funds split across several wallets",
                "detail": f"{len(fan)} inbound transfer(s) split to 3 or more addresses within 30 minutes.",
                "weight": 12,
            }
        )
    # Dormant wallet reactivated.
    for i in range(1, len(srt)):
        gap = (parse_ms(srt[i]["time"]) - parse_ms(srt[i - 1]["time"])) / DAY_MS
        if gap >= 90 and parse_ms(srt[i]["time"]) >= base_from:
            signals.append(
                {
                    "type": "dormancy",
                    "severity": "Medium",
                    "title": f"Reactivated after {js_round(gap)} days dormant",
                    "detail": f"Inactive from {srt[i - 1]['time'][:10]} to {srt[i]['time'][:10]}.",
                    "weight": 12,
                }
            )
            break
    # Structuring: repeated transfers just under 10,000 USD in the recent window.
    under = [t for t in srt if parse_ms(t["time"]) >= recent_from and 9000 <= usd(t) < 10000]
    if len(under) >= 3:
        signals.append(
            {
                "type": "structuring",
                "severity": "Medium",
                "title": f"{len(under)} transfers just under 10,000 USD",
                "detail": f"Within the last {rules.recent_days} days.",
                "txs": [t["hash"] for t in under[:5]],
                "weight": 15,
            }
        )

    score = min(100, js_sum(s["weight"] for s in signals))
    level = "High" if score >= 50 else "Medium" if score >= 20 else "Low" if score > 0 else "None"
    return {
        "score": score,
        "level": level,
        "signals": signals,
        "metrics": metrics,
        "windows": {"recentDays": rules.recent_days, "baselineDays": rules.baseline_days},
    }
