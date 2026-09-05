from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=True
    )

    employee_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True
    )

    schedule_id: Mapped[int | None] = mapped_column(
        ForeignKey("schedules.id"),
        nullable=True
    )

    manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("employees.id"),
        nullable=True
    )

    job_position: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    employment_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Active"
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

    # Relationships
    user = relationship("User")

    department = relationship("Department")
    schedule = relationship("Schedule")
    manager = relationship(
        "Employee",
        remote_side=[id]
    )