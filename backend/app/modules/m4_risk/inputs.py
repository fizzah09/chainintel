"""Builds the risk engine's input from M3: stored transfers, labels and prices. The engine never calls
a provider; it only sees what M3 stored, as known at `as_of`.

- Wallet transfers become engine transactions (direction, counterparty, amount, USD value).
- The largest counterparties' own transfers become extra graph edges, so 2-hop exposure is visible.
  Exchanges, bridges and other services are never expanded (their histories are huge and irrelevant).
- Labels: per address, the strongest risk label wins, otherwise the most confident label.
- Prices: daily USD from M3's price store. Unpriced transfers are counted, never guessed.
- A manifest lists exactly which fetches, label imports and price rows were used.
"""

from collections import defaultdict
from collections.abc import Iterable
from datetime import UTC, datetime
from decimal import Decimal

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.modules.m3_data.labels.lookup import LabelView, labels_for
from app.modules.m3_data.prices.registry import NATIVE_SYMBOL, AssetRef
from app.modules.m3_data.prices.service import Price, PriceService
from app.modules.m3_data.providers.base import TransferKind, normalize_address
from app.modules.m3_data.providers.router import ProviderRouter
from app.modules.m3_data.queries import StoredTransfer, load_history
from app.modules.m3_data.sync import TransferSync
from app.modules.m4_risk.engine.config import RuleSet
from app.modules.m4_risk.engine.jscompat import to_iso

_EPOCH = datetime(1970, 1, 1, tzinfo=UTC)


class AssessmentInputs(BaseModel):
    address: str
    chain_id: int
    as_of: datetime  # knowledge time: data first seen after this is ignored
    as_of_iso: str
    txs: list[dict]
    edges: list[dict]
    labels: dict[str, dict]
    data_quality: dict
    manifest: dict

    def label_lookup(self):
        return lambda a: self.labels.get(a.lower())


def _ms(dt: datetime) -> int:
    return int((dt - _EPOCH).total_seconds() * 1000)


def engine_label(views: list[LabelView], rules: RuleSet) -> dict | None:
    """Strongest risk label first (views are sorted by confidence), else the most confident label."""
    if not views:
        return None
    risky = [v for v in views if v.category in rules.risk_cats]
    v = (risky or views)[0]
    return {
        "cat": v.category, "name": v.name, "source": v.source_name, "confidence": v.confidence,
        "sourceKey": v.source_key, "importId": v.import_id, "commercialUse": v.commercial_use,
    }


def _amount(t: StoredTransfer) -> float | None:
    if t.decimals is None:
        return None
    return float(Decimal(t.value_raw).scaleb(-t.decimals))


def _asset(t: StoredTransfer) -> AssetRef:
    return AssetRef(t.chain_id, t.token_address if t.kind is TransferKind.ERC20 else None)


def _usable(t: StoredTransfer, until: datetime) -> bool:
    """Failed transactions move no value; transfers without a block time cannot be placed in time."""
    return t.success is not False and t.block_time is not None and t.block_time <= until and t.from_address != t.to_address


def to_engine_tx(t: StoredTransfer, me: str, price: Price | None) -> dict | None:
    if t.to_address == me:
        direction, cp = "in", t.from_address
    elif t.from_address == me:
        direction, cp = "out", t.to_address or ""
    else:
        return None
    value = _amount(t)
    usd = None
    if price is not None and value is not None:
        usd = float(Decimal(t.value_raw).scaleb(-t.decimals) * price.usd)
    sym = NATIVE_SYMBOL.get(t.chain_id, "NATIVE") if t.kind is not TransferKind.ERC20 else (t.token_symbol or "TOKEN")
    return {
        "hash": t.tx_hash, "time": to_iso(_ms(t.block_time)), "from": t.from_address, "to": t.to_address or "",
        "cp": cp, "dir": direction, "sym": sym, "value": value or 0.0, "usd": usd, "contract": False,
        "kind": t.kind.value, "token": t.token_address, "priceRowId": price.row_id if price else None,
    }


def _edge(t: StoredTransfer, price: Price | None) -> dict:
    value = _amount(t)
    usd = float(Decimal(t.value_raw).scaleb(-t.decimals) * price.usd) if price is not None and value is not None else 0.0
    return {"from": t.from_address, "to": t.to_address or "", "usd": usd, "hash": t.tx_hash, "time": to_iso(_ms(t.block_time))}


def pick_neighbours(txs: list[dict], labels: dict[str, dict], rules: RuleSet, count: int) -> list[str]:
    """Largest counterparties by USD volume (then by number of transfers) that are worth expanding:
    not risky (already exposure) and not a large service (never expanded)."""
    vol: dict[str, float] = defaultdict(float)
    n: dict[str, int] = defaultdict(int)
    for t in txs:
        cp = t["cp"]
        lab = labels.get(cp)
        if not cp or (lab and (lab["cat"] in rules.risk_cats or lab["cat"] in rules.terminal_cats)):
            continue
        vol[cp] += t["usd"] or 0.0
        n[cp] += 1
    return sorted(vol, key=lambda a: (-vol[a], -n[a], a))[:count]


