"""Live fund flow tracer using Blockscout — no DB required.

BFS from start address, fetches real on-chain transactions per hop.
Concurrent fetch per hop batch to keep latency reasonable.
"""

from __future__ import annotations

import time
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed

import httpx

BLOCKSCOUT_HOSTS: dict[int, str] = {
    1:     "https://eth.blockscout.com",
    10:    "https://optimism.blockscout.com",
    137:   "https://polygon.blockscout.com",
    8453:  "https://base.blockscout.com",
    42161: "https://arbitrum.blockscout.com",
}
NATIVE_SYM: dict[int, str] = {1: "ETH", 10: "ETH", 137: "MATIC", 8453: "ETH", 42161: "ETH"}

MAX_NODES    = 100
MAX_EDGES    = 250
MAX_CPS_HOP  = 12   # max unique counterparties to expand per address
TX_PER_ADDR  = 50   # transactions fetched per Blockscout call
MAX_WORKERS  = 6    # concurrent Blockscout fetches
ETH_USD      = 2_500.0  # approximate price for USD conversion


def _fetch_txs(addr: str, blockscout_host: str) -> list[dict]:
    url = f"{blockscout_host}/api/v2/addresses/{addr}/transactions"
    try:
        with httpx.Client(timeout=12) as client:
            r = client.get(url, params={"filter": "to | from"})
        if r.status_code != 200:
            return []
        items = r.json().get("items", [])
    except Exception:
        return []

    out = []
    for item in items[:TX_PER_ADDR]:
        from_a = item.get("from") or {}
        to_a   = item.get("to")   or {}
        fa = (from_a.get("hash") or "").lower() if isinstance(from_a, dict) else str(from_a).lower()
        ta = (to_a.get("hash")   or "").lower() if isinstance(to_a,   dict) else str(to_a).lower()
        if not fa or not ta:
            continue
        val = int(item.get("value") or 0) / 1e18
        out.append({
            "hash":     item.get("hash", ""),
            "from":     fa,
            "to":       ta,
            "value_eth": val,
            "timestamp": item.get("timestamp", ""),
            "is_error":  item.get("status") == "error",
        })
    return out


def _fetch_batch(addrs: list[str], blockscout_host: str) -> dict[str, list[dict]]:
    """Fetch transactions for multiple addresses concurrently."""
    results: dict[str, list[dict]] = {}
    with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(addrs))) as pool:
        future_to_addr = {pool.submit(_fetch_txs, a, blockscout_host): a for a in addrs}
        for fut in as_completed(future_to_addr, timeout=20):
            addr = future_to_addr[fut]
            try:
                results[addr] = fut.result()
            except Exception:
                results[addr] = []
    return results


def run_live_trace(
    start:        str,
    chain_id:     int   = 1,
    hops:         int   = 3,
    direction:    str   = "both",
    min_usd:      float = 0.0,
    method:       str   = "proportional",
    deadline:     float = 25.0,   # wall-clock seconds budget
) -> dict:
    t0            = time.monotonic()
    blockscout    = BLOCKSCOUT_HOSTS.get(chain_id, BLOCKSCOUT_HOSTS[1])
    native_sym    = NATIVE_SYM.get(chain_id, "ETH")
    min_eth       = min_usd / ETH_USD if ETH_USD > 0 else 0.0
    start         = start.lower()

    nodes:    dict[str, dict] = {}
    all_edges: list[dict]     = []
    visited:  set[str]        = set()
    # queue: (address, hop)
    queue: deque[tuple[str, int]] = deque([(start, 0)])

    while queue and len(nodes) < MAX_NODES and len(all_edges) < MAX_EDGES:
        if time.monotonic() - t0 > deadline:
            break

        # Collect all addresses at the current hop level for a batch fetch
        cur_hop = queue[0][1]
        batch = []
        while queue and queue[0][1] == cur_hop and len(batch) < MAX_WORKERS * 2:
            addr, hop = queue.popleft()
            if addr in visited:
                continue
            visited.add(addr)
            nodes[addr] = {
                "address":     addr,
                "hop":         hop,
                "label":       f"{addr[:6]}…{addr[-4:]}",
                "entity_type": "wallet",
                "risk_score":  0,
                "group":       None,
                "confidence":  0.0,
            }
            if hop < hops:
                batch.append((addr, hop))

        if not batch:
            continue

        # Fetch this hop's addresses concurrently
        fetched = _fetch_batch([a for a, _ in batch], blockscout)

        for addr, hop in batch:
            txs = fetched.get(addr, [])
            # Sort descending by value so we expand highest-value CPs first
            txs.sort(key=lambda x: x["value_eth"], reverse=True)

            new_cps: dict[str, float] = {}
            for tx in txs:
                is_out = tx["from"] == addr
                is_in  = tx["to"]   == addr

                if direction == "forward"  and not is_out: continue
                if direction == "backward" and not is_in:  continue

                if min_eth > 0 and tx["value_eth"] < min_eth:
                    continue

                usd = round(tx["value_eth"] * ETH_USD, 2)
                cp  = tx["to"] if is_out else tx["from"]

                edge = {
                    "from":     tx["from"],
                    "to":       tx["to"],
                    "usd":      usd,
                    "amount":   str(round(tx["value_eth"], 8)),
                    "symbol":   native_sym,
                    "hash":     tx["hash"],
                    "time":     tx["timestamp"],
                    "hop":      hop + 1,
                    "basis":    "Observed",
                    "is_error": tx["is_error"],
                }
                all_edges.append(edge)
                if len(all_edges) >= MAX_EDGES:
                    break

                if cp not in visited and cp not in new_cps:
                    new_cps[cp] = tx["value_eth"]

            # Only expand the top CPs by value to stay within limits
            top_cps = sorted(new_cps, key=lambda a: new_cps[a], reverse=True)[:MAX_CPS_HOP]
            for cp in top_cps:
                if len(nodes) < MAX_NODES:
                    queue.append((cp, hop + 1))

            if len(all_edges) >= MAX_EDGES:
                break

    # Build main path: one address per hop level, sorted by hop
    seen_hops: dict[int, str] = {}
    for addr, n in nodes.items():
        h = n["hop"]
        if h not in seen_hops:
            seen_hops[h] = addr
    path = [seen_hops[h] for h in sorted(seen_hops)]
    path_set = set(path)

    # Apply attribution labels
    if method == "proportional":
        for e in all_edges:
            if e["basis"] == "Observed" and e["usd"] and e["usd"] > 0:
                e["basis"] = "Proportional"
    elif method == "fifo":
        for e in all_edges:
            if e["basis"] == "Observed":
                e["basis"] = "FIFO"
    elif method == "temporal":
        for e in all_edges:
            if e["basis"] == "Observed":
                e["basis"] = "Temporal"

    hop_summary = [
        {
            "from":   e["from"],
            "to":     e["to"],
            "usd":    e["usd"],
            "amount": e["amount"],
            "symbol": e["symbol"],
            "hash":   e["hash"],
            "time":   e["time"],
            "basis":  e["basis"],
        }
        for e in all_edges
        if e["from"] in path_set and e["to"] in path_set
    ]

    truncated = len(nodes) >= MAX_NODES or len(all_edges) >= MAX_EDGES
    return {
        "start":       start,
        "nodes":       list(nodes.values()),
        "edges":       all_edges[:MAX_EDGES],
        "path":        path,
        "hop_summary": hop_summary,
        "total_nodes": len(nodes),
        "shown_nodes": min(len(nodes), MAX_NODES),
        "total_edges": len(all_edges),
        "truncated":   truncated,
    }
