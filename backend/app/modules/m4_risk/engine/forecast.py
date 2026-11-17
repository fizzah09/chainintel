"""Risk trend forecast (port of src/engine/forecast.js).

Damped Holt trend on the wallet's logical score re-computed at weekly cut-offs. The interval widens
with the horizon using the spread of one-step-ahead errors. Output: next 4 weeks (about 30 days).
"""

import math

from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.engine.jscompat import DAY_MS, js_round, js_str, js_sum, parse_ms, to_iso


def _norm_cdf(z: float) -> float:
    """Abramowitz-Stegun approximation, as in the prototype."""
    t = 1 / (1 + 0.2316419 * abs(z))
    d = 0.3989423 * math.exp(-z * z / 2)
    p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return 1 - p if z > 0 else p


def forecast_scores(
    history: list[dict], rules: RuleSet, alpha: float = 0.5, beta: float = 0.3, phi: float = 0.85, horizon: int = 4
) -> dict:
    ys = [h["score"] for h in history]
    if len(ys) < 3:
        return {"history": history, "forecast": [], "trend": "insufficient data", "projected30": None, "chanceHigh": None}
    level, trend = ys[0], ys[1] - ys[0]
    errs = []
    for i in range(1, len(ys)):
        pred = level + phi * trend
        errs.append(ys[i] - pred)
        prev_level = level
        level = alpha * ys[i] + (1 - alpha) * (level + phi * trend)
        trend = beta * (level - prev_level) + (1 - beta) * phi * trend
    sigma = max(4, math.sqrt(js_sum(e * e for e in errs) / len(errs)))
    last = parse_ms(history[-1]["date"])

    def clamp(v: float) -> float:
        return max(0, min(100, v))

    def damp(h: int) -> float:
        s = 0
        for k in range(1, h + 1):
            s += phi**k
        return s

    forecast = []
    for h in range(1, horizon + 1):
        mid = level + damp(h) * trend
        w = 1.645 * sigma * math.sqrt(h)  # ~90% interval
        forecast.append(
            {
                "date": to_iso(last + h * 7 * DAY_MS)[:10],
                "score": js_round(clamp(mid)),
                "lo": js_round(clamp(mid - w)),
                "hi": js_round(clamp(mid + w)),
            }
        )
    end = forecast[-1]
    delta = end["score"] - ys[-1]
    # Chance the score is High or above in about 30 days (normal approximation).
    z = (rules.tiers[1] - (level + damp(horizon) * trend)) / (sigma * math.sqrt(horizon))
    return {
        "history": history,
        "forecast": forecast,
        "trend": "Rising" if delta >= 5 else "Falling" if delta <= -5 else "Stable",
        "projected30": end["score"],
        "delta": delta,
        "chanceHigh": 1 - _norm_cdf(z),
        "sigma": js_round(sigma * 10) / 10,
        "method": f"Damped Holt trend (alpha {js_str(alpha)}, beta {js_str(beta)}, damping {js_str(phi)}) on {len(ys)} weekly scores",
    }
