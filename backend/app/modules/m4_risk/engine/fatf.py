"""R5: FATF red flags as scored factors (rule set 4 only).

Each flag reads the v2 features (`features_v2.py`), so the numbers a factor shows are the numbers the
feature store stores. A flag only scores when it has enough evidence: a share measured on three
transactions proves nothing. Every factor names the transactions behind it, so the score can be traced.
"""

from app.modules.m4_risk.engine.config import CAT_NAME, LabelLookup, RuleSet
from app.modules.m4_risk.engine.jscompat import js_str, parse_ms, r1
from app.modules.m4_risk.features_v2 import v2_features

PASS_THROUGH_MIN = 0.5  # share of incoming USD forwarded within 24 hours
PASS_THROUGH_MIN_USD = 1000.0
FAN_MIN = 5  # distinct counterparties in one 24-hour window
FAN_FULL = 10  # ... at which the factor reaches full points
STRUCTURING_MIN_SHARE = 0.25
ROUND_MIN_SHARE = 0.5
MIN_PRICED = 4  # priced transactions needed before any share is judged


def _severity(pts: float, mx: float) -> str:
    return "Critical" if pts >= mx * 0.75 else "High" if pts >= mx * 0.45 else "Medium" if pts >= mx * 0.2 else "Low"


def _factor(fid: str, pts: float, mx: float, summary: str, calc: str, txs: list[dict]) -> dict:
    return {
        "id": fid, "name": CAT_NAME[fid], "points": pts, "max": mx, "severity": _severity(pts, mx),
        "summary": summary, "calc": calc,
        "evidence": [{"signal": CAT_NAME[fid], "detail": summary, "txs": [t["hash"] for t in txs[:5]],
                      "source": "Risk engine computation (FATF red flag)"}],
    }


def fatf_factors(txs: list[dict], labels: LabelLookup, as_of: str, rules: RuleSet) -> list[dict]:
    if not rules.fatf_rules:
        return []
    P = rules.points
    cps = {t["cp"].lower() for t in txs}
    label_map = {a: lab for a in cps if (lab := labels(a))}
    f, q = v2_features(txs, label_map, as_of, set(rules.risk_cats))
    priced = q["transactions"] * q["usd_priced_share"]
    out: list[dict] = []

    ins = [t for t in txs if t["dir"] == "in"]
    share = f["rapid_pass_through_share"]
    if priced >= MIN_PRICED and share >= PASS_THROUGH_MIN and f["w365_volume_usd"] >= PASS_THROUGH_MIN_USD:
        pts = r1(P["passThrough"] * min(1, share))
        out.append(_factor(
            "passThrough", pts, P["passThrough"],
            f"{round(share * 100)}% of incoming USD was forwarded within 24 hours",
            f"{js_str(P['passThrough'])} max × min(1, {js_str(round(share, 2))}) = {js_str(pts)}",
            ins,
        ))

    burst = max(f["fan_out_24h_max"], f["fan_in_24h_max"])
    if burst >= FAN_MIN:
        pts = r1(P["fanBurst"] * min(1, burst / FAN_FULL))
        out.append(_factor(
            "fanBurst", pts, P["fanBurst"],
            f"{int(burst)} distinct counterparties inside one 24-hour window",
            f"{js_str(P['fanBurst'])} max × min(1, {int(burst)}/{FAN_FULL}) = {js_str(pts)}",
            txs,
        ))

    under = f["just_under_limit_share"]
    if priced >= MIN_PRICED and under >= STRUCTURING_MIN_SHARE:
        pts = r1(P["structuring"] * min(1, under / 0.5))
        out.append(_factor(
            "structuring", pts, P["structuring"],
            f"{round(under * 100)}% of priced transfers sit just under a reporting limit",
            f"{js_str(P['structuring'])} max × min(1, {js_str(round(under, 2))}/0.5) = {js_str(pts)}",
            txs,
        ))

    rnd = f["round_amount_share"]
    if priced >= MIN_PRICED and rnd >= ROUND_MIN_SHARE:
        pts = r1(P["roundAmounts"] * min(1, rnd))
        out.append(_factor(
            "roundAmounts", pts, P["roundAmounts"],
            f"{round(rnd * 100)}% of priced transfers are round amounts",
            f"{js_str(P['roundAmounts'])} max × {js_str(round(rnd, 2))} = {js_str(pts)}",
            txs,
        ))
    return out


def exposure_weight(e: dict, rules: RuleSet, total_usd: float, as_of: str) -> tuple[float, float, float]:
    """(decay, share factor, combined) for one exposure item under rule set 4. Rule sets 1-3: all 1."""
    decay = 1.0
    if rules.decay_half_life_days and e.get("firstObserved"):
        age_days = max(0.0, (parse_ms(as_of) - parse_ms(e["firstObserved"])) / 86_400_000)
        decay = max(0.5, 0.5 ** (age_days / rules.decay_half_life_days))
    share = 1.0
    if rules.share_weighting:
        frac = (e["usd"] / total_usd) if total_usd > 0 else 1.0
        share = 0.25 + 0.75 * min(1.0, frac / 0.10)  # 10% of volume or more = full weight
    return decay, share, decay * share
