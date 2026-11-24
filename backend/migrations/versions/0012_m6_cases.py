"""m6 case management tables

Revision ID: 0012
Revises: 0011
Create Date: 2026-11-18
"""

from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0012'
down_revision: str | None = '0011'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'cases',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('case_ref', sa.String(length=32), nullable=False),
        sa.Column('tenant_id', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=256), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='Open'),
        sa.Column('prev_status', sa.String(length=32), nullable=True),
        sa.Column('priority', sa.String(length=16), nullable=False, server_default='Medium'),
        sa.Column('case_type', sa.String(length=64), nullable=False, server_default='Investigation'),
        sa.Column('source', sa.String(length=128), nullable=False, server_default=''),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False),
        sa.Column('assigned_to', sa.String(length=128), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_by', sa.String(length=128), nullable=True),
        sa.Column('close_reason', sa.Text(), nullable=True),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_cases')),
        sa.UniqueConstraint('public_id', name=op.f('uq_cases_public_id')),
        sa.UniqueConstraint('case_ref', name=op.f('uq_cases_case_ref')),
    )
    op.create_index('ix_cases_tenant', 'cases', ['tenant_id', 'created_at'])
    op.create_index('ix_cases_status', 'cases', ['tenant_id', 'status'])

    op.create_table(
        'case_subjects',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('case_id', sa.BigInteger(), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('kind', sa.String(length=32), nullable=False),
        sa.Column('ref', sa.String(length=256), nullable=False),
        sa.Column('role', sa.String(length=64), nullable=False, server_default='Primary'),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('added_by', sa.String(length=128), nullable=False),
        sa.Column('chain_id', sa.Integer(), nullable=True),
        sa.Column('risk_score', sa.Integer(), nullable=True),
        sa.Column('label', sa.String(length=128), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_subjects')),
    )

    op.create_table(
        'case_evidence',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('public_id', sa.String(length=36), nullable=False),
        sa.Column('case_id', sa.BigInteger(), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=256), nullable=False),
        sa.Column('evidence_type', sa.String(length=64), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('hash_sha256', sa.String(length=64), nullable=True),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('added_by', sa.String(length=128), nullable=False),
        sa.Column('tags', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_evidence')),
        sa.UniqueConstraint('public_id', name=op.f('uq_case_evidence_public_id')),
    )

    op.create_table(
        'case_notes',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('case_id', sa.BigInteger(), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=128), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_internal', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_notes')),
    )

    op.create_table(
        'case_tasks',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('case_id', sa.BigInteger(), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=256), nullable=False),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='Open'),
        sa.Column('assignee', sa.String(length=128), nullable=True),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=128), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_tasks')),
    )

    op.create_table(
        'case_messages',
        sa.Column('id', sa.BigInteger(), sa.Identity(always=False), nullable=False),
        sa.Column('case_id', sa.BigInteger(), sa.ForeignKey('cases.id', ondelete='CASCADE'), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('author', sa.String(length=128), nullable=False),
        sa.Column('at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_system', sa.Boolean(), nullable=False, server_default='false'),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_case_messages')),
    )


def downgrade() -> None:
    op.drop_table('case_messages')
    op.drop_table('case_tasks')
    op.drop_table('case_notes')
    op.drop_table('case_evidence')
    op.drop_table('case_subjects')
    op.drop_index('ix_cases_status', table_name='cases')
    op.drop_index('ix_cases_tenant', table_name='cases')
    op.drop_table('cases')
