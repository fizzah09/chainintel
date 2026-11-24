"""Add tc_events, dex_swaps tables and seed remaining intel label sources.

Revision ID: 0016
Revises: 0015
Create Date: 2026-11-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0016"
down_revision: str | None = "0015"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── tc_events ────────────────────────────────────────────────────────────
    op.create_table(
        "tc_events",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("contract_address", sa.String(42), nullable=False),
        sa.Column("event_type", sa.String(16), nullable=False),
        sa.Column("commitment", sa.String(66), nullable=True),
        sa.Column("leaf_index", sa.Integer(), nullable=True),
        sa.Column("nullifier_hash", sa.String(66), nullable=True),
        sa.Column("to_address", sa.String(42), nullable=True),
        sa.Column("relayer", sa.String(42), nullable=True),
        sa.Column("fee", sa.Numeric(28, 8), nullable=True),
        sa.Column("denomination_eth", sa.Numeric(28, 8), nullable=True),
        sa.Column("denomination_token", sa.String(8), nullable=False, server_default="ETH"),
        sa.Column("tx_hash", sa.String(66), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("block_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("log_index", sa.Integer(), nullable=False),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("event_type IN ('deposit','withdrawal')", name="tc_event_type"),
        sa.UniqueConstraint("chain_id", "tx_hash", "log_index", name="uq_tc_events_log"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tc_events")),
    )
    op.create_index("ix_tc_events_contract", "tc_events", ["chain_id", "contract_address", "event_type"])
    op.create_index("ix_tc_events_recipient", "tc_events", ["to_address"])
    op.create_index("ix_tc_events_block", "tc_events", ["chain_id", "block_number"])

    # ── dex_swaps ────────────────────────────────────────────────────────────
    _protocols = "','".join(["uniswap_v2", "uniswap_v3", "curve", "sushiswap", "balancer", "1inch"])
    op.create_table(
        "dex_swaps",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("protocol", sa.String(16), nullable=False),
        sa.Column("pool_address", sa.String(42), nullable=False),
        sa.Column("sender", sa.String(42), nullable=False),
        sa.Column("recipient", sa.String(42), nullable=False),
        sa.Column("token_in", sa.String(42), nullable=False),
        sa.Column("token_out", sa.String(42), nullable=False),
        sa.Column("symbol_in", sa.String(16), nullable=True),
        sa.Column("symbol_out", sa.String(16), nullable=True),
        sa.Column("amount_in", sa.Numeric(78, 0), nullable=False),
        sa.Column("amount_out", sa.Numeric(78, 0), nullable=False),
        sa.Column("amount_in_usd", sa.Numeric(28, 2), nullable=True),
        sa.Column("amount_out_usd", sa.Numeric(28, 2), nullable=True),
        sa.Column("tx_hash", sa.String(66), nullable=False),
        sa.Column("block_number", sa.BigInteger(), nullable=False),
        sa.Column("block_timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("log_index", sa.Integer(), nullable=False),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(f"protocol IN ('{_protocols}')", name="dex_protocol"),
        sa.UniqueConstraint("chain_id", "tx_hash", "log_index", name="uq_dex_swaps_log"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_dex_swaps")),
    )
    op.create_index("ix_dex_swaps_sender",    "dex_swaps", ["chain_id", "sender",    "block_timestamp"])
    op.create_index("ix_dex_swaps_recipient", "dex_swaps", ["chain_id", "recipient", "block_timestamp"])
    op.create_index("ix_dex_swaps_pool",      "dex_swaps", ["chain_id", "pool_address", "block_number"])

    # ── seed new label sources ────────────────────────────────────────────────
    op.execute("""
        INSERT INTO label_sources
            (key, name, url, licence, commercial_use, default_confidence, refresh, notes, updated_at)
        VALUES
            ('eu_consolidated',
             'EU Consolidated Financial Sanctions (XML)',
             'https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content',
             'CC BY 4.0', 'allowed', 0.98, 'daily',
             'Official EU sanctions XML via Europa webgate. Crypto addresses in identificationDocument.',
             NOW()),

            ('uk_ofsi',
             'UK OFSI Consolidated List (JSON)',
             'https://ofsistorage.blob.core.windows.net/publishlive/2022format/ConList.json',
             'Open Government Licence v3.0', 'allowed', 0.98, 'daily',
             'OFSI post-Brexit UK sanctions in JSON format. FinancialIdentifiers section has crypto.',
             NOW()),

            ('un_consolidated',
             'UN Security Council Consolidated List (XML)',
             'https://scsanctions.un.org/resources/xml/en/consolidated.xml',
             'UN Terms of Use — non-commercial and commercial permitted with attribution', 'allowed', 0.95, 'weekly',
             'UN SC 1267/1988/1718 committee list. INDIVIDUAL and ENTITY sections.',
             NOW()),

            ('dune_analytics',
             'Dune Analytics Community Labels',
             'https://api.dune.com/api/v1',
             'Mixed — per query, mostly CC BY 4.0', 'allowed', 0.72, 'weekly',
             'Community SQL queries for labeled Ethereum addresses. Requires DUNE_API_KEY.',
             NOW())
        ON CONFLICT (key) DO NOTHING;
    """)


def downgrade() -> None:
    op.drop_index("ix_dex_swaps_pool",      table_name="dex_swaps")
    op.drop_index("ix_dex_swaps_recipient", table_name="dex_swaps")
    op.drop_index("ix_dex_swaps_sender",    table_name="dex_swaps")
    op.drop_table("dex_swaps")

    op.drop_index("ix_tc_events_block",     table_name="tc_events")
    op.drop_index("ix_tc_events_recipient", table_name="tc_events")
    op.drop_index("ix_tc_events_contract",  table_name="tc_events")
    op.drop_table("tc_events")

    op.execute("""
        DELETE FROM label_sources
        WHERE key IN ('eu_consolidated','uk_ofsi','un_consolidated','dune_analytics');
    """)
