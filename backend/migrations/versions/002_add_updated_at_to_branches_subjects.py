"""002_add_updated_at_to_branches_subjects

Revision ID: 002_add_updated_at
Revises: 001_initial_schema
Create Date: 2026-09-03 13:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "002_add_updated_at"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)

    # Check and add updated_at to branches
    branch_cols = [c["name"] for c in insp.get_columns("branches")]
    if "updated_at" not in branch_cols:
        op.add_column(
            "branches",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
        )

    # Check and add updated_at to subjects
    subject_cols = [c["name"] for c in insp.get_columns("subjects")]
    if "updated_at" not in subject_cols:
        op.add_column(
            "subjects",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                nullable=False,
                server_default=sa.text("now()"),
            ),
        )


def downgrade() -> None:
    conn = op.get_bind()
    insp = sa.inspect(conn)

    branch_cols = [c["name"] for c in insp.get_columns("branches")]
    if "updated_at" in branch_cols:
        op.drop_column("branches", "updated_at")

    subject_cols = [c["name"] for c in insp.get_columns("subjects")]
    if "updated_at" in subject_cols:
        op.drop_column("subjects", "updated_at")
