"""Fetch an address's recent transactions from the free Blockscout API, with a disk cache."""
import json
import time
import urllib.error
import urllib.parse
import urllib.request

from config import BLOCKSCOUT_API, CACHE, MAX_RETRIES, PAGES_PER_ADDRESS, REQUEST_DELAY_S


HEADERS = {"User-Agent": "Mozilla/5.0 (chainintel-research-ml)", "Accept": "application/json"}


def _get(url: str) -> dict:
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503):
                time.sleep(2 ** attempt)
                continue
            raise
        except urllib.error.URLError:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"gave up after {MAX_RETRIES} tries: {url}")


def _simplify(item: dict) -> dict:
    """Keep only the fields the features need."""
    frm = (item.get("from") or {}).get("hash", "") or ""
    to = (item.get("to") or {}).get("hash", "") or ""
    types = item.get("transaction_types") or []
    method = item.get("method") or ""
    return {
        "ts": item.get("timestamp"),                 # ISO time string
        "from": frm.lower(),
        "to": to.lower(),
        "value_wei": int(item.get("value") or 0),
        "contract_call": "contract_call" in types or method not in ("", "transfer"),
        "ok": item.get("status") == "ok",
    }


def fetch_transactions(address: str) -> list[dict]:
    """Return up to PAGES_PER_ADDRESS pages of transactions, cached on disk per address."""
    address = address.lower()
    cache_file = CACHE / f"{address}.json"
    if cache_file.exists():
        return json.loads(cache_file.read_text(encoding="utf-8"))

    txs: list[dict] = []
    params: dict = {}
    for _ in range(PAGES_PER_ADDRESS):
        url = f"{BLOCKSCOUT_API}/addresses/{address}/transactions"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        page = _get(url)
        txs.extend(_simplify(i) for i in page.get("items", []))
        nxt = page.get("next_page_params")
        if not nxt:
            break
        params = nxt
        time.sleep(REQUEST_DELAY_S)

    CACHE.mkdir(parents=True, exist_ok=True)
    cache_file.write_text(json.dumps(txs), encoding="utf-8")
    time.sleep(REQUEST_DELAY_S)
    return txs
