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
    tiers: tuple[int, ...]  # lower bound of each band above the lowest: Moderate, High, Critical (rule set 1-3)
    sanctions_floor: bool  # direct sanctions exposure always lands in Critical
    baseline_days: int
    recent_days: int
    # Reference ETH price when a transaction carries no USD value. None (rule set 2+): no guess; an
    # unpriced transfer counts as $0 in totals and is reported in the data-quality section.
    eth_usd: float | None
    # Band names from lowest to highest; len(bands) == len(tiers) + 1. Rule set 4 adds "elev" (Elevated).
    bands: tuple[str, ...] = ("low", "mod", "high", "crit")
    # Label category -> exposure factor. Categories not listed carry no exposure risk.
    risk_cats: Mapping[str, str] = field(default_factory=dict)
    # Label categories where exposure tracing stops (rule set 2+). A large service such as an exchange
    # or bridge is not a path: funds that passed through it are not exposure to everyone else it served.
    terminal_cats: frozenset[str] = frozenset()
    # Rule set 3+: score the wallet's own risk label (a sanctioned wallet with no counterparties is not 0).
    score_own_label: bool = False
    # Rule set 4: exposure older than this counts for less (half every this many days, never below half);
    # None = no decay.
    decay_half_life_days: float | None = None
    # Rule set 4: exposure is weighted by its share of the wallet's volume (a 0.1% trickle counts for less).
    share_weighting: bool = False
    # Rule set 4: each FATF red flag (pass-through, fan-out, just-under-limit, round amounts) is a factor.
    fatf_rules: bool = False

    def bound(self, band: str) -> int:
        """Lowest score in `band` (the Moderate bound, High bound, Critical bound ...)."""
        return self.tiers[self.bands.index(band) - 1]

    def band_rank(self, band: str) -> int:
        return self.bands.index(band)

    def tier_for(self, score: float) -> str:
        return self.bands[sum(1 for b in self.tiers if score >= b)]

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


TIER_NAME = MappingProxyType({"low": "Low", "mod": "Moderate", "elev": "Elevated", "high": "High", "crit": "Critical"})
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
        "passThrough": "Rapid pass-through (FATF layering)",
        "fanBurst": "Fan-out / fan-in burst",
        "structuring": "Amounts just under reporting limits",
        "roundAmounts": "Round-amount transfers",
    }
)
EXPOSURE_FACTORS = ("sanctions", "mixer", "ransomware", "scam")
FATF_FACTORS = ("passThrough", "fanBurst", "structuring", "roundAmounts")

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
# Rule set 4: five bands, decay and share-weighted exposure, FATF red flags as rules. Points for the
# original factors are unchanged; the four FATF factors are new. Adopt only after a back-test against
# rule set 3 on reviewed cases (backtest.py): a new version never replaces an old one.
RULESET_V4 = replace(
    RULESET_V3,
    version=4,
    points=MappingProxyType({
        **RULESET_V3.points,
        "passThrough": 6, "fanBurst": 4, "structuring": 4, "roundAmounts": 2,
    }),
    tiers=(20, 40, 60, 80),
    bands=("low", "mod", "elev", "high", "crit"),
    decay_half_life_days=365,
    share_weighting=True,
    fatf_rules=True,
)
RULESETS = MappingProxyType({1: RULESET_V1, 2: RULESET_V2, 3: RULESET_V3, 4: RULESET_V4})
