from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# ============================================================
# PAYRUN CREATION - STEP 1
# ============================================================

class PayrunBase(BaseModel):
    name: str
    period_start: date
    period_end: date
    salary_structure_id: int


# ============================================================
# PAYRUN CREATION - STEP 2
# ============================================================

class PayrunCreate(PayrunBase):
    selected_employee_ids: list[int] = Field(
        min_length=1
    )


# ============================================================
# PAYRUN UPDATE
# ============================================================

class PayrunUpdate(BaseModel):
    name: str | None = None
    period_start: date | None = None
    period_end: date | None = None
    salary_structure_id: int | None = None
    selected_employee_ids: list[int] | None = Field(
        default=None,
        min_length=1
    )


# ============================================================
# PAYRUN RESPONSE
# ============================================================

class PayrunResponse(PayrunBase):
    id: int
    selected_employee_ids: list[int]
    status: str

    total_employees: int
    total_gross: Decimal
    total_deductions: Decimal
    total_net: Decimal

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )