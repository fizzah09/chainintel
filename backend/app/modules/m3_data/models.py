"""M3 tables. Rows are never deleted: a transfer dropped by a chain reorganisation gets `removed_at`,
so any past score can be rebuilt from exactly the rows that existed at its time (see queries.as_of)."""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Date,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Identity,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

SANCTIONS_SOURCES = ("OFAC_SDN", "OFAC_CONS", "EU", "UK", "UN")

from app.core.db import Base

ADDR = String(42)
KINDS = "kind IN ('native', 'internal', 'erc20')"


class FetchLog(Base):
    """Append-only: one row per provider fetch. Every stored transfer points to the fetch that first saw it."""

    __tablename__ = "chain_fetch_log"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer)
    address: Mapped[str] = mapped_column(ADDR)
    kind: Mapped[str] = mapped_column(String(16))
    from_block: Mapped[int] = mapped_column(BigInteger)
    to_block: Mapped[int | None] = mapped_column(BigInteger)
    head_block: Mapped[int | None] = mapped_column(BigInteger)
    safe_block: Mapped[int | None] = mapped_column(BigInteger)
    provider: Mapped[str | None] = mapped_column(String(32))
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    complete: Mapped[bool] = mapped_column(Boolean)
    stale: Mapped[bool] = mapped_column(Boolean)
    note: Mapped[str | None] = mapped_column(Text)
    errors: Mapped[list[str]] = mapped_column(JSONB, default=list)

    __table_args__ = (Index("ix_chain_fetch_log_address", "chain_id", "address", "fetched_at"),)


class ChainTransfer(Base):
    __tablename__ = "chain_transfers"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer)
    tx_hash: Mapped[str] = mapped_column(String(66))
    kind: Mapped[str] = mapped_column(String(16))
    sub_id: Mapped[str] = mapped_column(Text)
    block_number: Mapped[int] = mapped_column(BigInteger)
    block_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    from_address: Mapped[str] = mapped_column(ADDR)
    to_address: Mapped[str | None] = mapped_column(ADDR)
    value_raw: Mapped[Decimal] = mapped_column(Numeric(78, 0))  # uint256 fits in 78 digits
    token_address: Mapped[str | None] = mapped_column(ADDR)
    token_symbol: Mapped[str | None] = mapped_column(String(64))
    token_decimals_reported: Mapped[int | None] = mapped_column(Integer)
    success: Mapped[bool | None] = mapped_column(Boolean)
    # Provenance: who supplied the row, when, and in which fetch.
    provider: Mapped[str] = mapped_column(String(32))
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fetch_id: Mapped[int] = mapped_column(ForeignKey("chain_fetch_log.id"))
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # Reorg handling: rows above the safe depth stay unconfirmed and may still change or disappear.
    confirmed: Mapped[bool] = mapped_column(Boolean)
    removed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        UniqueConstraint("chain_id", "tx_hash", "kind", "sub_id", name="uq_chain_transfers_identity"),
        CheckConstraint(KINDS, name="kind"),
        CheckConstraint("value_raw >= 0", name="value_non_negative"),
        Index("ix_chain_transfers_from", "chain_id", "from_address", "block_number"),
        Index("ix_chain_transfers_to", "chain_id", "to_address", "block_number"),
    )


class AddressSyncState(Base):
    """How far each address is synced, per transfer kind, and how fresh that data is."""

    __tablename__ = "address_sync_state"

    chain_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    address: Mapped[str] = mapped_column(ADDR, primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), primary_key=True)
    # Highest block fully stored and past the reorg depth. Next sync starts at this + 1.
    confirmed_to_block: Mapped[int | None] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(16))  # ok | partial | stale
    last_provider: Mapped[str | None] = mapped_column(String(32))
    last_attempt_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_errors: Mapped[list[str]] = mapped_column(JSONB, default=list)

    __table_args__ = (
        CheckConstraint(KINDS, name="kind"),
        CheckConstraint("status IN ('ok', 'partial', 'stale')", name="status"),
    )


