from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PayslipLineBase(BaseModel):
    payslip_id: int
    salary_rule_id: int
    code: str
    name: str
    category: str
    sequence: int
    base_amount: Decimal
    percentage: Decimal | None = None
    amount: Decimal


class PayslipLineCreate(PayslipLineBase):
    pass


class PayslipLineResponse(PayslipLineBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )