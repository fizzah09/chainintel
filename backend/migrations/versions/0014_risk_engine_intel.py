"""Risk engine intelligence layer: sanctions_entries, exposure_edges, risk_factors

Revision ID: 0014
Revises: 0013
Create Date: 2026-11-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0014"
down_revision: str | None = "0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── sanctions_entries ────────────────────────────────────────────────────
    op.create_table(
        "sanctions_entries",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("list_source", sa.String(16), nullable=False),
        sa.Column("entity_ref", sa.String(64), nullable=False),
        sa.Column("entity_name", sa.Text(), nullable=False),
        sa.Column("entity_type", sa.String(16), nullable=False, server_default="entity"),
        sa.Column("program", sa.Text(), nullable=True),
        sa.Column("designation_reason", sa.Text(), nullable=True),
        sa.Column("designated_at", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("crypto_addresses", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("aliases", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("countries", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("raw_data", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("import_id", sa.BigInteger(), nullable=True),
        sa.Column("content_sha256", sa.String(64), nullable=False),
        sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "list_source IN ('OFAC_SDN','OFAC_CONS','EU','UK','UN')",
            name="sanctions_list_source",
        ),
        sa.ForeignKeyConstraint(["import_id"], ["label_imports.id"], name=op.f("fk_sanctions_entries_import_id")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sanctions_entries")),
        sa.UniqueConstraint("list_source", "entity_ref", name="uq_sanctions_entries_ref"),
    )
    op.create_index("ix_sanctions_entries_source", "sanctions_entries", ["list_source", "is_active"])

    # ── exposure_edges ───────────────────────────────────────────────────────
    _cats = "','".join([
        "sanctions", "mixer", "scam", "hack",
        "ransomware", "darknet", "phishing", "gambling",
    ])
    op.create_table(
        "exposure_edges",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("source_address", sa.String(42), nullable=False),
        sa.Column("target_address", sa.String(42), nullable=False),
        sa.Column("target_category", sa.String(16), nullable=False),
        sa.Column("target_label", sa.Text(), nullable=True),
        sa.Column("hop_distance", sa.Integer(), nullable=False),
        sa.Column("path_tx_hashes", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="[]"),
        sa.Column("value_eth", sa.Numeric(28, 8), nullable=False, server_default="0"),
        sa.Column("value_usd", sa.Numeric(28, 2), nullable=True),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(f"target_category IN ('{_cats}')", name="exposure_category"),
        sa.CheckConstraint("hop_distance BETWEEN 1 AND 5", name="hop_distance_range"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_exposure_edges")),
    )
    op.create_index(
        "ix_exposure_edges_source", "exposure_edges",
        ["tenant_id", "chain_id", "source_address", "hop_distance"],
    )
    op.create_index(
        "ix_exposure_edges_target", "exposure_edges",
        ["target_address", "target_category"],
    )

    # ── risk_factors ─────────────────────────────────────────────────────────
    op.create_table(
        "risk_factors",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column("assessment_id", sa.BigInteger(), nullable=False),
        sa.Column("tenant_id", sa.String(64), nullable=False),
        sa.Column("chain_id", sa.Integer(), nullable=False),
        sa.Column("address", sa.String(42), nullable=False),
        sa.Column("as_of", sa.DateTime(timezone=True), nullable=False),
        sa.Column("factor_type", sa.String(32), nullable=False),
        sa.Column("tier", sa.Integer(), nullable=False),
        sa.Column("raw_weight", sa.Integer(), nullable=False),
        sa.Column("evidence_confidence", sa.Numeric(3, 2), nullable=False),
        sa.Column("hop_decay", sa.Numeric(4, 3), nullable=False),
        sa.Column("recency_decay", sa.Numeric(4, 3), nullable=False),
        sa.Column("computed_contribution", sa.Numeric(6, 2), nullable=False),
        sa.Column("counterparty_address", sa.String(42), nullable=True),
        sa.Column("counterparty_label", sa.Text(), nullable=True),
        sa.Column("tx_hash", sa.String(66), nullable=True),
        sa.Column("amount_eth", sa.Numeric(28, 8), nullable=True),
        sa.Column("amount_usd", sa.Numeric(28, 2), nullable=True),
        sa.Column("tx_timestamp", sa.DateTime(timezone=True), nullable=True),
        sa.Column("hop_distance", sa.Integer(), nullable=True),
        sa.Column("source_name", sa.String(32), nullable=False),
        sa.Column("source_ref", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("tier BETWEEN 0 AND 3", name="risk_factor_tier"),
        sa.CheckConstraint("evidence_confidence BETWEEN 0 AND 1", name="risk_factor_confidence"),
        sa.CheckConstraint("hop_decay BETWEEN 0 AND 1", name="risk_factor_hop_decay"),
        sa.CheckConstraint("recency_decay BETWEEN 0 AND 1", name="risk_factor_recency_decay"),
        sa.ForeignKeyConstraint(
            ["assessment_id"], ["risk_assessments.id"],
            name=op.f("fk_risk_factors_assessment_id"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_risk_factors")),
    )
    op.create_index("ix_risk_factors_assessment", "risk_factors", ["assessment_id"])
    op.create_index(
        "ix_risk_factors_wallet", "risk_factors",
        ["tenant_id", "chain_id", "address", "as_of"],
    )

    # ── seed label sources for all four sanctions lists ──────────────────────
    op.execute("""
        INSERT INTO label_sources (key, name, url, licence, commercial_use, default_confidence, refresh, notes, updated_at)
        VALUES
            ('ofac_sdn', 'OFAC Specially Designated Nationals',
             'https://sanctionslist.ofac.treas.gov/Home/SdnList',
             'Public domain — U.S. Treasury publication', 'allowed', 1.00, 'daily',
             'Primary U.S. sanctions list. Crypto addresses tagged as Digital Currency Address.',
             NOW()),
            ('ofac_cons', 'OFAC Consolidated Sanctions List',
             'https://sanctionslist.ofac.treas.gov/Home/ConsolidatedList',
             'Public domain — U.S. Treasury publication', 'allowed', 1.00, 'daily',
             'Non-SDN consolidated programs.',
             NOW()),
            ('eu_sanctions', 'EU Consolidated Financial Sanctions',
             'https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions',
             'CC BY 4.0', 'allowed', 0.98, 'daily',
             'European Union sanctions — covers OFAC-equivalent designations.',
             NOW()),
            ('uk_sanctions', 'UK Sanctions List',
             'https://www.gov.uk/government/publications/the-uk-sanctions-list',
             'Open Government Licence v3.0', 'allowed', 0.98, 'daily',
             'Post-Brexit UK list. OFSI Consolidated List closed Jan 2026; this is the successor.',
             NOW()),
            ('un_sanctions', 'UN Security Council Consolidated List',
             'https://www.un.org/securitycouncil/content/un-sc-consolidated-list',
             'UN Terms of Use — non-commercial and commercial permitted with attribution', 'allowed', 0.95, 'weekly',
             'International baseline; fewer crypto addresses than OFAC.',
             NOW())
        ON CONFLICT (key) DO NOTHING;
    """)


def downgrade() -> None:
    op.drop_index("ix_risk_factors_wallet", table_name="risk_factors")
    op.drop_index("ix_risk_factors_assessment", table_name="risk_factors")
    op.drop_table("risk_factors")

    op.drop_index("ix_exposure_edges_target", table_name="exposure_edges")
    op.drop_index("ix_exposure_edges_source", table_name="exposure_edges")
    op.drop_table("exposure_edges")

    op.drop_index("ix_sanctions_entries_source", table_name="sanctions_entries")
    op.drop_table("sanctions_entries")

    op.execute("""
        DELETE FROM label_sources
        WHERE key IN ('ofac_sdn','ofac_cons','eu_sanctions','uk_sanctions','un_sanctions');
    """)
