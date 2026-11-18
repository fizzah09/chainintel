"""m5 fund flow trace runs

Revision ID: 0011
Revises: 0010
Create Date: 2026-11-18
"""

from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0011'
down_revision: str | None = '0010'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'trace_runs',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('tenant_id', sa.String(length=64), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=False),
        sa.Column('start_address', sa.String(length=42), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False),
        sa.Column('hops', sa.Integer(), nullable=False),
        sa.Column('direction', sa.String(length=32), nullable=False),
        sa.Column('period_days', sa.Integer(), nullable=False),
        sa.Column('min_usd', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('method', sa.String(length=32), nullable=False),
        sa.Column('as_of', sa.DateTime(timezone=True), nullable=False),
        sa.Column('total_nodes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_edges', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('truncated', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('nodes', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('edges', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('path', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_trace_runs')),
        sa.UniqueConstraint('public_id', name=op.f('uq_trace_runs_public_id')),
    )
    op.create_index('ix_trace_runs_tenant', 'trace_runs', ['tenant_id', 'chain_id', 'start_address', 'created_at'])


def downgrade() -> None:
    op.drop_index('ix_trace_runs_tenant', table_name='trace_runs')
    op.drop_table('trace_runs')
