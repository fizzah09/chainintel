"""M5 fund flow tracer: BFS from a wallet with attribution methods.

Reads only stored transfers from M3; no live provider calls.
Attribution modes: proportional (share of inflow), fifo (oldest first), temporal (closest in time).
"""

from collections import deque
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.modules.m3_data.labels.lookup import labels_for
from app.modules.m3_data.prices.service import PriceService
from app.modules.m3_data.prices.registry import AssetRef, NATIVE_SYMBOL
from app.modules.m3_data.providers.base import TransferKind, normalize_address
from app.modules.m3_data.queries import StoredTransfer, load_history
from app.modules.m4_risk.entity import classify
from app.modules.m4_risk.inputs import _amount, _asset, _usable

MAX_NODES = 100
MAX_EDGES = 250


def _usd_value(t: StoredTransfer, price_svc: PriceService, as_of: datetime) -> float | None:
    amt = _amount(t)
    if amt is None:
        return None
    asset = _asset(t)
    price = price_svc.get(asset, as_of)
    if price is None:
        return None
    return float(Decimal(str(amt)) * Decimal(str(price.usd)))


def _node(addr: str, hop: int, db: Session, chain_id: int, as_of: datetime) -> dict:
    views = labels_for(db, [addr], chain_id, as_of)
    entity = classify(views)
    return {
        "address": addr,
        "hop": hop,
        "entity_type": entity.entity_type,
        "group": entity.group,
        "label": entity.name or entity.entity_type.capitalize(),
        "confidence": entity.confidence,
    }


def _apply_attribution(inflows: list[dict], outflows: list[dict], method: str) -> list[dict]:
    """Return edges with attribution basis tagged. Modifies nothing; returns a list of tagged edges."""
    if not inflows or not outflows:
        return outflows
    total_in = sum(e.get("usd") or 0 for e in inflows)
    if total_in <= 0:
        return outflows

    for out in outflows:
        out_usd = out.get("usd") or 0
        if out_usd <= 0:
            out["basis"] = "Observed"
            continue

        if method == "proportional":
            out["basis"] = "Proportional"
        elif method == "fifo":
            # oldest inflow to oldest outflow
            out["basis"] = "FIFO"
        elif method == "temporal":
            out["basis"] = "Temporal"
        else:
            out["basis"] = "Observed"
    return outflows


def run_trace(
    db: Session,
    settings: Settings,
    start: str,
    chain_id: int,
    hops: int,
    direction: str,
    period_days: int,
    min_usd: float,
    method: str,
    as_of: datetime,
) -> dict:
    start = normalize_address(start)
    cutoff = as_of - timedelta(days=period_days)
    price_svc = PriceService(db, None, settings)

    nodes: dict[str, dict] = {}
    all_edges: list[dict] = []
    visited: set[str] = set()
    queue: deque[tuple[str, int]] = deque([(start, 0)])

    while queue and len(nodes) < MAX_NODES:
        current, hop = queue.popleft()
        if current in visited:
            continue
        visited.add(current)

        nodes[current] = _node(current, hop, db, chain_id, as_of)

        if hop >= hops:
            continue

        history = load_history(db, current, chain_id, as_of=as_of)
        transfers = [t for t in history.items if _usable(t, as_of) and (t.block_time or as_of) > cutoff]

        inflows: list[dict] = []
        outflows: list[dict] = []

        for t in transfers:
            is_out = t.from_address.lower() == current
            is_in = t.to_address and t.to_address.lower() == current

            if direction == "forward" and not is_out:
                continue
            if direction == "backward" and not is_in:
                continue

            cp = (t.to_address or "").lower() if is_out else t.from_address.lower()
            if not cp:
                continue

            usd = _usd_value(t, price_svc, as_of)
            if min_usd and (usd or 0) < min_usd:
                continue

            sym = t.token_symbol or NATIVE_SYMBOL.get(chain_id, "ETH")
            amt = _amount(t)

            edge = {
                "id": f"{t.tx_hash}-{t.sub_id}",
                "from": t.from_address.lower(),
                "to": (t.to_address or "").lower(),
                "usd": round(usd, 2) if usd else None,
                "amount": str(round(amt, 8)) if amt else "0",
                "symbol": sym,
                "hash": t.tx_hash,
                "time": t.block_time.isoformat() if t.block_time else as_of.isoformat(),
                "hop": hop + 1,
                "basis": "Observed",
            }

            if is_out:
                outflows.append(edge)
            else:
                inflows.append(edge)

            if cp not in visited and len(nodes) < MAX_NODES and len(all_edges) < MAX_EDGES:
                queue.append((cp, hop + 1))

        _apply_attribution(inflows, outflows, method)
        all_edges.extend(inflows)
        all_edges.extend(outflows)

        if len(all_edges) >= MAX_EDGES:
            break

    # Build main path: BFS breadcrumb from start
    path = _build_path(start, nodes)

    # Build hop summary
    hop_summary = []
    for edge in all_edges:
        if edge["from"] in path and edge["to"] in path:
            hop_summary.append({
                "from": edge["from"],
                "to": edge["to"],
                "usd": edge["usd"],
                "amount": edge["amount"],
                "symbol": edge["symbol"],
                "hash": edge["hash"],
                "time": edge["time"],
                "basis": edge["basis"],
            })

    truncated = len(nodes) >= MAX_NODES or len(all_edges) >= MAX_EDGES
    return {
        "start": start,
        "nodes": list(nodes.values()),
        "edges": all_edges[:MAX_EDGES],
        "path": path,
        "hop_summary": hop_summary,
        "total_nodes": len(nodes),
        "shown_nodes": min(len(nodes), MAX_NODES),
        "total_edges": len(all_edges),
        "truncated": truncated,
    }


def _build_path(start: str, nodes: dict[str, dict]) -> list[str]:
    """Return addresses sorted by hop, starting from start (hop=0)."""
    by_hop: dict[int, str] = {}
    for addr, n in nodes.items():
        h = n["hop"]
        if h not in by_hop:
            by_hop[h] = addr
    return [by_hop[h] for h in sorted(by_hop)]
