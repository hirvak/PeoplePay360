from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    department_id: int | None = None
    manager_id: int | None = None
    job_position: str
    employment_status: str = "Active"


class EmployeeCreate(EmployeeBase):
    user_id: int | None = None


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    department_id: int | None = None
    manager_id: int | None = None
    job_position: str | None = None
    employment_status: str | None = None
    is_active: bool | None = None


class EmployeeResponse(EmployeeBase):
    id: int
    user_id: int | None
    user_email: str | None = None
    user_role: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)