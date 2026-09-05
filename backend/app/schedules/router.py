from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_role,
    get_current_employee,
)
from app.database.connection import get_db

from app.schedules.schema import (
    ScheduleCreate,
    ScheduleResponse,
    ScheduleUpdate,
)

from app.schedules.service import (
    create_schedule,
    get_schedules,
    get_schedule,
    update_schedule,
    delete_schedule,
)


schedule_router = APIRouter(
    prefix="/schedules",
    tags=["Schedules"]
)


# ============================================================
# GET MY WORKING SCHEDULE
# Employee can see ONLY their assigned schedule
# ============================================================

@schedule_router.get(
    "/me",
    response_model=ScheduleResponse
)
def get_my_schedule(
    current_employee=Depends(get_current_employee),
):
    if not current_employee.schedule:
        raise HTTPException(
            status_code=404,
            detail=(
                "No working schedule assigned "
                "to this employee"
            )
        )

    return current_employee.schedule


# ============================================================
# GET ALL SCHEDULES
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@schedule_router.get(
    "/",
    response_model=list[ScheduleResponse]
)
def get_all_schedules(
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
    return get_schedules(db)


# ============================================================
# GET SINGLE SCHEDULE
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@schedule_router.get(
    "/{schedule_id}",
    response_model=ScheduleResponse
)
def get_single_schedule(
    schedule_id: int,
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
    schedule = get_schedule(
        db,
        schedule_id
    )

    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule not found"
        )

    return schedule


# ============================================================
# CREATE SCHEDULE
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@schedule_router.post(
    "/",
    response_model=ScheduleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_schedule(
    schedule_data: ScheduleCreate,
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
        return create_schedule(
            db,
            schedule_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# UPDATE SCHEDULE
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@schedule_router.put(
    "/{schedule_id}",
    response_model=ScheduleResponse
)
def update_existing_schedule(
    schedule_id: int,
    schedule_data: ScheduleUpdate,
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
    schedule = get_schedule(
        db,
        schedule_id
    )

    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule not found"
        )

    try:
        return update_schedule(
            db,
            schedule,
            schedule_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DELETE SCHEDULE
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@schedule_router.delete(
    "/{schedule_id}",
    response_model=ScheduleResponse
)
def delete_existing_schedule(
    schedule_id: int,
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
    schedule = get_schedule(
        db,
        schedule_id
    )

    if not schedule:
        raise HTTPException(
            status_code=404,
            detail="Schedule not found"
        )

    return delete_schedule(
        db,
        schedule
    )