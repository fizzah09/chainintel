"""M3 HTTP API for the frontend.

Amounts are sent as decimal strings: JSON numbers lose precision above 2^53, and token amounts in
base units routinely exceed that.
"""

from datetime import UTC, datetime
from functools import lru_cache
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.db import get_db
from app.core.security import Principal, require_principal, require_roles
from app.modules.m3_data.labels.lookup import LabelView, labels_for
from app.modules.m3_data.models import AddressLabel, LabelImport, LabelSource
from app.modules.m3_data.providers.alchemy import NETWORKS as ALCHEMY_CHAINS
from app.modules.m3_data.providers.base import TransferKind
from app.modules.m3_data.providers.etherscan import DEFAULT_CHAINS as ETHERSCAN_CHAINS
from app.modules.m3_data.providers.factory import build_router
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.queries import KindFreshness, StoredTransfer, load_history
from app.modules.m3_data.sources import service as sources
from app.modules.m3_data.sync import ALL_KINDS, SyncReport, TransferSync

router = APIRouter(prefix="/api/v1", tags=["M3 blockchain data"], dependencies=[Depends(require_principal)])

Address = Annotated[str, Path(pattern=r"^0x[0-9a-fA-F]{40}$", description="EVM address")]
ChainId = Annotated[int, Path(ge=1, description="EVM chain id, e.g. 1 for Ethereum")]
DB = Annotated[Session, Depends(get_db)]
CHAIN_NAMES = {
    1: "Ethereum", 10: "Optimism", 56: "BNB Smart Chain", 137: "Polygon", 8453: "Base",
    42161: "Arbitrum One", 11155111: "Sepolia",
}


@lru_cache
def _router_singleton() -> ProviderRouter:
    return build_router(get_settings())


def get_provider_router() -> ProviderRouter:
    return _router_singleton()


def _utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    return dt.replace(tzinfo=UTC) if dt.tzinfo is None else dt.astimezone(UTC)


def format_amount(value_raw: int, decimals: int | None) -> str | None:
    """Exact decimal string, e.g. 2500000 with 6 decimals -> "2.5". None when decimals are unknown."""
    if decimals is None:
        return None
    # Integer arithmetic only: Decimal would round to its 28-digit context precision.
    whole, frac = divmod(value_raw, 10**decimals)
    frac_s = str(frac).rjust(decimals, "0").rstrip("0") if decimals else ""
    return f"{whole}.{frac_s}" if frac_s else str(whole)


# ---- response models ------------------------------------------------------------------------------


class ChainOut(BaseModel):
    chain_id: int
    name: str
    providers: list[str]  # configured providers that cover this chain, in fallback order
    confirmations: int


class TransferOut(BaseModel):
    chain_id: int
    tx_hash: str
    kind: TransferKind
    sub_id: str
    block_number: int
    block_time: datetime | None
    from_address: str
    to_address: str | None
    value_raw: str
    amount: str | None
    decimals: int | None
    decimals_source: str | None
    token_address: str | None
    token_symbol: str | None
    success: bool | None
    confirmed: bool
    provider: str
    fetched_at: datetime
    fetch_id: int

    @classmethod
    def of(cls, t: StoredTransfer) -> "TransferOut":
        return cls(
            **t.model_dump(exclude={"value_raw"}),
            value_raw=str(t.value_raw),
            amount=format_amount(t.value_raw, t.decimals),
        )


class HistoryOut(BaseModel):
    chain_id: int
    address: str
    as_of: datetime | None
    stale: bool
    freshness: dict[TransferKind, KindFreshness]
    total: int
    limit: int
    offset: int
    items: list[TransferOut]


class SourceOut(BaseModel):
    key: str
    name: str
    url: str | None
    licence: str
    commercial_use: str
    default_confidence: float
    refresh: str
    notes: str | None
    active_labels: int
    last_import_at: datetime | None
    last_import_status: str | None