class Token(Base):
    """Token decimals read from the contract itself, not trusted from the data provider."""

    __tablename__ = "tokens"

    chain_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    address: Mapped[str] = mapped_column(ADDR, primary_key=True)
    decimals: Mapped[int | None] = mapped_column(Integer)  # None: contract could not be read yet
    provider: Mapped[str | None] = mapped_column(String(32))
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


# ---- Labels (M3.4) --------------------------------------------------------------------------------

LABEL_CATEGORIES = (
    "sanctions", "scam", "phishing", "hack", "mixer", "ransomware", "darknet", "gambling",
    "exchange", "bridge", "defi", "service", "other",
)
COMMERCIAL_USE = ("allowed", "not_allowed", "unverified")


class LabelSource(Base):
    """Licence register: one row per label source, with what its licence allows."""

    __tablename__ = "label_sources"

    key: Mapped[str] = mapped_column(String(48), primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    url: Mapped[str | None] = mapped_column(Text)
    licence: Mapped[str] = mapped_column(Text)
    commercial_use: Mapped[str] = mapped_column(String(16))
    default_confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2))
    refresh: Mapped[str] = mapped_column(String(16))  # daily | weekly | manual
    notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("commercial_use IN ('allowed', 'not_allowed', 'unverified')", name="commercial_use"),
    )


class LabelImport(Base):
    """Append-only: one row per import run, with the licence that applied at the time."""

    __tablename__ = "label_imports"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    source_key: Mapped[str] = mapped_column(ForeignKey("label_sources.key"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    retrieved_from: Mapped[str] = mapped_column(Text)  # URL or local file
    content_sha256: Mapped[str] = mapped_column(String(64))
    licence: Mapped[str] = mapped_column(Text)
    commercial_use: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16))  # applied | unchanged | rejected
    records: Mapped[int] = mapped_column(Integer, default=0)
    skipped: Mapped[int] = mapped_column(Integer, default=0)  # rows with an invalid address
    added: Mapped[int] = mapped_column(Integer, default=0)
    changed: Mapped[int] = mapped_column(Integer, default=0)
    removed: Mapped[int] = mapped_column(Integer, default=0)
    unchanged: Mapped[int] = mapped_column(Integer, default=0)
    message: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint("status IN ('applied', 'unchanged', 'rejected')", name="status"),
        Index("ix_label_imports_source", "source_key", "started_at"),
    )


class AddressLabel(Base):
    """Versioned label. Never updated in place except to close it (valid_to). A changed label is a
    new row; a label dropped by its source is closed and stays as history."""

    __tablename__ = "address_labels"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    source_key: Mapped[str] = mapped_column(ForeignKey("label_sources.key"))
    network: Mapped[str] = mapped_column(String(16), server_default="evm")  # evm | bitcoin | tron | ...
    chain_id: Mapped[int] = mapped_column(Integer)  # 0 = every EVM chain; always 0 off EVM
    address: Mapped[str] = mapped_column(String(128))  # canonical form; base58 keeps its case
    category: Mapped[str] = mapped_column(String(16))
    name: Mapped[str] = mapped_column(Text)
    confidence: Mapped[Decimal] = mapped_column(Numeric(3, 2))
    source_ref: Mapped[str | None] = mapped_column(Text)  # the source's own id or date for the entry
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    valid_to: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    import_id: Mapped[int] = mapped_column(ForeignKey("label_imports.id"))
    ended_by_import_id: Mapped[int | None] = mapped_column(ForeignKey("label_imports.id"))

    __table_args__ = (
        CheckConstraint("category IN (" + ", ".join(f"'{c}'" for c in LABEL_CATEGORIES) + ")", name="category"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="confidence_range"),
        CheckConstraint("network ~ '^[a-z_]{2,16}$' AND (network = 'evm' OR chain_id = 0)", name="network"),
        Index("ix_address_labels_address", "address", "network", "chain_id"),
        # At most one current label per source, network, chain and address.
        Index(
            "uq_address_labels_current",
            "source_key", "network", "chain_id", "address",
            unique=True,
            postgresql_where=text("valid_to IS NULL"),
        ),
    )


# ---- Prices (M4.2) --------------------------------------------------------------------------------


