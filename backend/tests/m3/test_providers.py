"""Offline tests for M3 providers: every HTTP call is answered by a fake transport. No keys, no network."""

import json
from datetime import UTC, datetime

import httpx
import pytest
from pydantic import SecretStr

from app.core.config import Settings
from app.modules.m3_data.providers.alchemy import AlchemyProvider
from app.modules.m3_data.providers.base import (
    AuthError,
    ProviderError,
    RateLimitedError,
    TransferKind,
    TransientError,
    UnsupportedChainError,
    normalize_address,
)
from app.modules.m3_data.providers.etherscan import EtherscanProvider
from app.modules.m3_data.providers.factory import build_router
from app.modules.m3_data.providers.resilience import RetryPolicy, TokenBucket
from app.modules.m3_data.providers.router import ProviderRouter

WALLET = "0x" + "a" * 40
OTHER = "0x" + "b" * 40
TOKEN = "0x" + "c" * 40
KEY = "SECRET-KEY-123"
FETCHED = datetime(2026, 11, 17, 12, 0, tzinfo=UTC)


class FakeClock:
    def __init__(self):
        self.t = 0.0
        self.sleeps: list[float] = []

    def time(self) -> float:
        return self.t

    def sleep(self, s: float) -> None:
        self.sleeps.append(s)
        self.t += s


def make_client(handler):
    calls: list[httpx.Request] = []

    def wrapped(req: httpx.Request) -> httpx.Response:
        calls.append(req)
        return handler(req, len(calls))

    return httpx.Client(transport=httpx.MockTransport(wrapped)), calls


def etherscan(handler, **kw):
    client, calls = make_client(handler)
    clock = FakeClock()
    p = EtherscanProvider(
        KEY,
        client,
        TokenBucket(1000, clock=clock.time, sleep=clock.sleep),
        RetryPolicy(max_attempts=3, sleep=clock.sleep, rand=lambda: 1.0),
        clock=lambda: FETCHED,
        **kw,
    )
    return p, calls, clock


def alchemy(handler, **kw):
    client, calls = make_client(handler)
    clock = FakeClock()
    p = AlchemyProvider(
        KEY,
        client,
        TokenBucket(1000, clock=clock.time, sleep=clock.sleep),
        RetryPolicy(max_attempts=3, sleep=clock.sleep, rand=lambda: 1.0),
        clock=lambda: FETCHED,
        url_template="https://{network}.alchemy.test/v2/{key}",
        **kw,
    )
    return p, calls, clock


def ok(rows):
    return httpx.Response(200, json={"status": "1", "message": "OK", "result": rows})


def row(block, tx, **kw):
    base = {
        "blockNumber": str(block),
        "timeStamp": "1700000000",
        "hash": tx,
        "from": WALLET.upper().replace("0X", "0x"),
        "to": OTHER,
        "value": "1",
        "isError": "0",
    }
    return base | kw


# ---- Etherscan ------------------------------------------------------------------------------------


def test_etherscan_native_parsing_keeps_exact_amounts():
    huge = str(10**30 + 1)  # would lose digits as a float
    rows = [
        row(10, "0xAA", value=huge),
        row(11, "0xbb", isError="1"),
        row(12, "0xcc", to="", contractAddress=TOKEN),  # contract creation
    ]
    p, calls, _ = etherscan(lambda req, n: ok(rows))
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)

    assert page.complete
    a, b, c = page.items
    assert a.value_raw == 10**30 + 1
    assert a.tx_hash == "0xaa" and a.from_address == WALLET
    assert a.block_time == datetime.fromtimestamp(1700000000, UTC)
    assert a.provider == "etherscan" and a.fetched_at == FETCHED
    assert a.success is True and b.success is False
    assert c.to_address == TOKEN
    params = calls[0].url.params
    assert params["action"] == "txlist" and params["sort"] == "asc" and params["chainid"] == "1"


def test_etherscan_no_transactions_is_empty_not_error():
    p, _, _ = etherscan(lambda req, n: httpx.Response(200, json={"status": "0", "message": "No transactions found", "result": []}))
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert page.items == [] and page.complete


