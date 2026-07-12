"""add actual_distance to trips

Revision ID: e63ba9453321
Revises: f6d183153e2c
Create Date: 2026-07-12 12:47:35.570317

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e63ba9453321'
down_revision: Union[str, None] = 'f6d183153e2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "trips",
        sa.Column("actual_distance", sa.Float(), nullable=True)
    )

def downgrade():
    op.drop_column("trips", "actual_distance")