from datetime import date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.leave.model import (
    TimeOffType,
    LeaveAllocation,
    LeaveRequest,
)
from app.leave.schema import (
    TimeOffTypeCreate,
    TimeOffTypeUpdate,
    LeaveAllocationCreate,
    LeaveAllocationUpdate,
    LeaveRequestCreate,
    LeaveRequestUpdate,
)
from app.employees.model import Employee
from app.auth.model import User


# =========================================================
# TIME OFF TYPE
# =========================================================

def create_time_off_type(
    db: Session,
    type_data: TimeOffTypeCreate
):
    if type_data.unit not in {"Days", "Hours"}:
        raise ValueError("Unit must be either Days or Hours")

    existing_type = db.query(TimeOffType).filter(
        TimeOffType.name == type_data.name
    ).first()

    if existing_type:
        raise ValueError("Time Off Type already exists")

    time_off_type = TimeOffType(
        name=type_data.name,
        description=type_data.description,
        unit=type_data.unit,
        requires_allocation=type_data.requires_allocation,
        requires_approval=type_data.requires_approval,
        is_paid=type_data.is_paid,
    )

    db.add(time_off_type)
    db.commit()
    db.refresh(time_off_type)

    return time_off_type


def get_time_off_types(db: Session):
    return (
        db.query(TimeOffType)
        .order_by(TimeOffType.id)
        .all()
    )


def get_time_off_type(
    db: Session,
    type_id: int
):
    return db.query(TimeOffType).filter(
        TimeOffType.id == type_id
    ).first()


def update_time_off_type(
    db: Session,
    time_off_type: TimeOffType,
    type_data: TimeOffTypeUpdate
):
    update_data = type_data.model_dump(
        exclude_unset=True
    )

    if "unit" in update_data:
        if update_data["unit"] not in {"Days", "Hours"}:
            raise ValueError("Unit must be either Days or Hours")

    if "name" in update_data:
        existing_type = db.query(TimeOffType).filter(
            TimeOffType.name == update_data["name"],
            TimeOffType.id != time_off_type.id
        ).first()

        if existing_type:
            raise ValueError("Time Off Type already exists")

    for field, value in update_data.items():
        setattr(time_off_type, field, value)

    db.commit()
    db.refresh(time_off_type)

    return time_off_type


def delete_time_off_type(
    db: Session,
    time_off_type: TimeOffType
):
    time_off_type.is_active = False

    db.commit()
    db.refresh(time_off_type)

    return time_off_type


# =========================================================
# LEAVE ALLOCATION
# =========================================================

def validate_allocation_dates(
    start_date: date,
    end_date: date
):
    if end_date < start_date:
        raise ValueError(
            "Allocation end date cannot be before start date"
        )


def create_leave_allocation(
    db: Session,
    allocation_data: LeaveAllocationCreate
):
    employee = db.query(Employee).filter(
        Employee.id == allocation_data.employee_id
    ).first()

    if not employee:
        raise ValueError("Employee not found")

    leave_type = db.query(TimeOffType).filter(
        TimeOffType.id == allocation_data.leave_type_id,
        TimeOffType.is_active.is_(True)
    ).first()

    if not leave_type:
        raise ValueError("Active Time Off Type not found")

    validate_allocation_dates(
        allocation_data.start_date,
        allocation_data.end_date
    )

    allocated_amount = allocation_data.allocated_amount

    allocation = LeaveAllocation(
        employee_id=allocation_data.employee_id,
        leave_type_id=allocation_data.leave_type_id,
        allocated_amount=allocated_amount,
        used_amount=Decimal("0"),
        remaining_amount=allocated_amount,
        start_date=allocation_data.start_date,
        end_date=allocation_data.end_date,
        status="Pending",
    )

    db.add(allocation)
    db.commit()
    db.refresh(allocation)

    return allocation


def get_leave_allocations(db: Session):
    return (
        db.query(LeaveAllocation)
        .order_by(LeaveAllocation.id)
        .all()
    )


def get_leave_allocation(
    db: Session,
    allocation_id: int
):
    return db.query(LeaveAllocation).filter(
        LeaveAllocation.id == allocation_id
    ).first()


