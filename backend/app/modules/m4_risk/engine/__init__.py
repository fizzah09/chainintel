"""Wallet risk engine: Python port of the prototype in src/engine/ (rule set 1).

Entry point: `assess_from_data`. Pure functions only; M4.2 feeds them from M3's stored data.
"""

from app.modules.m4_risk.engine.assess import assess_from_data
from app.modules.m4_risk.engine.classifier import Model, load_model, predict_illicit
from app.modules.m4_risk.engine.config import RULESET_V1, RULESET_V2, RULESETS, TIER_NAME, RuleSet

__all__ = ["RULESET_V1", "RULESET_V2", "RULESETS", "TIER_NAME", "Model", "RuleSet", "assess_from_data", "load_model", "predict_illicit"]
