from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SalaryRuleBase(BaseModel):
    salary_structure_id: int
    name: str
    code: str
    sequence: int = Field(gt=0)
    rule_type: str
    amount: Decimal | None = None
    percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100
    )
    formula: str | None = None


class SalaryRuleCreate(SalaryRuleBase):
    pass


class SalaryRuleUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    sequence: int | None = Field(default=None, gt=0)
    rule_type: str | None = None
    amount: Decimal | None = None
    percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100
    )
    formula: str | None = None
    is_active: bool | None = None


class SalaryRuleResponse(SalaryRuleBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)