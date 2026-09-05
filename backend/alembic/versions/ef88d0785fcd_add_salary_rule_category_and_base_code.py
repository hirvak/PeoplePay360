"""add salary rule category and base code

Revision ID: ef88d0785fcd
Revises: af38f7dbb7d1
Create Date: 2026-09-05
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ef88d0785fcd"
down_revision: Union[str, Sequence[str], None] = "af38f7dbb7d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "salary_rules",
        sa.Column(
            "category",
            sa.String(length=20),
            nullable=False,
            server_default="EARNING"
        )
    )

    op.add_column(
        "salary_rules",
        sa.Column(
            "base_code",
            sa.String(length=50),
            nullable=True
        )
    )

    op.alter_column(
        "salary_rules",
        "category",
        server_default=None
    )


def downgrade() -> None:
    op.drop_column(
        "salary_rules",
        "base_code"
    )

    op.drop_column(
        "salary_rules",
        "category"
    )