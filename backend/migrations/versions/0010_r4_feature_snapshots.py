"""r4 feature store: append-only wallet feature snapshots

Revision ID: 0010
Revises: 0009
Create Date: 2026-11-17 23:50:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0010'
down_revision: str | None = '0009'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'feature_snapshots',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.Uuid(), nullable=False),
        sa.Column('tenant_id', sa.String(length=64), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=False),
        sa.Column('address', sa.String(length=42), nullable=False),
        sa.Column('as_of', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False),
        sa.Column('feature_set', sa.String(length=64), nullable=False),
        sa.Column('transfers', sa.Integer(), nullable=False),
        sa.Column('features', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('feature_sha256', sa.String(length=64), nullable=False),
        sa.Column('data_quality', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_feature_snapshots')),
        sa.UniqueConstraint('public_id', name=op.f('uq_feature_snapshots_public_id')),
    )
    op.create_index('ix_feature_snapshots_wallet', 'feature_snapshots', ['tenant_id', 'chain_id', 'address', 'as_of'],
                    unique=False)
    op.execute("CREATE TRIGGER feature_snapshots_append_only BEFORE UPDATE OR DELETE ON feature_snapshots "
               "FOR EACH ROW EXECUTE FUNCTION forbid_update_delete()")


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS feature_snapshots_append_only ON feature_snapshots")
    op.drop_index('ix_feature_snapshots_wallet', table_name='feature_snapshots')
    op.drop_table('feature_snapshots')