def update_leave_allocation(
    db: Session,
    allocation: LeaveAllocation,
    allocation_data: LeaveAllocationUpdate
):
    update_data = allocation_data.model_dump(
        exclude_unset=True
    )

    new_start_date = update_data.get(
        "start_date",
        allocation.start_date
    )

    new_end_date = update_data.get(
        "end_date",
        allocation.end_date
    )

    validate_allocation_dates(
        new_start_date,
        new_end_date
    )

    if "allocated_amount" in update_data:
        new_allocated_amount = update_data["allocated_amount"]

        if new_allocated_amount < allocation.used_amount:
            raise ValueError(
                "Allocated amount cannot be less than used amount"
            )

        allocation.allocated_amount = new_allocated_amount
        allocation.remaining_amount = (
            new_allocated_amount - allocation.used_amount
        )

    if "start_date" in update_data:
        allocation.start_date = update_data["start_date"]

    if "end_date" in update_data:
        allocation.end_date = update_data["end_date"]

    db.commit()
    db.refresh(allocation)

    return allocation


def approve_leave_allocation(
    db: Session,
    allocation: LeaveAllocation
):
    if allocation.status == "Approved":
        raise ValueError("Allocation is already approved")

    if allocation.status == "Rejected":
        raise ValueError(
            "Rejected allocation cannot be approved"
        )

    allocation.status = "Approved"

    db.commit()
    db.refresh(allocation)

    return allocation


def reject_leave_allocation(
    db: Session,
    allocation: LeaveAllocation
):
    if allocation.status == "Approved":
        raise ValueError(
            "Approved allocation cannot be rejected"
        )

    allocation.status = "Rejected"

    db.commit()
    db.refresh(allocation)

    return allocation


def delete_leave_allocation(
    db: Session,
    allocation: LeaveAllocation
):
    db.delete(allocation)
    db.commit()

    return allocation


# =========================================================
# LEAVE REQUEST
# =========================================================

def calculate_requested_amount(
    leave_type: TimeOffType,
    start_date: date,
    end_date: date,
    requested_amount: Decimal | None
) -> Decimal:

    if end_date < start_date:
        raise ValueError(
            "Leave end date cannot be before start date"
        )

    if leave_type.unit == "Days":
        days = (end_date - start_date).days + 1
        return Decimal(str(days))

    if leave_type.unit == "Hours":
        if requested_amount is None:
            raise ValueError(
                "Requested amount is required for hourly leave"
            )

        return requested_amount

    raise ValueError("Invalid Time Off Type unit")


def find_applicable_allocation(
    db: Session,
    employee_id: int,
    leave_type_id: int,
    start_date: date,
    end_date: date
):
    return (
        db.query(LeaveAllocation)
        .filter(
            LeaveAllocation.employee_id == employee_id,
            LeaveAllocation.leave_type_id == leave_type_id,
            LeaveAllocation.status == "Approved",
            LeaveAllocation.start_date <= start_date,
            LeaveAllocation.end_date >= end_date,
        )
        .order_by(LeaveAllocation.id)
        .first()
    )


def create_leave_request(
    db: Session,
    request_data: LeaveRequestCreate
):
    employee = db.query(Employee).filter(
        Employee.id == request_data.employee_id
    ).first()

    if not employee:
        raise ValueError("Employee not found")

    leave_type = db.query(TimeOffType).filter(
        TimeOffType.id == request_data.leave_type_id,
        TimeOffType.is_active.is_(True)
    ).first()

    if not leave_type:
        raise ValueError("Active Time Off Type not found")

    requested_amount = calculate_requested_amount(
        leave_type=leave_type,
        start_date=request_data.start_date,
        end_date=request_data.end_date,
        requested_amount=request_data.requested_amount,
    )

    allocation = None

    if leave_type.requires_allocation:
        allocation = find_applicable_allocation(
            db=db,
            employee_id=request_data.employee_id,
            leave_type_id=request_data.leave_type_id,
            start_date=request_data.start_date,
            end_date=request_data.end_date,
        )

        if not allocation:
            raise ValueError(
                "No approved allocation available for this leave period"
            )

        if allocation.remaining_amount < requested_amount:
            raise ValueError(
                "Insufficient leave allocation"
            )

    status = (
        "Pending"
        if leave_type.requires_approval
        else "Approved"
    )

    leave_request = LeaveRequest(
        employee_id=request_data.employee_id,
        leave_type_id=request_data.leave_type_id,
        start_date=request_data.start_date,
        end_date=request_data.end_date,
        requested_amount=requested_amount,
        reason=request_data.reason,
        status=status,
    )

    db.add(leave_request)

    # If approval is not required, deduct immediately.
    if status == "Approved" and allocation:
        allocation.used_amount += requested_amount
        allocation.remaining_amount -= requested_amount

    db.commit()
    db.refresh(leave_request)

    return leave_request


