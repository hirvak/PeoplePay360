from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SalaryStructureBase(BaseModel):
    name: str
    code: str
    description: str | None = None


class SalaryStructureCreate(SalaryStructureBase):
    pass


class SalaryStructureUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    is_active: bool | None = None


class SalaryStructureResponse(SalaryStructureBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)