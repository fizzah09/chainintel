"""Wallet features from a list of simplified transactions (see blockscout._simplify).

The same function is used for training and for scoring, so the model sees identical inputs.
"""
from datetime import datetime

from config import MIN_TX

WEI = 10 ** 18
FEATURE_NAMES = [
    "n_tx", "n_sent", "n_recv", "span_days",
    "mean_gap_sent_min", "mean_gap_recv_min",
    "uniq_sent_to", "uniq_recv_from",
    "eth_sent_total", "eth_recv_total", "eth_sent_max", "eth_recv_max",
    "contract_call_share", "failed_share", "recv_to_sent_ratio",
]


def _ts(s: str) -> float:
    return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()


def _mean_gap_min(times: list[float]) -> float:
    if len(times) < 2:
        return 0.0
    times = sorted(times)
    gaps = [(b - a) / 60 for a, b in zip(times, times[1:])]
    return sum(gaps) / len(gaps)


def compute(address: str, txs: list[dict]) -> dict | None:
    """Return the feature dict, or None when there is too little history (the model abstains)."""
    if len(txs) < MIN_TX:
        return None
    me = address.lower()
    sent = [t for t in txs if t["from"] == me]
    recv = [t for t in txs if t["to"] == me]
    all_t = [_ts(t["ts"]) for t in txs if t.get("ts")]
    span = (max(all_t) - min(all_t)) / 86400 if all_t else 0.0
    sent_t = [_ts(t["ts"]) for t in sent if t.get("ts")]
    recv_t = [_ts(t["ts"]) for t in recv if t.get("ts")]
    eth_sent = [t["value_wei"] / WEI for t in sent]
    eth_recv = [t["value_wei"] / WEI for t in recv]
    n = len(txs)
    return {
        "n_tx": n,
        "n_sent": len(sent),
        "n_recv": len(recv),
        "span_days": span,
        "mean_gap_sent_min": _mean_gap_min(sent_t),
        "mean_gap_recv_min": _mean_gap_min(recv_t),
        "uniq_sent_to": len({t["to"] for t in sent}),
        "uniq_recv_from": len({t["from"] for t in recv}),
        "eth_sent_total": sum(eth_sent),
        "eth_recv_total": sum(eth_recv),
        "eth_sent_max": max(eth_sent, default=0.0),
        "eth_recv_max": max(eth_recv, default=0.0),
        "contract_call_share": sum(t["contract_call"] for t in txs) / n,
        "failed_share": sum(not t["ok"] for t in txs) / n,
        "recv_to_sent_ratio": len(recv) / (len(sent) + 1),
    }
