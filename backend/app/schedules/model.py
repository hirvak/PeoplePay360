from datetime import datetime, time

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Time, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    schedule_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    weekly_hours: Mapped[float] = mapped_column(
        nullable=False,
        default=0
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
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

    days = relationship(
        "ScheduleDay",
        back_populates="schedule",
        cascade="all, delete-orphan"
    )


class ScheduleDay(Base):
    __tablename__ = "schedule_days"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    schedule_id: Mapped[int] = mapped_column(
        ForeignKey("schedules.id"),
        nullable=False,
        index=True
    )

    day_of_week: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    break_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    schedule = relationship(
        "Schedule",
        back_populates="days"
    )