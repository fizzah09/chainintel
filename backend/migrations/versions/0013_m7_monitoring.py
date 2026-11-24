"""m7 monitoring: watchlists and alerts

Revision ID: 0013
Revises: 0012
Create Date: 2026-11-18
"""

from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0013'
down_revision: str | None = '0012'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'watchlists',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=64), nullable=False),
        sa.Column('name', sa.String(length=128), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('scope', sa.String(length=32), nullable=False, server_default='Private'),
        sa.Column('rule_type', sa.String(length=32), nullable=False, server_default='threshold'),
        sa.Column('rule_value', sa.String(length=64), nullable=False, server_default='50'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_watchlists')),
        sa.UniqueConstraint('public_id', name=op.f('uq_watchlists_public_id')),
    )
    op.create_index('ix_watchlists_tenant', 'watchlists', ['tenant_id'])

    op.create_table(
        'watchlist_entries',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('watchlist_id', sa.BigInteger(), sa.ForeignKey('watchlists.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('address', sa.String(length=42), nullable=False),
        sa.Column('label', sa.String(length=128), nullable=True),
        sa.Column('risk_score', sa.Integer(), nullable=True),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('added_by', sa.String(length=128), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_watchlist_entries')),
    )
    op.create_index('ix_watchlist_entries_address', 'watchlist_entries', ['watchlist_id', 'address'])

    op.create_table(
        'alerts',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=64), nullable=False),
        sa.Column('watchlist_id', sa.BigInteger(), sa.ForeignKey('watchlists.id', ondelete='SET NULL'), nullable=True),
        sa.Column('chain_id', sa.Integer(), nullable=False),
        sa.Column('wallet', sa.String(length=42), nullable=False),
        sa.Column('trigger', sa.String(length=128), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('tier', sa.String(length=16), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='New'),
        sa.Column('at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.String(length=128), nullable=True),
        sa.Column('resolution', sa.Text(), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_alerts')),
        sa.UniqueConstraint('public_id', name=op.f('uq_alerts_public_id')),
    )
    op.create_index('ix_alerts_tenant', 'alerts', ['tenant_id', 'at'])
    op.create_index('ix_alerts_wallet', 'alerts', ['tenant_id', 'wallet'])
    op.create_index('ix_alerts_status', 'alerts', ['tenant_id', 'status'])


def downgrade() -> None:
    op.drop_index('ix_alerts_status', table_name='alerts')
    op.drop_index('ix_alerts_wallet', table_name='alerts')
    op.drop_index('ix_alerts_tenant', table_name='alerts')
    op.drop_table('alerts')
    op.drop_index('ix_watchlist_entries_address', table_name='watchlist_entries')
    op.drop_table('watchlist_entries')
    op.drop_index('ix_watchlists_tenant', table_name='watchlists')
    op.drop_table('watchlists')
