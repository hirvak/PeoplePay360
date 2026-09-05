from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class PayslipLine(Base):
    __tablename__ = "payslip_lines"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    payslip_id: Mapped[int] = mapped_column(
        ForeignKey("payslips.id"),
        nullable=False,
        index=True
    )

    salary_rule_id: Mapped[int] = mapped_column(
        ForeignKey("salary_rules.id"),
        nullable=False,
        index=True
    )

    code: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    category: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    sequence: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    base_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    percentage: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    payslip = relationship(
        "Payslip",
        back_populates="lines"
    )

    salary_rule = relationship(
        "SalaryRule"
    )