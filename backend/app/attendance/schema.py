from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict


class AttendanceBase(BaseModel):
    employee_id: int
    attendance_date: date
    check_in: time | None = None
    check_out: time | None = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    attendance_date: date | None = None
    check_in: time | None = None
    check_out: time | None = None


class AttendanceResponse(AttendanceBase):
    id: int
    worked_hours: float
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)