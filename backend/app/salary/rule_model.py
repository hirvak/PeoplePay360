from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class SalaryRule(Base):
    __tablename__ = "salary_rules"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    salary_structure_id: Mapped[int] = mapped_column(
        ForeignKey("salary_structures.id"),
        nullable=False,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    sequence: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    rule_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True
    )

    formula: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    salary_structure = relationship(
        "SalaryStructure"
    )