class AssetPrice(Base):
    """Append-only daily USD prices with their source. A score names the exact rows it used."""

    __tablename__ = "asset_prices"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    price_key: Mapped[str] = mapped_column(String(80))  # "ETH", "USDC", or "erc20:<chain>:<address>"
    day: Mapped[date] = mapped_column(Date)  # UTC day the price stands for (daily close)
    source: Mapped[str] = mapped_column(String(16))  # chainlink | coingecko
    usd: Mapped[Decimal] = mapped_column(Numeric(38, 18))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))  # when the source set this price
    source_ref: Mapped[str] = mapped_column(Text)  # feed address + round id, or CoinGecko coin id
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        UniqueConstraint("price_key", "day", "source", name="uq_asset_prices_key_day_source"),
        CheckConstraint("source IN ('chainlink', 'coingecko')", name="source"),
        CheckConstraint("usd >= 0", name="usd_non_negative"),
    )


# ---- Sanctions entries (Intel layer) --------------------------------------------------------------


class SanctionsEntry(Base):
    """Entity-level record from OFAC/EU/UK/UN sanctions lists.

    One entity can carry multiple crypto addresses (stored as JSONB).
    For each Ethereum address we also write an AddressLabel row (category='sanctions'),
    so the risk engine can look up labels without joining this table.
    content_sha256 lets the daily sync skip unchanged entities cheaply.
    """

    __tablename__ = "sanctions_entries"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    list_source: Mapped[str] = mapped_column(String(16))          # OFAC_SDN | OFAC_CONS | EU | UK | UN
    entity_ref: Mapped[str] = mapped_column(String(64))           # source's own ID (OFAC ID / EU ref)
    entity_name: Mapped[str] = mapped_column(Text)
    entity_type: Mapped[str] = mapped_column(String(16))          # individual | entity | vessel | aircraft
    program: Mapped[str | None] = mapped_column(Text)             # IRAN | CYBER | RUSSIA | …
    designation_reason: Mapped[str | None] = mapped_column(Text)
    designated_at: Mapped[date | None] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    crypto_addresses: Mapped[list] = mapped_column(JSONB, default=list)   # [{chain, address}]
    aliases: Mapped[list] = mapped_column(JSONB, default=list)
    countries: Mapped[list] = mapped_column(JSONB, default=list)
    raw_data: Mapped[dict] = mapped_column(JSONB, default=dict)
    import_id: Mapped[int | None] = mapped_column(ForeignKey("label_imports.id"))
    content_sha256: Mapped[str] = mapped_column(String(64))       # sha256 of raw_data to detect changes
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "list_source IN ('OFAC_SDN','OFAC_CONS','EU','UK','UN')", name="sanctions_list_source"
        ),
        UniqueConstraint("list_source", "entity_ref", name="uq_sanctions_entries_ref"),
        Index("ix_sanctions_entries_source", "list_source", "is_active"),
    )


# ---- Data Source Matrix probes (R1) ---------------------------------------------------------------


class SourceProbe(Base):
    """Append-only: one row per live check of a data source, with what it actually contained."""

    __tablename__ = "source_probes"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    source_key: Mapped[str] = mapped_column(String(48))
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    checked_by: Mapped[str] = mapped_column(String(128))
    ok: Mapped[bool] = mapped_column(Boolean)
    outcome: Mapped[str] = mapped_column(String(16))  # reachable | unreachable | needs_key | manual | parse_error
    http_status: Mapped[int | None] = mapped_column(Integer)
    final_url: Mapped[str | None] = mapped_column(Text)
    bytes: Mapped[int | None] = mapped_column(BigInteger)
    findings: Mapped[dict] = mapped_column(JSONB, default=dict)
    error: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (Index("ix_source_probes_key", "source_key", "checked_at"),)


# ── Tornado Cash event log ──────────────────────────────────────────────────────────────────────