class ImportOut(BaseModel):
    id: int
    source_key: str
    started_at: datetime
    retrieved_from: str
    content_sha256: str
    licence: str
    commercial_use: str
    status: str
    records: int
    skipped: int
    added: int
    changed: int
    removed: int
    unchanged: int
    message: str | None


# ---- endpoints ------------------------------------------------------------------------------------


@router.get("/chains", response_model=list[ChainOut])
def list_chains(
    providers: ProviderRouter = Depends(get_provider_router), settings: Settings = Depends(get_settings)
) -> list[ChainOut]:
    ids = sorted(ETHERSCAN_CHAINS | set(ALCHEMY_CHAINS))
    return [
        ChainOut(
            chain_id=c, name=CHAIN_NAMES.get(c, f"Chain {c}"),
            providers=[p.name for p in providers.providers if p.supports(c)],
            confirmations=settings.confirmations_for(c),
        )
        for c in ids
    ]


@router.post("/chains/{chain_id}/addresses/{address}/sync", response_model=SyncReport)
def sync_address(
    chain_id: ChainId,
    address: Address,
    db: DB,
    kinds: Annotated[list[TransferKind], Query()] = list(ALL_KINDS),
    providers: ProviderRouter = Depends(get_provider_router),
    settings: Settings = Depends(get_settings),
) -> SyncReport:
    """Fetch new transfers from the providers and store them. Returns what changed and how fresh it is."""
    if not providers.providers:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "No blockchain data provider is configured (set CI_ETHERSCAN_API_KEY or CI_ALCHEMY_API_KEY).",
        )
    return TransferSync(db, providers, settings).sync(address, chain_id, kinds)


