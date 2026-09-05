from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


class ScheduleDayBase(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time
    break_minutes: int = Field(default=0, ge=0)


class ScheduleDayCreate(ScheduleDayBase):
    pass


class ScheduleDayResponse(ScheduleDayBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ScheduleBase(BaseModel):
    name: str
    schedule_type: str


class ScheduleCreate(ScheduleBase):
    days: list[ScheduleDayCreate]


class ScheduleUpdate(BaseModel):
    name: str | None = None
    schedule_type: str | None = None
    days: list[ScheduleDayCreate] | None = None
    is_active: bool | None = None


class ScheduleResponse(ScheduleBase):
    id: int
    weekly_hours: float
    is_active: bool
    days: list[ScheduleDayResponse]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)