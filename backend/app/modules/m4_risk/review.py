"""When an assessment needs a person. The rules alone decide the score and tier; nothing here changes
them. These flags route the assessment to manual review and say why, in plain language."""

from app.core.config import Settings
from app.modules.m4_risk.engine.config import RuleSet

def review_reasons(report: dict, data_quality: dict, model_status: str, rules: RuleSet, settings: Settings) -> list[str]:
    reasons: list[str] = []
    p = report["ml"]["probability"]
    pct = round(p * 100)
    rules_high = rules.band_rank(report["tier"]) >= rules.band_rank("high")
    ml_high = p >= 0.5
    if ml_high and not rules_high:
        reasons.append(
            f"Model estimates {pct}% illicit probability but the rules score is {report['score']} ({report['tierName']}). "
            "The rules decide the score; an analyst should check what the model is reacting to."
        )
    elif rules_high and not ml_high:
        reasons.append(
            f"Rules score {report['score']} ({report['tierName']}) but the model sees typical behaviour ({pct}%). "
            "Confirm the exposure evidence before acting."
        )
    entity = report.get("entity") or {}
    if entity.get("type") in rules.risk_cats and not rules.score_own_label:
        reasons.append(
            f"The wallet itself is labelled '{entity['type']}' ({entity.get('label')}, source: {entity.get('source')}). "
            "Rule set 2 scores counterparty exposure only, so check this label directly."
        )
    if model_status != "approved":
        reasons.append("The model used has not been validated and approved for production use.")
    if data_quality.get("stale"):
        reasons.append("The latest data refresh failed; the assessment used stored data.")
    total, unpriced = data_quality.get("transfers", 0), data_quality.get("unpriced", 0)
    if total and unpriced / total > settings.review_unpriced_share:
        reasons.append(f"{unpriced} of {total} transfers have no USD price, so amount-based rules may understate risk.")
    return reasons