def test_etherscan_rate_limit_in_body_is_retried():
    def handler(req, n):
        if n <= 2:
            return httpx.Response(200, json={"status": "0", "message": "NOTOK", "result": "Max rate limit reached"})
        return ok([row(1, "0x01")])

    p, calls, clock = etherscan(handler)
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert len(page.items) == 1 and len(calls) == 3
    assert clock.sleeps == [0.5, 1.0]  # exponential back-off (rand pinned to 1.0)


def test_etherscan_invalid_key_fails_fast_without_leaking_key():
    p, calls, _ = etherscan(lambda req, n: httpx.Response(200, json={"status": "0", "message": "NOTOK", "result": "Invalid API Key"}))
    with pytest.raises(AuthError) as exc:
        p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert len(calls) == 1
    assert KEY not in str(exc.value)


def test_etherscan_server_errors_and_html_pages_are_retried_then_raised():
    p, calls, _ = etherscan(lambda req, n: httpx.Response(502, text="<html>Bad gateway</html>"))
    with pytest.raises(TransientError):
        p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert len(calls) == 3

    p, calls, _ = etherscan(lambda req, n: httpx.Response(200, text="<html>Cloudflare</html>") if n == 1 else ok([]))
    assert p.transfers(WALLET, 1, TransferKind.NATIVE).complete and len(calls) == 2


def test_etherscan_network_error_is_retried():
    def handler(req, n):
        if n == 1:
            raise httpx.ConnectError("connection refused", request=req)
        return ok([])

    p, calls, _ = etherscan(handler)
    assert p.transfers(WALLET, 1, TransferKind.NATIVE).complete and len(calls) == 2


def test_etherscan_pages_by_block_without_losing_or_duplicating_boundary_rows():
    # Page size 3. Block 12 holds two rows; the first page cuts through it.
    pages = {
        "0": [row(10, "0x10"), row(11, "0x11"), row(12, "0x12a")],
        "12": [row(12, "0x12a"), row(12, "0x12b"), row(13, "0x13")],
        "13": [row(13, "0x13")],
    }
    p, calls, _ = etherscan(lambda req, n: ok(pages[req.url.params["startblock"]]), page_size=3)
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert [t.tx_hash for t in page.items] == ["0x10", "0x11", "0x12a", "0x12b", "0x13"]
    assert page.complete
    assert [c.url.params["startblock"] for c in calls] == ["0", "12", "13"]


def test_etherscan_internal_boundary_block_keeps_occurrence_numbers_stable():
    same = dict(type="call", value="5")
    pages = {
        "0": [row(1, "0x01", **same), row(2, "0x02", **same)],
        "2": [row(2, "0x02", **same), row(2, "0x02", **same)],  # identical internal moves in one tx
    }
    p, _, _ = etherscan(lambda req, n: ok(pages[req.url.params["startblock"]]), page_size=2)
    # Page 2 is full, ends in block 2 == start: stops with complete=False instead of looping forever.
    page = p.transfers(WALLET, 1, TransferKind.INTERNAL)
    assert not page.complete and "more than 2 rows" in page.note
    subs = [t.sub_id for t in page.items if t.tx_hash == "0x02"]
    assert subs == [f"{WALLET}>{OTHER}:5#0", f"{WALLET}>{OTHER}:5#1"]


def test_etherscan_stops_at_page_cap_and_says_so():
    def handler(req, n):
        s = int(req.url.params["startblock"])
        return ok([row(s, f"0x{s}a"), row(s + 1, f"0x{s}b")])

    p, calls, _ = etherscan(handler, page_size=2, max_pages=3)
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert not page.complete and len(calls) == 3 and "3 pages" in page.note


def test_etherscan_token_rows_use_log_index_and_decimals():
    rows = [
        row(5, "0x05", contractAddress=TOKEN.upper().replace("0X", "0x"), tokenSymbol="USDC", tokenDecimal="6", value="2500000", logIndex="7"),
        row(5, "0x05", contractAddress=TOKEN, tokenSymbol="USDC", tokenDecimal="6", value="1", logIndex="0x8"),
    ]
    p, _, _ = etherscan(lambda req, n: ok(rows))
    a, b = p.transfers(WALLET, 1, TransferKind.ERC20).items
    assert (a.sub_id, b.sub_id) == ("log:7", "log:8")
    assert a.token_address == TOKEN and a.token_decimals == 6 and a.value_raw == 2_500_000


