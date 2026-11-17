"""Confidence in the assessment (port of src/engine/confidence.js): how much the evidence supports
the score, separate from how high the score is."""

from app.modules.m4_risk.engine.config import EXPOSURE_FACTORS
from app.modules.m4_risk.engine.jscompat import js_round, js_sum


def assess_confidence(
    *, mode: str, facts: dict, exposure: list[dict], rules_result: dict, ml: dict, data_quality: dict | None = None
) -> dict:
    parts: list[dict] = []

    def add(name: str, value: float, note: str) -> None:
        parts.append({"name": name, "value": js_round(value * 100), "note": note})

    live = mode == "live"
    add("Data source", 1 if live else 0.6, "Live blockchain data" if live else "Simulated history (no API key set)")
    add("History depth", min(1, facts["transactions"] / 100), f"{facts['transactions']} transactions analysed")
    top = next((f for f in rules_result["factors"] if f["id"] in EXPOSURE_FACTORS), None)
    if top:
        e = next((x for x in exposure if x["cat"] == top["id"]), None)
        add("Label reliability", 0.8 if e is None or e.get("labelConfidence") is None else e["labelConfidence"],
            (e or {}).get("source") or "Workspace label")
        add("Path certainty", [1, 0.8, 0.6][e["hops"] - 1] if e else 0.7, f"{e['relationship']} link" if e else "")
    if data_quality is not None:
        total = data_quality["transfers"]
        priced = total - data_quality["unpriced"]
        add("Price coverage", priced / total if total else 1, f"{priced} of {total} transfers priced in USD")
        if data_quality.get("stale"):
            add("Data freshness", 0.5, "Latest provider refresh failed; stored data used")
    rules_high = rules_result["score"] >= 50
    ml_high = ml["probability"] >= 0.5
    agree = rules_high == ml_high
    add("Model agreement", 1 if agree else 0.55, "Rules and model agree" if agree else "Rules and model disagree; review manually")
    value = js_round(js_sum(p["value"] for p in parts) / len(parts))
    return {"value": value, "parts": parts, "label": "High" if value >= 80 else "Medium" if value >= 60 else "Low"}
