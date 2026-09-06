from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# TIME OFF TYPE
# =========================================================

class TimeOffTypeBase(BaseModel):
    name: str
    description: str | None = None
    unit: str
    requires_allocation: bool = True
    requires_approval: bool = True
    is_paid: bool = True


class TimeOffTypeCreate(TimeOffTypeBase):
    pass


class TimeOffTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    unit: str | None = None
    requires_allocation: bool | None = None
    requires_approval: bool | None = None
    is_paid: bool | None = None
    is_active: bool | None = None


class TimeOffTypeResponse(TimeOffTypeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# LEAVE ALLOCATION
# =========================================================

class LeaveAllocationBase(BaseModel):
    employee_id: int
    leave_type_id: int
    allocated_amount: Decimal = Field(gt=0)
    start_date: date
    end_date: date


class LeaveAllocationCreate(LeaveAllocationBase):
    pass


class LeaveAllocationUpdate(BaseModel):
    allocated_amount: Decimal | None = Field(
        default=None,
        gt=0
    )
    start_date: date | None = None
    end_date: date | None = None


class LeaveAllocationResponse(LeaveAllocationBase):
    id: int
    used_amount: Decimal
    remaining_amount: Decimal
    status: str
    leave_type: TimeOffTypeResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# =========================================================
# LEAVE REQUEST
# =========================================================

class LeaveRequestBase(BaseModel):
    employee_id: int
    leave_type_id: int
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveRequestCreate(LeaveRequestBase):
    requested_amount: Decimal | None = Field(
        default=None,
        gt=0
    )

class LeaveRequestUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    reason: str | None = None


class LeaveRequestResponse(LeaveRequestBase):
    id: int
    requested_amount: Decimal
    status: str
    approved_by: int | None
    approved_at: datetime | None
    leave_type: TimeOffTypeResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)