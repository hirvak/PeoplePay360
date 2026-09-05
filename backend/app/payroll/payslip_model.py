from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Payslip(Base):
    __tablename__ = "payslips"

    __table_args__ = (
        UniqueConstraint(
            "payrun_id",
            "employee_id",
            name="uq_payslip_payrun_employee"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    payrun_id: Mapped[int] = mapped_column(
        ForeignKey("payruns.id"),
        nullable=False,
        index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False,
        index=True
    )

    contract_id: Mapped[int] = mapped_column(
        ForeignKey("contracts.id"),
        nullable=False,
        index=True
    )

    salary_structure_id: Mapped[int] = mapped_column(
        ForeignKey("salary_structures.id"),
        nullable=False,
        index=True
    )

    period_start: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    period_end: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    basic_wage: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False
    )

    gross_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    deduction_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    net_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Draft"
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

    payrun = relationship(
        "Payrun"
    )

    employee = relationship(
        "Employee"
    )

    contract = relationship(
        "Contract"
    )

    salary_structure = relationship(
        "SalaryStructure"
    )

    lines = relationship(
        "PayslipLine",
        back_populates="payslip",
        cascade="all, delete-orphan"
    )