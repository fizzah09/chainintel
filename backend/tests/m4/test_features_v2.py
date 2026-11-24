"""R4 feature set v2 (pure, offline): every number here is worked out by hand from the transactions."""

from datetime import UTC, datetime, timedelta

from app.modules.m4_risk.features_v2 import FEATURE_SET_V2, v2_features

AS_OF = datetime(2026, 11, 17, 12, 0, tzinfo=UTC)
RISK_CATS = {"sanctions", "mixer"}
ME, A, B, C, RISKY = "0x" + "1" * 40, "0x" + "2" * 40, "0x" + "3" * 40, "0x" + "4" * 40, "0x" + "5" * 40


def at(days_before: float = 0, hours_after: float = 0) -> str:
    t = AS_OF - timedelta(days=days_before) + timedelta(hours=hours_after)
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")


def tx(dir_: str, cp: str, usd: float | None, when: str) -> dict:
    return {"dir": dir_, "cp": cp, "usd": usd, "time": when, "sym": "ETH", "value": 1.0, "hash": when + cp}


def feats(txs, labels=None):
    f, q = v2_features(txs, labels or {}, AS_OF.strftime("%Y-%m-%dT%H:%M:%SZ"), RISK_CATS)
    return f, q


def test_windows_include_only_what_falls_inside_them():
    f, _ = feats([tx("in", A, 100.0, at(10)), tx("in", B, 50.0, at(200))])
    assert (f["w30_tx_count"], f["w90_tx_count"], f["w180_tx_count"], f["w365_tx_count"]) == (1, 1, 1, 2)
    assert f["w30_unique_counterparties"] == 1 and f["w365_volume_usd"] == 150.0
    assert f["age_days"] == 200.0 and f["days_since_last_tx"] == 10.0


def test_pass_through_ratio_and_rapid_forwarding():
    # 1000 comes in, 900 goes out an hour later: 90% is forwarded within 24 hours.
    f, _ = feats([tx("in", A, 1000.0, at(2)), tx("out", B, 900.0, at(2, hours_after=1))])
    assert f["rapid_pass_through_share"] == 0.9
    assert f["w30_pass_through_ratio"] == 0.9


def test_money_forwarded_after_a_day_is_not_rapid_pass_through():
    f, _ = feats([tx("in", A, 1000.0, at(5)), tx("out", B, 1000.0, at(3))])
    assert f["rapid_pass_through_share"] == 0.0


def test_round_amounts_are_counted_within_a_dollar():
    f, _ = feats([tx("in", A, 5000.0, at(1)), tx("in", A, 4321.0, at(2)), tx("in", A, 7777.0, at(3))])
    assert round(f["round_amount_share"], 6) == round(1 / 3, 6)


def test_just_under_reporting_limits():
    f, _ = feats([tx("in", A, 9500.0, at(1)), tx("in", A, 10000.0, at(2)), tx("in", A, 4000.0, at(3))])
    assert round(f["just_under_limit_share"], 6) == round(1 / 3, 6)  # 10000 is at the limit, not under it


def test_fan_out_burst_counts_distinct_recipients_in_one_day():
    txs = [tx("out", A, 10.0, at(1)), tx("out", B, 10.0, at(1, 1)), tx("out", C, 10.0, at(1, 2)),
           tx("out", A, 10.0, at(1, 3)), tx("out", A, 10.0, at(4))]
    f, _ = feats(txs)
    assert f["fan_out_24h_max"] == 3 and f["fan_in_24h_max"] == 0


def test_exposure_to_labelled_risky_counterparties():
    labels = {RISKY: {"cat": "sanctions"}}
    f, _ = feats([tx("in", RISKY, 100.0, at(1)), tx("in", A, 300.0, at(2)), tx("out", RISKY, 50.0, at(3))], labels)
    assert f["risky_in_volume_share"] == 0.25 and f["risky_out_volume_share"] == 1.0
    assert f["risky_counterparties"] == 1


def test_unpriced_transactions_are_left_out_of_usd_features_and_reported():
    f, q = feats([tx("in", A, 100.0, at(1)), tx("in", A, None, at(2))])
    assert f["w30_volume_usd"] == 100.0 and f["round_amount_share"] == 1.0  # 100 is round; the unpriced one is ignored
    assert q["usd_priced_share"] == 0.5 and q["unpriced_transactions"] == 1


def test_empty_wallet_is_all_zero_and_named_as_v2():
    f, q = feats([])
    assert set(f.values()) == {0.0} and q["transactions"] == 0 and q["usd_priced_share"] == 0.0
    assert FEATURE_SET_V2 == "wallet-features-v2"


def test_only_transactions_known_at_as_of_count():
    later = tx("in", A, 999.0, at(-2))  # two days after the knowledge time
    f, q = feats([later])
    assert f["w30_tx_count"] == 0 and q["transactions"] == 0
