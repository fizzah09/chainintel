"""r2 label networks: non-EVM addresses (Bitcoin, Tron ...) on address_labels

Revision ID: 0009
Revises: 0008
Create Date: 2026-11-17 23:10:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '0009'
down_revision: str | None = '0008'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column('address_labels', sa.Column('network', sa.String(length=16), server_default='evm', nullable=False))
    op.alter_column('address_labels', 'address', type_=sa.String(length=128), existing_type=sa.String(length=42),
                    existing_nullable=False)
    op.create_check_constraint(
        op.f('ck_address_labels_network'), 'address_labels',
        "network ~ '^[a-z_]{2,16}$' AND (network = 'evm' OR chain_id = 0)",
    )
    op.drop_index('uq_address_labels_current', table_name='address_labels', postgresql_where=sa.text('valid_to IS NULL'))
    op.drop_index('ix_address_labels_address', table_name='address_labels')
    op.create_index('ix_address_labels_address', 'address_labels', ['address', 'network', 'chain_id'], unique=False)
    op.create_index('uq_address_labels_current', 'address_labels', ['source_key', 'network', 'chain_id', 'address'],
                    unique=True, postgresql_where=sa.text('valid_to IS NULL'))


def downgrade() -> None:
    op.execute("DELETE FROM address_labels WHERE network <> 'evm'")
    op.drop_index('uq_address_labels_current', table_name='address_labels', postgresql_where=sa.text('valid_to IS NULL'))
    op.drop_index('ix_address_labels_address', table_name='address_labels')
    op.create_index('ix_address_labels_address', 'address_labels', ['address', 'chain_id'], unique=False)
    op.create_index('uq_address_labels_current', 'address_labels', ['source_key', 'chain_id', 'address'],
                    unique=True, postgresql_where=sa.text('valid_to IS NULL'))
    op.drop_constraint(op.f('ck_address_labels_network'), 'address_labels', type_='check')
    op.alter_column('address_labels', 'address', type_=sa.String(length=42), existing_type=sa.String(length=128),
                    existing_nullable=False)
    op.drop_column('address_labels', 'network')