def test_etherscan_unsupported_chain_and_bad_address():
    p, calls, _ = etherscan(lambda req, n: ok([]))
    with pytest.raises(UnsupportedChainError):
        p.transfers(WALLET, 999, TransferKind.NATIVE)
    with pytest.raises(ValueError):
        p.transfers("0x123", 1, TransferKind.NATIVE)
    assert calls == []


def test_etherscan_latest_block():
    p, _, _ = etherscan(lambda req, n: httpx.Response(200, json={"jsonrpc": "2.0", "id": 1, "result": "0x10"}))
    assert p.latest_block(1) == 16


# ---- Alchemy --------------------------------------------------------------------------------------


def alchemy_transfer(block, tx, frm, to, value_hex, unique, category="external", token=None, decimal="0x12"):
    return {
        "blockNum": hex(block),
        "uniqueId": unique,
        "hash": tx,
        "from": frm,
        "to": to,
        "value": 0.1,  # float from Alchemy: ignored on purpose
        "asset": "USDC" if token else "ETH",
        "category": category,
        "rawContract": {"value": value_hex, "address": token, "decimal": decimal},
        "metadata": {"blockTimestamp": "2023-11-14T22:13:20.000Z"},
    }


def test_alchemy_queries_both_directions_pages_and_dedupes_self_transfers():
    def handler(req, n):
        body = json.loads(req.content)
        p = body["params"][0]
        if "fromAddress" in p:
            if "pageKey" not in p:
                return httpx.Response(200, json={"result": {"transfers": [alchemy_transfer(1, "0x01", WALLET, OTHER, "0xde0b6b3a7640000", "0x01:external")], "pageKey": "k2"}})
            return httpx.Response(200, json={"result": {"transfers": [alchemy_transfer(3, "0x03", WALLET, WALLET, "0x1", "0x03:external")]}})
        return httpx.Response(200, json={"result": {"transfers": [
            alchemy_transfer(2, "0x02", OTHER, WALLET, "0x2", "0x02:external"),
            alchemy_transfer(3, "0x03", WALLET, WALLET, "0x1", "0x03:external"),
        ]}})

    p, calls, _ = alchemy(handler)
    page = p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert [t.tx_hash for t in page.items] == ["0x01", "0x02", "0x03"]
    assert page.items[0].value_raw == 10**18 and page.items[0].success is None
    assert page.items[0].block_time == datetime(2023, 11, 14, 22, 13, 20, tzinfo=UTC)
    assert page.complete and len(calls) == 3
    assert "eth-mainnet.alchemy.test" in str(calls[0].url)


def test_alchemy_token_log_index_and_decimals():
    t = alchemy_transfer(9, "0x09", OTHER, WALLET, "0x2625a0", "0x09:log:4", category="erc20", token=TOKEN, decimal="0x6")

    def handler(req, n):
        p = json.loads(req.content)["params"][0]
        return httpx.Response(200, json={"result": {"transfers": [t] if "toAddress" in p else []}})

    p, _, _ = alchemy(handler)
    (item,) = p.transfers(WALLET, 1, TransferKind.ERC20).items
    assert item.sub_id == "log:4" and item.token_decimals == 6 and item.value_raw == 2_500_000


def test_alchemy_rpc_rate_limit_is_retried_and_errors_hide_key():
    def handler(req, n):
        if n == 1:
            return httpx.Response(200, json={"error": {"code": 429, "message": "Your app has exceeded its compute units per second capacity"}})
        return httpx.Response(500, text="boom")

    p, calls, _ = alchemy(handler)
    with pytest.raises(TransientError) as exc:
        p.transfers(WALLET, 1, TransferKind.NATIVE)
    assert len(calls) == 3
    assert KEY not in str(exc.value) and "alchemy.test" not in str(exc.value)


def test_alchemy_internal_only_on_mainnets():
    p, _, _ = alchemy(lambda req, n: httpx.Response(200, json={"result": {"transfers": []}}))
    assert p.supports(1, TransferKind.INTERNAL) and not p.supports(8453, TransferKind.INTERNAL)
    assert p.supports(8453, TransferKind.NATIVE) and not p.supports(56)


# ---- Router and factory ---------------------------------------------------------------------------


