"""Basic checks for the feature code. Run with:  pytest tests/"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from features import FEATURE_NAMES, compute  # noqa: E402

ME = "0x" + "a" * 40
OTHER = "0x" + "b" * 40


def tx(frm, to, ts, wei=10 ** 18, ok=True, call=False):
    return {"ts": ts, "from": frm, "to": to, "value_wei": wei, "contract_call": call, "ok": ok}


def test_abstains_below_minimum_history():
    txs = [tx(ME, OTHER, "2026-01-01T00:00:00Z") for _ in range(3)]
    assert compute(ME, txs) is None


def test_counts_and_values():
    txs = [
        tx(ME, OTHER, "2026-01-01T00:00:00Z", wei=2 * 10 ** 18),
        tx(OTHER, ME, "2026-01-01T01:00:00Z", wei=3 * 10 ** 18),
        tx(ME, OTHER, "2026-01-02T00:00:00Z", ok=False, call=True),
        tx(OTHER, ME, "2026-01-03T00:00:00Z"),
        tx(OTHER, ME, "2026-01-04T00:00:00Z"),
    ]
    f = compute(ME, txs)
    assert set(FEATURE_NAMES) == set(f)
    assert f["n_tx"] == 5 and f["n_sent"] == 2 and f["n_recv"] == 3
    assert abs(f["eth_sent_total"] - 3.0) < 1e-9
    assert abs(f["eth_recv_total"] - 5.0) < 1e-9
    assert abs(f["failed_share"] - 0.2) < 1e-9
    assert abs(f["contract_call_share"] - 0.2) < 1e-9
    assert f["uniq_recv_from"] == 1