class TcEvent(Base):
    """One deposit or withdrawal event emitted by a Tornado Cash pool contract.

    Deposits reveal a commitment hash (not the depositor's address — TC is zero-knowledge).
    Withdrawals reveal the recipient, relayer, and nullifier hash.
    Linking a wallet to a TC deposit/withdrawal requires heuristic or timing analysis (Layer 4).
    """

    __tablename__ = "tc_events"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer)
    contract_address: Mapped[str] = mapped_column(String(42))   # TC pool address
    event_type: Mapped[str] = mapped_column(String(16))         # deposit | withdrawal
    # deposit fields
    commitment: Mapped[str | None] = mapped_column(String(66))  # bytes32 commitment
    leaf_index: Mapped[int | None] = mapped_column(Integer)
    # withdrawal fields
    nullifier_hash: Mapped[str | None] = mapped_column(String(66))
    to_address: Mapped[str | None] = mapped_column(String(42))  # recipient
    relayer: Mapped[str | None] = mapped_column(String(42))
    fee: Mapped[Decimal | None] = mapped_column(Numeric(28, 8))
    # common
    denomination_eth: Mapped[Decimal | None] = mapped_column(Numeric(28, 8))
    denomination_token: Mapped[str] = mapped_column(String(8))  # ETH | USDT | DAI | WBTC
    tx_hash: Mapped[str] = mapped_column(String(66))
    block_number: Mapped[int] = mapped_column(BigInteger)
    block_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    log_index: Mapped[int] = mapped_column(Integer)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint("event_type IN ('deposit','withdrawal')", name="tc_event_type"),
        UniqueConstraint("chain_id", "tx_hash", "log_index", name="uq_tc_events_log"),
        Index("ix_tc_events_contract", "chain_id", "contract_address", "event_type"),
        Index("ix_tc_events_recipient", "to_address"),   # withdrawal recipient lookup
        Index("ix_tc_events_block", "chain_id", "block_number"),
    )


# ── DEX swap events ─────────────────────────────────────────────────────────────────────────────

DEX_PROTOCOLS = ("uniswap_v2", "uniswap_v3", "curve", "sushiswap", "balancer", "1inch")


class DexSwap(Base):
    """One swap event from a decentralised exchange pool.

    Used for wash-trading detection (rapid round-trips), layering analysis (token hops),
    and linking wallet addresses that appear as sender/recipient across pools.
    amount_in / amount_out are raw token units (not ETH-normalised); *_usd columns are
    populated post-sync by the price enrichment job.
    """

    __tablename__ = "dex_swaps"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    chain_id: Mapped[int] = mapped_column(Integer)
    protocol: Mapped[str] = mapped_column(String(16))           # uniswap_v2 | uniswap_v3 | curve …
    pool_address: Mapped[str] = mapped_column(String(42))
    sender: Mapped[str] = mapped_column(String(42))             # msg.sender (router or wallet)
    recipient: Mapped[str] = mapped_column(String(42))          # actual token recipient
    token_in: Mapped[str] = mapped_column(String(42))
    token_out: Mapped[str] = mapped_column(String(42))
    symbol_in: Mapped[str | None] = mapped_column(String(16))
    symbol_out: Mapped[str | None] = mapped_column(String(16))
    amount_in: Mapped[Decimal] = mapped_column(Numeric(78, 0))  # raw units
    amount_out: Mapped[Decimal] = mapped_column(Numeric(78, 0))
    amount_in_usd: Mapped[Decimal | None] = mapped_column(Numeric(28, 2))
    amount_out_usd: Mapped[Decimal | None] = mapped_column(Numeric(28, 2))
    tx_hash: Mapped[str] = mapped_column(String(66))
    block_number: Mapped[int] = mapped_column(BigInteger)
    block_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    log_index: Mapped[int] = mapped_column(Integer)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "protocol IN ('uniswap_v2','uniswap_v3','curve','sushiswap','balancer','1inch')",
            name="dex_protocol",
        ),
        UniqueConstraint("chain_id", "tx_hash", "log_index", name="uq_dex_swaps_log"),
        Index("ix_dex_swaps_sender", "chain_id", "sender", "block_timestamp"),
        Index("ix_dex_swaps_recipient", "chain_id", "recipient", "block_timestamp"),
        Index("ix_dex_swaps_pool", "chain_id", "pool_address", "block_number"),
    )