@router.get("/chains/{chain_id}/addresses/{address}/transfers", response_model=HistoryOut)
def get_transfers(
    chain_id: ChainId,
    address: Address,
    db: DB,
    kinds: Annotated[list[TransferKind], Query()] = list(ALL_KINDS),
    as_of: Annotated[datetime | None, Query(description="Show what was known at this time (ISO 8601)")] = None,
    limit: Annotated[int, Query(ge=1, le=5000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
    order: Literal["newest", "oldest"] = "newest",
) -> HistoryOut:
    """Stored transfers only; never calls a provider. `stale` says whether the data may be out of date."""
    h = load_history(
        db, address, chain_id, kinds, as_of=_utc(as_of), limit=limit, offset=offset, newest_first=order == "newest"
    )
    return HistoryOut(
        chain_id=h.chain_id, address=h.address, as_of=h.as_of, stale=h.stale, freshness=h.freshness,
        total=h.total, limit=limit, offset=offset, items=[TransferOut.of(t) for t in h.items],
    )


@router.get("/chains/{chain_id}/labels", response_model=dict[str, list[LabelView]])
def get_labels(
    chain_id: ChainId,
    db: DB,
    address: Annotated[list[str], Query(min_length=1, max_length=200, description="Repeat for several addresses")],
    as_of: datetime | None = None,
    commercial_only: bool = False,
    settings: Settings = Depends(get_settings),
) -> dict[str, list[LabelView]]:
    """Labels with source, licence and import id. Production always restricts to commercial sources."""
    try:
        return labels_for(
            db, address, chain_id, as_of=_utc(as_of), commercial_only=commercial_only or settings.env == "production"
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from None


@router.get("/networks/{network}/labels", response_model=dict[str, list[LabelView]])
def get_network_labels(
    network: str,
    db: DB,
    address: Annotated[list[str], Query(min_length=1, max_length=200, description="Repeat for several addresses")],
    as_of: datetime | None = None,
    commercial_only: bool = False,
    settings: Settings = Depends(get_settings),
) -> dict[str, list[LabelView]]:
    """Screen non-EVM addresses (bitcoin, tron, litecoin ...) against the sanctions and hack labels.
    `network=evm` behaves like the chain endpoint with chain 0 (labels that apply on every EVM chain)."""
    try:
        return labels_for(
            db, address, 0, as_of=_utc(as_of), commercial_only=commercial_only or settings.env == "production",
            network=network,
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc)) from None


@router.get("/label-sources", response_model=list[SourceOut])
def list_label_sources(db: DB) -> list[SourceOut]:
    """The licence register."""
    active = dict(
        db.execute(
            select(AddressLabel.source_key, func.count()).where(AddressLabel.valid_to.is_(None)).group_by(AddressLabel.source_key)
        ).all()
    )
    out = []
    for s in db.scalars(select(LabelSource).order_by(LabelSource.key)):
        last = db.scalar(
            select(LabelImport).where(LabelImport.source_key == s.key).order_by(LabelImport.id.desc()).limit(1)
        )
        out.append(
            SourceOut(
                key=s.key, name=s.name, url=s.url, licence=s.licence, commercial_use=s.commercial_use,
                default_confidence=float(s.default_confidence), refresh=s.refresh, notes=s.notes,
                active_labels=active.get(s.key, 0), last_import_at=last.started_at if last else None,
                last_import_status=last.status if last else None,
            )
        )
    return out


@router.get("/label-imports", response_model=list[ImportOut])
def list_label_imports(
    db: DB,
    source: str | None = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
) -> list[ImportOut]:
    """Import history, newest first."""
    q = select(LabelImport).order_by(LabelImport.id.desc()).limit(limit)
    if source:
        q = q.where(LabelImport.source_key == source)
    return [ImportOut.model_validate(i, from_attributes=True) for i in db.scalars(q)]


# ---- Data Source Matrix (R1) ----------------------------------------------------------------------



@router.get("/data-sources", response_model=list[sources.MatrixRow])
def list_data_sources(
    db: DB,
    bucket: Literal["ground_truth", "blockchain_data", "behaviour_rules", "entity_labels"] | None = None,
    status_filter: Annotated[Literal["integrated", "partial", "to_test", "later"] | None, Query(alias="status")] = None,
) -> list[sources.MatrixRow]:
    """Every candidate source with the research checklist's fields and its latest live probe."""
    return sources.matrix(db, bucket, status_filter)


@router.post("/data-sources/{key}/probe", response_model=sources.ProbeOut)
def probe_data_source(
    key: str, db: DB, settings: Settings = Depends(get_settings),
    me: Principal = Depends(require_roles("compliance_manager", "model_owner")),
) -> sources.ProbeOut:
    """Check the source live now and store what it contained."""
    source = sources.get_source(key)
    if source is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"unknown data source {key}")


# ---- Graph endpoint (Arkham-style force-directed graph) -------------------------------------------

class GraphNode(BaseModel):
    id: str
    label: str
    root: bool = False
    labelInfo: dict | None = None


class GraphEdge(BaseModel):
    id: str
    hash: str
    from_: str = None
    to: str | None = None
    value: float = 0.0
    asset: str = "ETH"
    timestamp: int | None = None
    isError: bool = False
    source: str = ""

    model_config = {"populate_by_name": True}

    @classmethod
    def from_dict(cls, d: dict) -> "GraphEdge":
        return cls(id=d["id"], hash=d["hash"], from_=d["from"], to=d.get("to"),
                   value=d.get("value", 0.0), asset=d.get("asset", "ETH"),
                   timestamp=d.get("timestamp"), isError=d.get("isError", False),
                   source=d.get("source", ""))

    def model_dump(self, **kwargs):
        d = super().model_dump(**kwargs)
        d["from"] = d.pop("from_", None)
        return d


class GraphMeta(BaseModel):
    rootAddress: str
    depth: int
    nodeCount: int
    edgeCount: int
    labelsAvailable: int


class GraphOut(BaseModel):
    nodes: list[GraphNode]
    edges: list[dict]
    meta: GraphMeta


# Blockscout chain slug map (free public API, no key required)
_BLOCKSCOUT_HOSTS = {
    1: "https://eth.blockscout.com",
    10: "https://optimism.blockscout.com",
    137: "https://polygon.blockscout.com",
    8453: "https://base.blockscout.com",
    42161: "https://arbitrum.blockscout.com",
}


@router.get("/graph/{chain_id}/{address}", response_model=GraphOut)
async def get_graph(
    chain_id: ChainId,
    address: Address,
    db: DB,
    depth: Annotated[int, Query(ge=0, le=2)] = 1,
    minValueEth: Annotated[float, Query(ge=0)] = 0.0,
    settings: Settings = Depends(get_settings),
) -> GraphOut:
    """Build a real-data transaction graph using Blockscout (no API key needed).

    Falls back to Etherscan if CI_ETHERSCAN_API_KEY is set in .env.
    Expands outward up to `depth` hops. Mirrors the wallet-graph-api reference.
    """
    import asyncio
    import httpx
    from app.modules.m3_data.labels.lookup import labels_for

    blockscout_host = _BLOCKSCOUT_HOSTS.get(chain_id, "https://eth.blockscout.com")
    etherscan_key = settings.etherscan_api_key.get_secret_value() if settings.etherscan_api_key else ""

    async def fetch_blockscout_txs(addr: str) -> list[dict]:
        """Fetch up to 200 recent txs from Blockscout (native + token transfers)."""
        txs: list[dict] = []
        url = f"{blockscout_host}/api/v2/addresses/{addr}/transactions"
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.get(url)
                if r.status_code != 200:
                    return []
                data = r.json()
            for item in data.get("items", []):
                from_a = item.get("from") or {}
                to_a = item.get("to") or {}
                from_addr = (from_a.get("hash") or "").lower() if isinstance(from_a, dict) else str(from_a).lower()
                to_addr = (to_a.get("hash") or "").lower() if isinstance(to_a, dict) else str(to_a).lower()
                if not from_addr or not to_addr:
                    continue
                val = int(item.get("value") or 0) / 1e18
                txs.append({
                    "hash": item.get("hash", ""),
                    "from": from_addr, "to": to_addr,
                    "valueEth": val, "asset": "ETH",
                    "timestamp": 0,
                    "isError": item.get("status") == "error",
                    "source": "blockscout",
                })
        except Exception:
            pass
        return txs

    async def fetch_etherscan_txs(addr: str) -> list[dict]:
        """Full Etherscan fallback (native + tokens) when Blockscout returns nothing."""
        if not etherscan_key:
            return []
        base = "https://api.etherscan.io/v2/api"
        result: list[dict] = []
        for action in ("txlist", "tokentx", "txlistinternal"):
            params = {"chainid": str(chain_id), "module": "account", "action": action,
                      "address": addr, "sort": "desc", "page": "1", "offset": "200",
                      "apikey": etherscan_key}
            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    r = await client.get(base, params=params)
                    data = r.json()
                if data.get("status") != "1" and data.get("message") != "No transactions found":
                    continue
                raw = data.get("result") or []
                for tx in (raw if isinstance(raw, list) else []):
                    from_ = (tx.get("from") or "").lower()
                    to_ = (tx.get("to") or "").lower()
                    if not from_ or not to_:
                        continue
                    if action == "tokentx":
                        decimals = int(tx.get("tokenDecimal") or 18)
                        val = int(tx.get("value") or 0) / (10 ** decimals)
                        asset = tx.get("tokenSymbol") or "TOKEN"
                    else:
                        val = int(tx.get("value") or 0) / 1e18
                        asset = "ETH"
                    result.append({"hash": tx.get("hash", ""), "from": from_, "to": to_,
                                   "valueEth": val, "asset": asset,
                                   "timestamp": int(tx.get("timeStamp") or 0),
                                   "isError": tx.get("isError") == "1",
                                   "source": f"etherscan:{action}"})
            except Exception:
                pass
        return result

    async def fetch_etherscan_token_txs(addr: str) -> list[dict]:
        """Fetch ERC-20 token transfers from Etherscan in parallel with Blockscout native txs."""
        if not etherscan_key:
            return []
        base = "https://api.etherscan.io/v2/api"
        params = {"chainid": str(chain_id), "module": "account", "action": "tokentx",
                  "address": addr, "sort": "desc", "page": "1", "offset": "200",
                  "apikey": etherscan_key}
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.get(base, params=params)
                data = r.json()
            if data.get("status") != "1" and data.get("message") != "No transactions found":
                return []
            raw = data.get("result") or []
            result = []
            for tx in (raw if isinstance(raw, list) else []):
                from_ = (tx.get("from") or "").lower()
                to_ = (tx.get("to") or "").lower()
                if not from_ or not to_:
                    continue
                decimals = int(tx.get("tokenDecimal") or 18)
                val = int(tx.get("value") or 0) / (10 ** decimals)
                asset = tx.get("tokenSymbol") or "TOKEN"
                result.append({"hash": tx.get("hash", ""), "from": from_, "to": to_,
                               "valueEth": val, "asset": asset,
                               "timestamp": int(tx.get("timeStamp") or 0),
                               "isError": tx.get("isError") == "1",
                               "source": "etherscan:tokentx"})
            return result
        except Exception:
            return []

    async def fetch_txs(addr: str) -> list[dict]:
        # Run Blockscout (native ETH) and Etherscan token transfers in parallel.
        # Fall back to full Etherscan if Blockscout returns nothing.
        eth_txs, token_txs = await asyncio.gather(
            fetch_blockscout_txs(addr),
            fetch_etherscan_token_txs(addr),
        )
        if not eth_txs:
            return await fetch_etherscan_txs(addr)
        seen: set[str] = set()
        merged: list[dict] = []
        for tx in eth_txs + token_txs:
            key = f"{tx['hash']}:{tx['asset']}"
            if key not in seen:
                seen.add(key)
                merged.append(tx)
        return merged

    def short_addr(a: str) -> str:
        return f"{a[:6]}…{a[-4:]}" if a else ""

    def node_label(addr: str) -> tuple[str, dict | None]:
        lbl_map = labels_for(db, [addr], chain_id)
        lbl_list = lbl_map.get(addr.lower(), [])
        if lbl_list:
            info = {"name": lbl_list[0].name, "labels": [l.category for l in lbl_list]}
            return lbl_list[0].name, info
        return short_addr(addr), None

    nodes: dict[str, dict] = {}
    edges: list[dict] = []
    edge_keys: set[str] = set()
    visited: set[str] = set()
    queue = [(address.lower(), 0)]

    root_lbl, root_info = node_label(address)
    nodes[address.lower()] = {"id": address.lower(), "label": root_lbl, "root": True, "labelInfo": root_info}

    MAX_NODES = 150

    while queue and len(nodes) < MAX_NODES:
        addr, level = queue.pop(0)
        if addr in visited:
            continue
        visited.add(addr)

        all_txs = await fetch_txs(addr)

        for tx in all_txs:
            # Only apply minValueEth to native ETH — token amounts are in token units
            if tx["asset"] == "ETH" and tx["valueEth"] < minValueEth:
                continue
            counterpart = tx["to"] if tx["from"] == addr else tx["from"]
            if counterpart not in nodes:
                lbl, info = node_label(counterpart)
                nodes[counterpart] = {"id": counterpart, "label": lbl, "root": False, "labelInfo": info}
            ekey = f"{tx['hash']}:{tx['source']}"
            if ekey not in edge_keys:
                edge_keys.add(ekey)
                edges.append({
                    "id": ekey, "hash": tx["hash"],
                    "from": tx["from"], "to": tx["to"],
                    "value": tx["valueEth"], "asset": tx["asset"],
                    "timestamp": tx["timestamp"], "isError": tx["isError"],
                    "source": tx["source"],
                })
            if level < depth and len(nodes) < MAX_NODES and counterpart not in visited:
                queue.append((counterpart, level + 1))

    lbl_count = sum(1 for n in nodes.values() if n["labelInfo"])
    return GraphOut(
        nodes=[GraphNode(**n) for n in nodes.values()],
        edges=edges,
        meta=GraphMeta(rootAddress=address, depth=depth, nodeCount=len(nodes),
                       edgeCount=len(edges), labelsAvailable=lbl_count),
    )
    return sources._out(sources.probe_and_store(db, source, settings, actor=me.user_id))
