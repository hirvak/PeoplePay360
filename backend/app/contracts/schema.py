from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ContractBase(BaseModel):
    employee_id: int
    start_date: date
    end_date: date | None = None
    department_id: int | None = None
    schedule_id: int | None = None
    job_position: str
    wage: Decimal
    status: str = "Active"


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    department_id: int | None = None
    schedule_id: int | None = None
    job_position: str | None = None
    wage: Decimal | None = None
    status: str | None = None
    is_active: bool | None = None


class ContractResponse(ContractBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)