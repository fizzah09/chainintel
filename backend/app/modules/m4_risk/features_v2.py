"""R4 feature set v2: time windows, FATF-style behaviour patterns, exposure share and graph measures.

Pure functions over the engine's transaction dicts (`inputs.to_engine_tx`): no database, no clock
except the `as_of` the caller passes in. Amounts are USD where a price is stored and are otherwise
left out of USD features (`usd_priced_share` says how many were left out), so a missing price never
turns into a zero that looks like safe behaviour.

Behaviour patterns follow the FATF red flags the bank must be able to explain: pass-through (money
received and forwarded at once), fan-out and fan-in bursts (many counterparties in one day), amounts
just under reporting limits, round amounts and exposure to labelled risky counterparties.
"""

from bisect import bisect_right
from collections import Counter

from app.modules.m4_risk.engine.jscompat import DAY_MS, parse_ms

FEATURE_SET_V2 = "wallet-features-v2"
WINDOWS_DAYS = (30, 90, 180, 365)
LIMITS_USD = (3000.0, 10000.0)  # common reporting and structuring thresholds
JUST_UNDER = 0.9  # "just under" = between 90% and 100% of a limit
ROUND_MIN_USD = 100.0
ROUND_STEP_USD = 100.0
ROUND_TOLERANCE_USD = 1.0
BURST_MS = DAY_MS


def _ms(t: dict) -> int:
    return parse_ms(t["time"])


def _usd(t: dict) -> float | None:
    v = t.get("usd")
    return None if v is None else float(v)


def _ratio(a: float, b: float) -> float:
    """min/max of two non-negative amounts: 1 means the same amount each way, 0 means one side is empty."""
    hi = max(a, b)
    return min(a, b) / hi if hi > 0 else 0.0


def _burst(events: list[tuple[int, str]]) -> int:
    """Largest number of distinct counterparties inside any 24-hour window. `events` sorted by time."""
    best, counts, j, n = 0, Counter(), 0, len(events)
    for i in range(n):
        start = events[i][0]
        while j < n and events[j][0] <= start + BURST_MS:
            counts[events[j][1]] += 1
            j += 1
        best = max(best, len(counts))
        cp = events[i][1]
        counts[cp] -= 1
        if counts[cp] == 0:
            del counts[cp]
    return best


def _window(txs: list[dict], as_of_ms: int, days: int) -> list[dict]:
    lo = as_of_ms - days * DAY_MS
    return [t for t in txs if lo < _ms(t) <= as_of_ms]


def _window_features(txs: list[dict], as_of_ms: int, days: int) -> dict:
    w = _window(txs, as_of_ms, days)
    ins = [t for t in w if t["dir"] == "in"]
    outs = [t for t in w if t["dir"] == "out"]
    in_usd = sum(_usd(t) or 0.0 for t in ins)
    out_usd = sum(_usd(t) or 0.0 for t in outs)
    p = f"w{days}_"
    return {
        p + "tx_count": float(len(w)),
        p + "in_count": float(len(ins)),
        p + "out_count": float(len(outs)),
        p + "unique_counterparties": float(len({t["cp"].lower() for t in w})),
        p + "volume_usd": in_usd + out_usd,
        p + "pass_through_ratio": _ratio(in_usd, out_usd),
    }


def _forwarded_share(ins: list[dict], outs: list[dict]) -> float:
    """Share of incoming USD that leaves again within 24 hours (rapid pass-through, FATF layering)."""
    priced_in = [t for t in ins if _usd(t) is not None]
    total_in = sum(_usd(t) for t in priced_in)
    if total_in <= 0:
        return 0.0
    out_times = sorted(_ms(t) for t in outs if _usd(t) is not None)
    out_sorted = sorted((_ms(t), _usd(t)) for t in outs if _usd(t) is not None)
    prefix = [0.0]
    for _, u in out_sorted:
        prefix.append(prefix[-1] + u)
    forwarded = 0.0
    for t in priced_in:
        at = _ms(t)
        i = bisect_right(out_times, at)
        j = bisect_right(out_times, at + BURST_MS)
        sent_soon = prefix[j] - prefix[i]
        forwarded += min(_usd(t), sent_soon)
    return min(1.0, forwarded / total_in)


def _risky_share(txs: list[dict], labels: dict, risk_cats: set[str]) -> tuple[float, float, int]:
    """(share of incoming USD from risky counterparties, share of outgoing USD to them, distinct count)."""
    def risky(t: dict) -> bool:
        lab = labels.get(t["cp"].lower())
        return bool(lab) and lab.get("cat") in risk_cats

    ins = [t for t in txs if t["dir"] == "in" and _usd(t) is not None]
    outs = [t for t in txs if t["dir"] == "out" and _usd(t) is not None]
    tin = sum(_usd(t) for t in ins)
    tout = sum(_usd(t) for t in outs)
    rin = sum(_usd(t) for t in ins if risky(t))
    rout = sum(_usd(t) for t in outs if risky(t))
    cps = {t["cp"].lower() for t in txs if risky(t)}
    return (rin / tin if tin > 0 else 0.0), (rout / tout if tout > 0 else 0.0), len(cps)


def _is_round(usd: float) -> bool:
    if usd < ROUND_MIN_USD:
        return False
    nearest = round(usd / ROUND_STEP_USD) * ROUND_STEP_USD
    return abs(usd - nearest) < ROUND_TOLERANCE_USD


def _just_under(usd: float) -> bool:
    return any(JUST_UNDER * lim <= usd < lim for lim in LIMITS_USD)


def v2_features(txs: list[dict], labels: dict, as_of_iso: str, risk_cats: set[str]) -> tuple[dict, dict]:
    """(features, data quality) for the wallet's transactions known at `as_of_iso`."""
    as_of_ms = parse_ms(as_of_iso)
    known = [t for t in txs if _ms(t) <= as_of_ms]
    ins = sorted((t for t in known if t["dir"] == "in"), key=_ms)
    outs = sorted((t for t in known if t["dir"] == "out"), key=_ms)
    priced = [t for t in known if _usd(t) is not None]

    feats: dict[str, float] = {}
    for days in WINDOWS_DAYS:
        feats.update(_window_features(known, as_of_ms, days))

    times = [_ms(t) for t in known]
    feats["age_days"] = (as_of_ms - min(times)) / DAY_MS if times else 0.0
    feats["days_since_last_tx"] = (as_of_ms - max(times)) / DAY_MS if times else 0.0

    usd_values = [_usd(t) for t in priced]
    feats["round_amount_share"] = (
        sum(_is_round(u) for u in usd_values) / len(usd_values) if usd_values else 0.0
    )
    feats["just_under_limit_share"] = (
        sum(_just_under(u) for u in usd_values) / len(usd_values) if usd_values else 0.0
    )
    feats["rapid_pass_through_share"] = _forwarded_share(ins, outs)
    feats["fan_out_24h_max"] = float(_burst([(_ms(t), t["cp"].lower()) for t in outs]))
    feats["fan_in_24h_max"] = float(_burst([(_ms(t), t["cp"].lower()) for t in ins]))

    risky_in, risky_out, risky_cps = _risky_share(known, labels, risk_cats)
    feats["risky_in_volume_share"] = risky_in
    feats["risky_out_volume_share"] = risky_out
    feats["risky_counterparties"] = float(risky_cps)

    quality = {
        "transactions": len(known),
        "usd_priced_share": (len(priced) / len(known)) if known else 0.0,
        "unpriced_transactions": len(known) - len(priced),
    }
    return {k: float(v) for k, v in feats.items()}, quality
