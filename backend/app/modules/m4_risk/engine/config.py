"""Rule set: the engine's tunable settings, versioned and immutable.

Rule set 1 is the JavaScript prototype's ENGINE config (src/engine/config.js), unchanged. Points are
illustrative until back-tested on reviewed cases. A new rule set is a new frozen object with a new
version, never an edit of an old one, so every past score names exactly the settings it used.
"""

from collections.abc import Mapping
from dataclasses import dataclass, field, replace
from types import MappingProxyType
from typing import Any, Callable

Label = Mapping[str, Any]  # {cat, name, source, confidence?}
LabelLookup = Callable[[str], Label | None]


@dataclass(frozen=True)
class RuleSet:
    version: int
    points: Mapping[str, float]  # maximum points per factor
    hop_decay: tuple[float, ...]  # multiplier by distance; index 0 = direct counterparty
    max_hops: int
    full_amount_usd: float  # exposure at which a factor reaches full points (never below 40%)
    tiers: tuple[int, int, int]  # lower bounds of Moderate, High, Critical
    sanctions_floor: bool  # direct sanctions exposure always lands in Critical
    baseline_days: int
    recent_days: int
    # Reference ETH price when a transaction carries no USD value. None (rule set 2+): no guess; an
    # unpriced transfer counts as $0 in totals and is reported in the data-quality section.
    eth_usd: float | None
    # Label category -> exposure factor. Categories not listed carry no exposure risk.
    risk_cats: Mapping[str, str] = field(default_factory=dict)
    # Label categories where exposure tracing stops (rule set 2+). A large service such as an exchange
    # or bridge is not a path: funds that passed through it are not exposure to everyone else it served.
    terminal_cats: frozenset[str] = frozenset()
    # Rule set 3+: score the wallet's own risk label (a sanctioned wallet with no counterparties is not 0).
    score_own_label: bool = False

    def tier_for(self, score: float) -> str:
        t = self.tiers
        return "low" if score < t[0] else "mod" if score < t[1] else "high" if score < t[2] else "crit"

    def as_dict(self) -> dict:
        """JS-shaped config, as exported by the prototype (used to prove rule set 1 matches)."""
        return {
            "version": self.version,
            "points": dict(self.points),
            "hopDecay": list(self.hop_decay),
            "maxHops": self.max_hops,
            "fullAmountUsd": self.full_amount_usd,
            "tiers": list(self.tiers),
            "sanctionsFloor": self.sanctions_floor,
            "baselineDays": self.baseline_days,
            "recentDays": self.recent_days,
        }


TIER_NAME = MappingProxyType({"low": "Low", "mod": "Moderate", "high": "High", "crit": "Critical"})
CAT_NAME = MappingProxyType(
    {
        "sanctions": "Sanctions exposure",
        "mixer": "Mixer exposure",
        "ransomware": "Ransomware exposure",
        "scam": "Scam / fraud exposure",
        "behaviour": "Behavioural anomaly",
        "counterparties": "Suspicious counterparties",
        "crossChain": "Cross-chain movement",
        "newWallet": "New wallet, high value",
    }
)
EXPOSURE_FACTORS = ("sanctions", "mixer", "ransomware", "scam")

RULESET_V1 = RuleSet(
    version=1,
    points=MappingProxyType(
        {"sanctions": 35, "mixer": 20, "ransomware": 15, "scam": 15, "behaviour": 10, "counterparties": 5, "crossChain": 5, "newWallet": 5}
    ),
    hop_decay=(1, 0.5, 0.25),
    max_hops=3,
    full_amount_usd=10000,
    tiers=(25, 50, 75),
    sanctions_floor=True,
    baseline_days=90,
    recent_days=7,
    eth_usd=3000,
    risk_cats=MappingProxyType({"sanctions": "sanctions", "mixer": "mixer", "ransomware": "ransomware", "scam": "scam", "darknet": "scam"}),
)


RULESET_V2 = replace(
    RULESET_V1,
    version=2,
    # Prices come from M3's price store (Chainlink, then CoinGecko); no fixed reference price.
    eth_usd=None,
    # M3 label categories: phishing and hack proceeds count as scam / fraud exposure.
    risk_cats=MappingProxyType({**RULESET_V1.risk_cats, "phishing": "scam", "hack": "scam"}),
    terminal_cats=frozenset({"exchange", "bridge", "defi", "service"}),
)
RULESET_V3 = replace(RULESET_V2, version=3, score_own_label=True)
RULESETS = MappingProxyType({1: RULESET_V1, 2: RULESET_V2, 3: RULESET_V3})
