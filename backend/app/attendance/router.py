from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.attendance.schema import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceUpdate,
)
from app.attendance.service import (
    create_attendance,
    get_attendances,
    get_attendance,
    update_attendance,
    delete_attendance,
)
from app.core.dependencies import require_role
from app.database.connection import get_db


attendance_router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


@attendance_router.get(
    "/",
    response_model=list[AttendanceResponse]
)
def get_all_attendance(
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
    return get_attendances(db)


@attendance_router.get(
    "/{attendance_id}",
    response_model=AttendanceResponse
)
def get_single_attendance(
    attendance_id: int,
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
    attendance = get_attendance(db, attendance_id)

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    return attendance


@attendance_router.post(
    "/",
    response_model=AttendanceResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_attendance(
    attendance_data: AttendanceCreate,
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
        return create_attendance(
            db,
            attendance_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@attendance_router.put(
    "/{attendance_id}",
    response_model=AttendanceResponse
)
def update_existing_attendance(
    attendance_id: int,
    attendance_data: AttendanceUpdate,
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
    attendance = get_attendance(
        db,
        attendance_id
    )

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    try:
        return update_attendance(
            db,
            attendance,
            attendance_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@attendance_router.delete(
    "/{attendance_id}",
    response_model=AttendanceResponse
)
def delete_existing_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    attendance = get_attendance(
        db,
        attendance_id
    )

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    return delete_attendance(
        db,
        attendance
    )