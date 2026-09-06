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

from app.core.dependencies import (
    require_role,
    get_current_employee,
)

from app.database.connection import get_db
from app.attendance.model import Attendance


attendance_router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


# ============================================================
# GET MY ATTENDANCE
# Employee can see ONLY their own attendance
# ============================================================

@attendance_router.get(
    "/me",
    response_model=list[AttendanceResponse]
)
def get_my_attendance(
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == current_employee.id
        )
        .order_by(Attendance.attendance_date.desc())
        .all()
    )


# ============================================================
# GET ALL ATTENDANCE
# HR roles + Admin
# ============================================================

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


# ============================================================
# GET SINGLE ATTENDANCE
# HR roles + Admin
# ============================================================

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
    attendance = get_attendance(
        db,
        attendance_id
    )

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found"
        )

    return attendance


# ============================================================
# CREATE ATTENDANCE
# Employee can create ONLY for themselves
# HR roles + Admin can create for any employee
# ============================================================

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
            "Employee",
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        # Employee can create attendance only for themselves
        if current_user.role.name == "Employee":
            from app.employees.model import Employee

            employee = (
                db.query(Employee)
                .filter(
                    Employee.user_id == current_user.id
                )
                .first()
            )

            if not employee:
                raise HTTPException(
                    status_code=404,
                    detail="Employee profile not linked to this user"
                )

            # Prevent creating attendance for another employee
            if attendance_data.employee_id != employee.id:
                raise HTTPException(
                    status_code=403,
                    detail="You can only create attendance for yourself"
                )

        return create_attendance(
            db,
            attendance_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# UPDATE ATTENDANCE
# Employee can update ONLY their own attendance (e.g. check-out)
# HR roles + Admin can update any attendance
# ============================================================

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
            "Employee",
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

    if current_user.role.name == "Employee":
        from app.employees.model import Employee

        employee = (
            db.query(Employee)
            .filter(
                Employee.user_id == current_user.id
            )
            .first()
        )

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Employee profile not linked to this user"
            )

        if attendance.employee_id != employee.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own attendance"
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


# ============================================================
# DELETE ATTENDANCE
# HR Manager / HR Payroll Manager / Admin
# ============================================================

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

    return delete_attendance(
        db,
        attendance
    )