def get_leave_requests(db: Session):
    return (
        db.query(LeaveRequest)
        .order_by(
            LeaveRequest.created_at.desc()
        )
        .all()
    )


def get_leave_request(
    db: Session,
    request_id: int
):
    return db.query(LeaveRequest).filter(
        LeaveRequest.id == request_id
    ).first()


def update_leave_request(
    db: Session,
    leave_request: LeaveRequest,
    request_data: LeaveRequestUpdate
):
    if leave_request.status != "Pending":
        raise ValueError(
            "Only pending leave requests can be updated"
        )

    update_data = request_data.model_dump(
        exclude_unset=True
    )

    new_start_date = update_data.get(
        "start_date",
        leave_request.start_date
    )

    new_end_date = update_data.get(
        "end_date",
        leave_request.end_date
    )

    if new_end_date < new_start_date:
        raise ValueError(
            "Leave end date cannot be before start date"
        )

    leave_type = db.query(TimeOffType).filter(
        TimeOffType.id == leave_request.leave_type_id,
        TimeOffType.is_active.is_(True)
    ).first()

    if not leave_type:
        raise ValueError(
            "Active Time Off Type not found"
        )

    requested_amount = calculate_requested_amount(
        leave_type=leave_type,
        start_date=new_start_date,
        end_date=new_end_date,
        requested_amount=(
            leave_request.requested_amount
            if leave_type.unit == "Hours"
            else None
        ),
    )

    if leave_type.requires_allocation:
        allocation = find_applicable_allocation(
            db=db,
            employee_id=leave_request.employee_id,
            leave_type_id=leave_request.leave_type_id,
            start_date=new_start_date,
            end_date=new_end_date,
        )

        if not allocation:
            raise ValueError(
                "No approved allocation available for this leave period"
            )

        if allocation.remaining_amount < requested_amount:
            raise ValueError(
                "Insufficient leave allocation"
            )

    leave_request.start_date = new_start_date
    leave_request.end_date = new_end_date
    leave_request.requested_amount = requested_amount

    if "reason" in update_data:
        leave_request.reason = update_data["reason"]

    db.commit()
    db.refresh(leave_request)

    return leave_request


def approve_leave_request(
    db: Session,
    leave_request: LeaveRequest,
    approver_id: int
):
    if leave_request.status != "Pending":
        raise ValueError(
            "Only pending leave requests can be approved"
        )

    leave_type = db.query(TimeOffType).filter(
        TimeOffType.id == leave_request.leave_type_id,
        TimeOffType.is_active.is_(True)
    ).first()

    if not leave_type:
        raise ValueError("Active Time Off Type not found")

    allocation = None

    if leave_type.requires_allocation:
        allocation = find_applicable_allocation(
            db=db,
            employee_id=leave_request.employee_id,
            leave_type_id=leave_request.leave_type_id,
            start_date=leave_request.start_date,
            end_date=leave_request.end_date,
        )

        if not allocation:
            raise ValueError(
                "No approved allocation available"
            )

        if allocation.remaining_amount < leave_request.requested_amount:
            raise ValueError(
                "Insufficient leave allocation"
            )

        allocation.used_amount += (
            leave_request.requested_amount
        )

        allocation.remaining_amount -= (
            leave_request.requested_amount
        )

    approver = db.query(User).filter(
        User.id == approver_id
    ).first()

    if not approver:
        raise ValueError("Approver not found")

    leave_request.status = "Approved"
    leave_request.approved_by = approver_id
    leave_request.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(leave_request)

    return leave_request


def reject_leave_request(
    db: Session,
    leave_request: LeaveRequest,
    approver_id: int
):
    if leave_request.status != "Pending":
        raise ValueError(
            "Only pending leave requests can be rejected"
        )

    approver = db.query(User).filter(
        User.id == approver_id
    ).first()

    if not approver:
        raise ValueError("Approver not found")

    leave_request.status = "Rejected"
    leave_request.approved_by = approver_id
    leave_request.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(leave_request)

    return leave_request