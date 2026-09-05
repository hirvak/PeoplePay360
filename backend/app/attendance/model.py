from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, String, Time, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id"),
        nullable=False,
        index=True
    )

    attendance_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    check_in: Mapped[time | None] = mapped_column(
        Time,
        nullable=True
    )

    check_out: Mapped[time | None] = mapped_column(
        Time,
        nullable=True
    )

    worked_hours: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Present"
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

    employee = relationship("Employee")