def test_router_falls_back_when_first_provider_fails():
    bad, _, _ = etherscan(lambda req, n: httpx.Response(200, json={"status": "0", "message": "NOTOK", "result": "Invalid API Key"}))
    good, _, _ = alchemy(lambda req, n: httpx.Response(200, json={"result": {"transfers": []}}))
    r = ProviderRouter([bad, good]).fetch_transfers(WALLET, 1, TransferKind.NATIVE)
    assert r.provider == "alchemy" and not r.stale and r.complete
    assert r.errors == ["etherscan: missing or invalid API key"]


def test_router_marks_stale_when_all_fail():
    bad1, _, _ = etherscan(lambda req, n: httpx.Response(503))
    bad2, _, _ = alchemy(lambda req, n: httpx.Response(503))
    r = ProviderRouter([bad1, bad2]).fetch_transfers(WALLET, 1, TransferKind.NATIVE)
    assert r.stale and r.provider is None and r.items == [] and not r.complete
    assert r.errors == ["etherscan: HTTP 503", "alchemy: HTTP 503"]


def test_router_skips_provider_without_chain_support():
    alc, calls, _ = alchemy(lambda req, n: httpx.Response(200))
    r = ProviderRouter([alc]).fetch_transfers(WALLET, 56, TransferKind.NATIVE)
    assert r.stale and calls == [] and "not supported" in r.errors[0]


def test_factory_respects_order_and_production_licence_rule():
    keys = dict(etherscan_api_key=SecretStr("e"), alchemy_api_key=SecretStr("a"))
    assert build_router(Settings(**keys, provider_order=["alchemy", "etherscan"])).names == ["alchemy", "etherscan"]
    assert build_router(Settings(**keys, env="production")).names == ["alchemy"]
    assert build_router(Settings(**keys, env="production", etherscan_commercial_plan=True)).names == ["etherscan", "alchemy"]
    assert build_router(Settings(_env_file=None)).names == []


# ---- Resilience -----------------------------------------------------------------------------------


def test_token_bucket_spaces_calls_to_the_rate():
    c = FakeClock()
    b = TokenBucket(rate=2, capacity=2, clock=c.time, sleep=c.sleep)
    for _ in range(4):
        b.acquire()
    assert c.sleeps == [0.5, 0.5]  # burst of 2, then one every 0.5 s
    assert c.t == 1.0


def test_retry_gives_up_on_non_transient_and_honours_retry_after():
    c = FakeClock()
    policy = RetryPolicy(max_attempts=3, base_delay=0.5, max_delay=8, sleep=c.sleep, rand=lambda: 0.0)
    attempts = []

    def fail_fatal():
        attempts.append(1)
        raise ProviderError("fatal")

    with pytest.raises(ProviderError):
        policy.run(fail_fatal)
    assert len(attempts) == 1 and c.sleeps == []

    outcomes = iter([RateLimitedError("slow down", retry_after=5), None])

    def limited():
        e = next(outcomes)
        if e:
            raise e
        return "ok"

    assert policy.run(limited) == "ok" and c.sleeps == [5]


def test_normalize_address():
    assert normalize_address("  0x" + "A" * 40) == "0x" + "a" * 40
    for bad in ("", "0x12", "1" * 42, "0x" + "g" * 40):
        with pytest.raises(ValueError):
            normalize_address(bad)


# ---- Token decimals (contract reads) --------------------------------------------------------------


def test_decode_decimals():
    from app.modules.m3_data.providers.base import decode_decimals

    assert decode_decimals("0x" + format(6, "064x")) == 6
    assert decode_decimals("0x") is None  # no decimals() function
    assert decode_decimals("0x" + format(10**6, "064x")) is None  # not a uint8: refuse
    assert decode_decimals(None) is None


def test_router_reads_decimals_and_falls_back():
    six = "0x" + format(6, "064x")
    bad, _, _ = etherscan(lambda req, n: httpx.Response(200, json={"jsonrpc": "2.0", "id": 1, "error": {"code": -32000, "message": "execution reverted"}}))
    good, calls, _ = alchemy(lambda req, n: httpx.Response(200, json={"jsonrpc": "2.0", "id": 1, "result": six}))
    assert ProviderRouter([bad, good]).token_decimals(1, TOKEN) == (6, "alchemy")
    assert json.loads(calls[0].content)["params"][0] == {"to": TOKEN, "data": "0x313ce567"}
    assert ProviderRouter([bad]).token_decimals(1, TOKEN) == (None, None)
