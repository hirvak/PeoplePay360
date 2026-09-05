from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_role,
    get_current_employee,
)

from app.database.connection import get_db

from app.leave.model import (
    LeaveAllocation,
    LeaveRequest,
)

from app.leave.schema import (
    TimeOffTypeCreate,
    TimeOffTypeResponse,
    TimeOffTypeUpdate,
    LeaveAllocationCreate,
    LeaveAllocationResponse,
    LeaveAllocationUpdate,
    LeaveRequestCreate,
    LeaveRequestResponse,
    LeaveRequestUpdate,
)

from app.leave.service import (
    create_time_off_type,
    get_time_off_types,
    get_time_off_type,
    update_time_off_type,
    delete_time_off_type,
    create_leave_allocation,
    get_leave_allocations,
    get_leave_allocation,
    update_leave_allocation,
    approve_leave_allocation,
    reject_leave_allocation,
    delete_leave_allocation,
    create_leave_request,
    get_leave_requests,
    get_leave_request,
    update_leave_request,
    approve_leave_request,
    reject_leave_request,
)


leave_router = APIRouter(
    prefix="/leave",
    tags=["Time Off"]
)


# =========================================================
# EMPLOYEE SELF-SERVICE
# =========================================================


# ---------------------------------------------------------
# GET MY LEAVE REQUESTS
# ---------------------------------------------------------

@leave_router.get(
    "/my-requests",
    response_model=list[LeaveRequestResponse]
)
def get_my_leave_requests(
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.employee_id == current_employee.id
        )
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )


# ---------------------------------------------------------
# GET MY LEAVE BALANCE
# ---------------------------------------------------------

@leave_router.get(
    "/my-balance",
    response_model=list[LeaveAllocationResponse]
)
def get_my_leave_balance(
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(LeaveAllocation)
        .filter(
            LeaveAllocation.employee_id == current_employee.id,
            LeaveAllocation.status == "Approved"
        )
        .order_by(LeaveAllocation.end_date.desc())
        .all()
    )


# ---------------------------------------------------------
# CREATE MY LEAVE REQUEST
# Employee can create ONLY for themselves
# ---------------------------------------------------------