def _labels(db: Session, addresses: Iterable[str], chain_id: int, as_of: datetime | None, rules: RuleSet, settings: Settings) -> dict:
    views = labels_for(db, addresses, chain_id, as_of=as_of, commercial_only=settings.env == "production")
    return {a: lab for a, vs in views.items() if (lab := engine_label(vs, rules))}


def _price_all(prices: PriceService | None, transfers: list[StoredTransfer]) -> dict:
    if prices is None:
        return {}
    return prices.usd({(_asset(t), t.block_time.date()) for t in transfers if t.decimals is not None})


def _wallet_view(db, me, chain_id, as_of, knowledge, prices, rules, settings):
    """The wallet's usable transfers, their prices, engine transactions and labels. Shared by
    `refresh` and `load_inputs` so both pick the same neighbours."""
    wallet = load_history(db, me, chain_id, as_of=as_of)
    mine = [t for t in wallet.items if _usable(t, knowledge)]
    labels = _labels(db, {me} | {t.from_address for t in mine} | {t.to_address for t in mine if t.to_address}, chain_id, as_of, rules, settings)
    priced = _price_all(prices, mine)
    txs = [x for t in mine if (x := to_engine_tx(t, me, priced.get((_asset(t), t.block_time.date()))))]
    return wallet, mine, priced, txs, labels


def load_inputs(
    db: Session,
    address: str,
    chain_id: int,
    *,
    rules: RuleSet,
    settings: Settings,
    prices: PriceService | None,
    as_of: datetime | None = None,
    neighbours: int | None = None,
) -> AssessmentInputs:
    me = normalize_address(address)
    knowledge = as_of or datetime.now(UTC)
    count = settings.risk_neighbours if neighbours is None else neighbours

    wallet, mine, priced, txs, labels = _wallet_view(db, me, chain_id, as_of, knowledge, prices, rules, settings)
    chosen = pick_neighbours(txs, labels, rules, count)

    neighbour_rows: list[StoredTransfer] = []
    loaded, no_data = [], []
    for n in chosen:
        h = load_history(db, n, chain_id, as_of=as_of)
        rows = [t for t in h.items if _usable(t, knowledge)]
        (loaded if rows else no_data).append(n)
        neighbour_rows += rows
    if neighbour_rows:
        priced |= _price_all(prices, neighbour_rows)
        extra = {t.from_address for t in neighbour_rows} | {t.to_address for t in neighbour_rows if t.to_address}
        labels |= _labels(db, extra - set(labels), chain_id, as_of, rules, settings)

    edges, seen = [], set()
    for t in mine + neighbour_rows:
        key = (t.tx_hash, t.kind, t.sub_id)
        if key in seen:
            continue  # a transfer between the wallet and a neighbour appears in both histories
        seen.add(key)
        edges.append(_edge(t, priced.get((_asset(t), t.block_time.date()))))
    txs.sort(key=lambda x: (x["time"], x["hash"]))

    unpriced = [t for t in txs if t["usd"] is None]
    used_prices = {p for p in priced.values() if p is not None}
    data_quality = {
        "transfers": len(txs),
        "unpriced": len(unpriced),
        "unpricedAssets": sorted({t["token"] or t["sym"] for t in unpriced}),
        "stale": wallet.stale,
        "freshness": {k.value: f.status for k, f in wallet.freshness.items()},
        "neighboursLoaded": loaded,
        "neighboursWithoutData": no_data,
        "priceNotes": sorted(set(prices.notes)) if prices else ["no price service"],
    }
    manifest = {
        "knowledgeTime": knowledge.isoformat(),
        "transferFetchIds": sorted({t.fetch_id for t in mine + neighbour_rows}),
        "labelImportIds": sorted({lab["importId"] for lab in labels.values()}),
        "priceRowIds": sorted(p.row_id for p in used_prices if p.row_id is not None),
        "priceSources": sorted({p.source for p in used_prices}),
        "neighbours": chosen,
    }
    return AssessmentInputs(
        address=me, chain_id=chain_id, as_of=knowledge, as_of_iso=to_iso(_ms(knowledge)), txs=txs, edges=edges,
        labels=labels, data_quality=data_quality, manifest=manifest,
    )


def refresh(
    db: Session, router: ProviderRouter, settings: Settings, address: str, chain_id: int, rules: RuleSet,
    prices: PriceService | None,
    clock=None,
) -> dict:
    """Sync the wallet, then the same top counterparties `load_inputs` will pick, through M3.
    Network-heavy: one sync per address. Re-running an old assessment never calls this."""
    me = normalize_address(address)
    sync = TransferSync(db, router, settings, **({"clock": clock} if clock else {}))
    stale = {me: sync.sync(me, chain_id).stale}
    _, _, _, txs, labels = _wallet_view(db, me, chain_id, None, clock() if clock else datetime.now(UTC), prices, rules, settings)
    for n in pick_neighbours(txs, labels, rules, settings.risk_neighbours):
        stale[n] = sync.sync(n, chain_id, [TransferKind.NATIVE, TransferKind.ERC20]).stale
    return {"stale": stale}
