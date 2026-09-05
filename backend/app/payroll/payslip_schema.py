from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PayslipBase(BaseModel):
    payrun_id: int
    employee_id: int
    contract_id: int
    salary_structure_id: int
    period_start: date
    period_end: date
    basic_wage: Decimal


class PayslipCreate(PayslipBase):
    pass


class PayslipUpdate(BaseModel):
    status: str | None = None


class PayslipResponse(PayslipBase):
    id: int
    gross_amount: Decimal
    deduction_amount: Decimal
    net_amount: Decimal
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )