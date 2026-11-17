"""Logical (rule-based) score (port of src/engine/rules.js).

Every point is traceable: score -> factor -> calculation -> transaction -> address -> source.
"""

from app.modules.m4_risk.engine.config import CAT_NAME, EXPOSURE_FACTORS, LabelLookup, RuleSet
from app.modules.m4_risk.engine.fatf import exposure_weight, fatf_factors
from app.modules.m4_risk.engine.jscompat import DAY_MS, en_us, js_round, js_str, js_sum, parse_ms, r1, to_fixed


def _amount_factor(usd: float, rules: RuleSet) -> float:
    return max(0.4, min(1, 0.4 + 0.6 * (usd / rules.full_amount_usd)))


def _severity(pts: float, mx: float) -> str:
    return "Critical" if pts >= mx * 0.75 else "High" if pts >= mx * 0.45 else "Medium" if pts >= mx * 0.2 else "Low"


def score_rules(
    *, exposure: list[dict], behaviour: dict, counterparties: dict, facts: dict, txs: list[dict], as_of: str,
    labels: LabelLookup, rules: RuleSet, address: str | None = None,
) -> dict:
    P = rules.points
    total_usd = facts["inflowUsd"] + facts["outflowUsd"]
    factors: list[dict] = []
    # Rule set 3+: the wallet's own risk label counts as the strongest possible exposure of its kind.
    own = labels(address) if rules.score_own_label and address else None
    own_cat = rules.risk_cats.get(own["cat"]) if own else None

    # Exposure factors: the strongest path per category sets the points (no double counting).
    for cat in EXPOSURE_FACTORS:
        items = [e for e in exposure if e["cat"] == cat]
        if not items and own_cat != cat:
            continue
        if own_cat == cat and own is not None:
            pts = r1(P[cat])
            factors.append(
                {
                    "id": cat, "name": CAT_NAME[cat], "points": pts, "max": P[cat], "severity": _severity(pts, P[cat]),
                    "summary": f"The wallet itself is labelled {own['cat']}: {own.get('name') or 'no name given'}",
                    "calc": f"{js_str(P[cat])} max × 1 (the wallet itself) = {js_str(pts)}",
                    "evidence": [{"counterparty": address, "relationship": "Wallet itself", "hops": 0, "source": own.get("source"),
                                  "sourceName": own.get("name"), "path": [address]}]
                    + [{"counterparty": e["address"], "relationship": e["relationship"], "hops": e["hops"], "usd": e["usd"],
                        "txs": e["txs"], "source": e["source"], "sourceName": e["name"], "path": e["path"]} for e in items[:4]],
                }
            )
            continue
        scored = []
        for e in items:
            hop = rules.hop_decay[e["hops"] - 1] if e["hops"] - 1 < len(rules.hop_decay) else 0
            amt = _amount_factor(e["usd"], rules)
            decay, share, weight = exposure_weight(e, rules, total_usd, as_of)
            scored.append({"e": e, "pts": P[cat] * hop * amt * weight, "hop": hop, "amt": amt,
                           "decay": decay, "share": share})
        scored.sort(key=lambda s: -s["pts"])
        best = scored[0]
        pts = r1(best["pts"])
        be = best["e"]
        factors.append(
            {
                "id": cat,
                "name": CAT_NAME[cat],
                "points": pts,
                "max": P[cat],
                "severity": _severity(pts, P[cat]),
                "summary": f"{be['relationship']} exposure of ${en_us(be['usd'])} to {be['name'] or 'a labelled address'}",
                "calc": f"{js_str(P[cat])} max × {js_str(best['hop'])} ({be['relationship'].lower()}) × "
                f"{to_fixed(best['amt'], 2)} (amount)"
                + (f" × {to_fixed(best['decay'], 2)} (age) × {to_fixed(best['share'], 2)} (share of volume)"
                   if rules.decay_half_life_days or rules.share_weighting else "")
                + f" = {js_str(pts)}",
                "evidence": [
                    {
                        "counterparty": e["address"], "relationship": e["relationship"], "hops": e["hops"], "usd": e["usd"],
                        "txs": e["txs"], "firstObserved": e["firstObserved"], "direction": e["direction"],
                        "source": e["source"], "sourceName": e["name"], "path": e["path"],
                    }
                    for e in items[:5]
                ],
            }
        )

    if behaviour["score"] > 0:
        pts = r1(P["behaviour"] * behaviour["score"] / 100)
        factors.append(
            {
                "id": "behaviour", "name": CAT_NAME["behaviour"], "points": pts, "max": P["behaviour"],
                "severity": _severity(pts, P["behaviour"]),
                "summary": "; ".join(s["title"] for s in behaviour["signals"]),
                "calc": f"{js_str(P['behaviour'])} max × {js_str(behaviour['score'])}/100 anomaly score = {js_str(pts)}",
                "evidence": [
                    {"signal": s["title"], "detail": s["detail"], "txs": s.get("txs") or [], "source": "Risk engine computation"}
                    for s in behaviour["signals"]
                ],
            }
        )

    factors.extend(fatf_factors(txs, labels, as_of, rules))

    risky = len(counterparties["risky"])
    if risky:
        pts = r1(P["counterparties"] * min(1, risky / 3))
        ev = []
        for a in counterparties["risky"][:5]:
            lab = labels(a) or {}
            ev.append({"counterparty": a, "label": lab.get("name"), "source": lab.get("source")})
        factors.append(
            {
                "id": "counterparties", "name": CAT_NAME["counterparties"], "points": pts, "max": P["counterparties"],
                "severity": _severity(pts, P["counterparties"]),
                "summary": f"{risky} direct counterpart{'ies are' if risky > 1 else 'y is'} labelled high-risk",
                "calc": f"{js_str(P['counterparties'])} max × min(1, {risky}/3) = {js_str(pts)}",
                "evidence": ev,
            }
        )

    # Cross-chain: bridge use after receiving risky funds, or a large share of volume through bridges.
    bridge_tx = [t for t in txs if (labels(t["cp"]) or {}).get("cat") == "bridge"]
    if bridge_tx:
        vol = js_sum(t.get("usd") or 0 for t in bridge_tx)
        share = vol / max(1, facts["inflowUsd"] + facts["outflowUsd"])
        after_risk = len(exposure) > 0
        pts = r1(P["crossChain"] * min(1, (0.6 if after_risk else 0) + share * 4))
        if pts > 0:
            factors.append(
                {
                    "id": "crossChain", "name": CAT_NAME["crossChain"], "points": pts, "max": P["crossChain"],
                    "severity": _severity(pts, P["crossChain"]),
                    "summary": f"{len(bridge_tx)} bridge transfer(s), {js_round(share * 100)}% of volume"
                    f"{', alongside risky exposure' if after_risk else ''}",
                    "calc": f"{js_str(P['crossChain'])} max × min(1, {'0.6 + ' if after_risk else ''}{to_fixed(share * 4, 2)}) = {js_str(pts)}",
                    "evidence": [
                        {"counterparty": t["cp"], "usd": js_round(t.get("usd") or 0), "txs": [t["hash"]], "source": "Workspace label: bridge"}
                        for t in bridge_tx[:5]
                    ],
                }
            )

    # New wallet moving large value.
    age_days = (parse_ms(as_of) - parse_ms(facts["firstSeen"])) / DAY_MS if facts["firstSeen"] else 0
    moved = facts["inflowUsd"] + facts["outflowUsd"]
    if age_days < 30 and moved > 50000:
        factors.append(
            {
                "id": "newWallet", "name": CAT_NAME["newWallet"], "points": P["newWallet"], "max": P["newWallet"],
                "severity": "Medium",
                "summary": f"{js_round(age_days)} days old with ${en_us(js_round(moved))} moved",
                "calc": f"{js_str(P['newWallet'])} points when age < 30 days and volume > $50,000",
                "evidence": [],
            }
        )

    factors.sort(key=lambda f: -f["points"])
    score = min(100, js_round(js_sum(f["points"] for f in factors)))
    floor = None
    crit = rules.bound("crit")
    if rules.sanctions_floor and score < crit:
        if own_cat == "sanctions":
            floor = f"Raised from {score} to {crit}: a wallet on a sanctions list is always Critical."
            score = crit
        elif any(e["cat"] == "sanctions" and e["hops"] == 1 for e in exposure):
            floor = f"Raised from {score} to {crit}: direct sanctions exposure is always Critical."
            score = crit
    return {"score": score, "tier": rules.tier_for(score), "factors": factors, "floor": floor, "version": rules.version}
