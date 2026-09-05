from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Numeric, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Payrun(Base):
    __tablename__ = "payruns"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    period_start: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    period_end: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="Draft"
    )

    total_employees: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    total_gross: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    total_deductions: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
    )

    total_net: Mapped[Decimal] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0
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