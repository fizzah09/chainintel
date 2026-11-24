"""Full assessment from transaction data (port of assessFromData in src/engine/index.js).

Pure: no I/O. Inputs are the transactions, graph edges, an as-of time, a label lookup, a rule set
and a model. The same inputs, rule set and model always give the same report. The report keeps the
prototype's field names (camelCase) so the frontend contract does not change.
"""

from app.modules.m4_risk.engine.anomaly import analyse_behaviour
from app.modules.m4_risk.engine.classifier import Model, load_model, predict_illicit
from app.modules.m4_risk.engine.config import RULESET_V1, TIER_NAME, LabelLookup, RuleSet
from app.modules.m4_risk.engine.confidence import assess_confidence
from app.modules.m4_risk.engine.exposure import compute_exposure, counterparty_mix
from app.modules.m4_risk.engine.features import compute_features, profile_facts
from app.modules.m4_risk.engine.forecast import forecast_scores
from app.modules.m4_risk.engine.jscompat import DAY_MS, parse_ms, to_iso
from app.modules.m4_risk.engine.rules import score_rules

WEEK_MS = 7 * DAY_MS


def _rules_at(address: str, txs: list[dict], edges: list[dict], as_of: str, labels: LabelLookup, rules: RuleSet) -> dict:
    """Logical score only, at a point in time. Feeds the weekly history behind the forecast."""
    cut = parse_ms(as_of)
    t = [x for x in txs if parse_ms(x["time"]) <= cut]
    facts = profile_facts(t, address, rules)
    return score_rules(
        exposure=compute_exposure(address, edges, as_of, labels, rules),
        behaviour=analyse_behaviour(t, as_of, rules),
        counterparties=counterparty_mix(address, t, labels, rules),
        facts=facts, txs=t, as_of=as_of, labels=labels, rules=rules, address=address,
    )


def assess_from_data(
    *,
    address: str,
    txs: list[dict],
    edges: list[dict],
    as_of: str,
    mode: str,
    labels: LabelLookup,
    rules: RuleSet = RULESET_V1,
    model: Model | None = None,
    with_forecast: bool = True,
    data_quality: dict | None = None,
) -> dict:
    model = model or load_model()
    facts = profile_facts(txs, address, rules)
    exposure = compute_exposure(address, edges, as_of, labels, rules)
    behaviour = analyse_behaviour(txs, as_of, rules)
    counterparties = counterparty_mix(address, txs, labels, rules)
    rules_result = score_rules(
        exposure=exposure, behaviour=behaviour, counterparties=counterparties, facts=facts, txs=txs, as_of=as_of,
        labels=labels, rules=rules, address=address,
    )
    features = compute_features(txs)
    ml = predict_illicit(features, model)
    forecast = None
    if with_forecast:
        history = []
        for k in range(11, 0, -1):
            at = to_iso(parse_ms(as_of) - k * WEEK_MS)
            history.append({"date": at[:10], "score": _rules_at(address, txs, edges, at, labels, rules)["score"]})
        history.append({"date": as_of[:10], "score": rules_result["score"]})
        forecast = forecast_scores(history, rules)
    confidence = assess_confidence(
        mode=mode, facts=facts, exposure=exposure, rules_result=rules_result, ml=ml, data_quality=data_quality
    )
    own = labels(address)
    if own:
        conf = own.get("confidence")
        entity = {"type": own["cat"], "label": own.get("name"), "confidence": 0.9 if conf is None else conf, "source": own.get("source")}
    else:
        entity = {"type": "unknown", "label": "Unknown wallet", "confidence": None, "source": "No public label"}
    report = {
        "address": address,
        "asOf": as_of,
        "mode": mode,
        "engineVersion": rules.version,
        "modelVersion": model.version,
        "modelSha256": model.sha256,
        "score": rules_result["score"],
        "tier": rules_result["tier"],
        "tierName": TIER_NAME[rules_result["tier"]],
        "floor": rules_result["floor"],
        "factors": rules_result["factors"],
        "exposure": exposure,
        "behaviour": behaviour,
        "counterparties": counterparties,
        "facts": facts,
        "features": features,
        "ml": ml,
        "forecast": forecast,
        "confidence": confidence,
        "entity": entity,
        "recentTxHashes": [t["hash"] for t in reversed(txs[-60:])],
    }
    if data_quality is not None:
        report["dataQuality"] = data_quality
    return report
