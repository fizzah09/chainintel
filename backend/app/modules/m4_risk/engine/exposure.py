"""Direct and indirect exposure (port of src/engine/exposure.js).

Walks the transaction graph up to `max_hops` from the wallet and records every risky labelled address
it reaches, with the shortest path, the amount that could have flowed along it (the smallest pair
total on the path) and the transactions. Risky nodes are recorded but not expanded.
edges: [{from, to, usd, hash, time}]
"""

from app.modules.m4_risk.engine.config import LabelLookup, RuleSet
from app.modules.m4_risk.engine.jscompat import js_round, parse_ms


def compute_exposure(address: str, edges: list[dict], as_of: str | None, labels: LabelLookup, rules: RuleSet) -> list[dict]:
    me = address.lower()
    cutoff = parse_ms(as_of) if as_of else float("inf")
    pair: dict[str, dict] = {}
    adj: dict[str, dict[str, dict]] = {}
    for e in edges:
        if parse_ms(e["time"]) > cutoff:
            continue
        a, b = e["from"].lower(), e["to"].lower()
        if a == b:
            continue
        k = f"{a}|{b}" if a < b else f"{b}|{a}"
        p = pair.get(k) or {"usd": 0, "txs": [], "first": e["time"]}
        p["usd"] += e["usd"]
        p["txs"].append(e["hash"])
        if e["time"] < p["first"]:
            p["first"] = e["time"]
        pair[k] = p
        adj.setdefault(a, {})
        adj.setdefault(b, {})
        adj[a][b] = e  # last edge between the pair wins, as in the prototype
        adj[b][a] = e

    def pair_of(a: str, b: str) -> dict:
        return pair[f"{a}|{b}" if a < b else f"{b}|{a}"]

    prev: dict[str, str | None] = {me: None}
    frontier = [me]
    found = []
    hop = 1
    while hop <= rules.max_hops and frontier:
        nxt = []
        for n in frontier:
            for m in adj.get(n, {}):
                if m in prev:
                    continue
                prev[m] = n
                label = labels(m)
                if label and rules.risk_cats.get(label["cat"]):
                    found.append((m, hop, label))
                elif label and label["cat"] in rules.terminal_cats:
                    continue  # do not trace through exchanges, bridges and other large services
                else:
                    nxt.append(m)
        frontier = nxt
        hop += 1

    out = []
    for node, hop, label in found:
        path = [node]
        while prev.get(path[0]):
            path.insert(0, prev[path[0]])
        usd = float("inf")
        txs: list[str] = []
        first = None
        for i in range(len(path) - 1):
            p = pair_of(path[i], path[i + 1])
            usd = min(usd, p["usd"])
            txs.extend(p["txs"][:3])
            if i == len(path) - 2:
                first = p["first"]
        first_edge = adj[path[0]][path[1]]
        conf = label.get("confidence")
        out.append(
            {
                "cat": rules.risk_cats[label["cat"]],
                "labelCat": label["cat"],
                "address": node,
                "name": label.get("name"),
                "source": label.get("source"),
                "labelConfidence": 0.8 if conf is None else conf,
                "hops": hop,
                "relationship": "Direct" if hop == 1 else f"{hop}-hop",
                "usd": js_round(usd),
                "path": path,
                "txs": txs,
                "firstObserved": first,
                "direction": "Incoming (source of funds)" if first_edge["to"].lower() == me else "Outgoing (destination of funds)",
            }
        )
    out.sort(key=lambda e: (e["hops"], -e["usd"]))
    return out


def counterparty_mix(address: str, txs: list[dict], labels: LabelLookup, rules: RuleSet) -> dict:
    seen: dict[str, str] = {}
    for t in txs:
        a = t["cp"].lower()
        if a not in seen:
            lab = labels(a)
            seen[a] = (lab or {}).get("cat") or "unknown"
    mix: dict[str, int] = {}
    for c in seen.values():
        mix[c] = mix.get(c, 0) + 1
    return {"total": len(seen), "mix": mix, "risky": [a for a, c in seen.items() if rules.risk_cats.get(c)]}