@leave_router.post(
    "/my-requests",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_my_leave_request(
    request_data: LeaveRequestCreate,
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    try:
        # Never trust employee_id from the frontend.
        request_data.employee_id = current_employee.id

        return create_leave_request(
            db,
            request_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# =========================================================
# TIME OFF TYPES
# =========================================================


@leave_router.get(
    "/types",
    response_model=list[TimeOffTypeResponse]
)
def get_all_time_off_types(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_time_off_types(db)


@leave_router.get(
    "/types/{type_id}",
    response_model=TimeOffTypeResponse
)
def get_single_time_off_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    time_off_type = get_time_off_type(
        db,
        type_id
    )

    if not time_off_type:
        raise HTTPException(
            status_code=404,
            detail="Time Off Type not found"
        )

    return time_off_type


@leave_router.post(
    "/types",
    response_model=TimeOffTypeResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_time_off_type(
    type_data: TimeOffTypeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    try:
        return create_time_off_type(
            db,
            type_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.put(
    "/types/{type_id}",
    response_model=TimeOffTypeResponse
)
def update_existing_time_off_type(
    type_id: int,
    type_data: TimeOffTypeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    time_off_type = get_time_off_type(
        db,
        type_id
    )

    if not time_off_type:
        raise HTTPException(
            status_code=404,
            detail="Time Off Type not found"
        )

    try:
        return update_time_off_type(
            db,
            time_off_type,
            type_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.delete(
    "/types/{type_id}",
    response_model=TimeOffTypeResponse
)
def delete_existing_time_off_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    time_off_type = get_time_off_type(
        db,
        type_id
    )

    if not time_off_type:
        raise HTTPException(
            status_code=404,
            detail="Time Off Type not found"
        )

    return delete_time_off_type(
        db,
        time_off_type
    )


# =========================================================
# LEAVE ALLOCATIONS
# =========================================================


@leave_router.get(
    "/allocations",
    response_model=list[LeaveAllocationResponse]
)
def get_all_leave_allocations(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_leave_allocations(db)


@leave_router.get(
    "/allocations/{allocation_id}",
    response_model=LeaveAllocationResponse
)
def get_single_leave_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    allocation = get_leave_allocation(
        db,
        allocation_id
    )

    if not allocation:
        raise HTTPException(
            status_code=404,
            detail="Leave allocation not found"
        )

    return allocation


@leave_router.post(
    "/allocations",
    response_model=LeaveAllocationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_leave_allocation(
    allocation_data: LeaveAllocationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    try:
        return create_leave_allocation(
            db,
            allocation_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.put(
    "/allocations/{allocation_id}",
    response_model=LeaveAllocationResponse
)
def update_existing_leave_allocation(
    allocation_id: int,
    allocation_data: LeaveAllocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    allocation = get_leave_allocation(
        db,
        allocation_id
    )

    if not allocation:
        raise HTTPException(
            status_code=404,
            detail="Leave allocation not found"
        )

    try:
        return update_leave_allocation(
            db,
            allocation,
            allocation_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.post(
    "/allocations/{allocation_id}/approve",
    response_model=LeaveAllocationResponse
)
def approve_existing_leave_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    allocation = get_leave_allocation(
        db,
        allocation_id
    )

    if not allocation:
        raise HTTPException(
            status_code=404,
            detail="Leave allocation not found"
        )

    try:
        return approve_leave_allocation(
            db,
            allocation
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.post(
    "/allocations/{allocation_id}/reject",
    response_model=LeaveAllocationResponse
)
def reject_existing_leave_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    allocation = get_leave_allocation(
        db,
        allocation_id
    )

    if not allocation:
        raise HTTPException(
            status_code=404,
            detail="Leave allocation not found"
        )

    try:
        return reject_leave_allocation(
            db,
            allocation
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.delete(
    "/allocations/{allocation_id}",
    response_model=LeaveAllocationResponse
)
def delete_existing_leave_allocation(
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    allocation = get_leave_allocation(
        db,
        allocation_id
    )

    if not allocation:
        raise HTTPException(
            status_code=404,
            detail="Leave allocation not found"
        )

    return delete_leave_allocation(
        db,
        allocation
    )


# =========================================================
# LEAVE REQUESTS - HR MANAGEMENT
# =========================================================


@leave_router.get(
    "/requests",
    response_model=list[LeaveRequestResponse]
)
def get_all_leave_requests(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_leave_requests(db)


@leave_router.get(
    "/requests/{request_id}",
    response_model=LeaveRequestResponse
)
def get_single_leave_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    leave_request = get_leave_request(
        db,
        request_id
    )

    if not leave_request:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    return leave_request


# ---------------------------------------------------------
# CREATE LEAVE REQUEST - HR
# Employee must use /my-requests
# ---------------------------------------------------------

@leave_router.post(
    "/requests",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_leave_request(
    request_data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_leave_request(
            db,
            request_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.put(
    "/requests/{request_id}",
    response_model=LeaveRequestResponse
)
def update_existing_leave_request(
    request_id: int,
    request_data: LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    leave_request = get_leave_request(
        db,
        request_id
    )

    if not leave_request:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    try:
        return update_leave_request(
            db,
            leave_request,
            request_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.post(
    "/requests/{request_id}/approve",
    response_model=LeaveRequestResponse
)
def approve_existing_leave_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    leave_request = get_leave_request(
        db,
        request_id
    )

    if not leave_request:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    try:
        return approve_leave_request(
            db,
            leave_request,
            current_user.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@leave_router.post(
    "/requests/{request_id}/reject",
    response_model=LeaveRequestResponse
)
def reject_existing_leave_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    leave_request = get_leave_request(
        db,
        request_id
    )

    if not leave_request:
        raise HTTPException(
            status_code=404,
            detail="Leave request not found"
        )

    try:
        return reject_leave_request(
            db,
            leave_request,
            current_user.id
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )