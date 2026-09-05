from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PayrunBase(BaseModel):
    name: str
    period_start: date
    period_end: date


class PayrunCreate(PayrunBase):
    pass


class PayrunUpdate(BaseModel):
    name: str | None = None
    period_start: date | None = None
    period_end: date | None = None


class PayrunResponse(PayrunBase):
    id: int
    status: str
    total_employees: int
    total_gross: Decimal
    total_deductions: Decimal
    total_net: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)