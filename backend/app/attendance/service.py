from datetime import datetime, time

from sqlalchemy.orm import Session

from app.attendance.model import Attendance
from app.attendance.schema import AttendanceCreate, AttendanceUpdate
from app.employees.model import Employee


def calculate_worked_hours(
    check_in: time | None,
    check_out: time | None
) -> float:

    if check_in is None or check_out is None:
        return 0.0

    start = datetime.combine(datetime.today(), check_in)
    end = datetime.combine(datetime.today(), check_out)

    if end <= start:
        raise ValueError("Check-out time must be after check-in time")

    total_seconds = (end - start).total_seconds()

    return round(total_seconds / 3600, 2)


def determine_status(
    check_in: time | None,
    check_out: time | None
) -> str:

    if check_in is None:
        return "Absent"

    if check_out is None:
        return "Present"

    return "Present"


def create_attendance(
    db: Session,
    attendance_data: AttendanceCreate
):

    employee = db.query(Employee).filter(
        Employee.id == attendance_data.employee_id
    ).first()

    if not employee:
        raise ValueError("Employee not found")

    existing_attendance = db.query(Attendance).filter(
        Attendance.employee_id == attendance_data.employee_id,
        Attendance.attendance_date == attendance_data.attendance_date
    ).first()

    if existing_attendance:
        raise ValueError(
            "Attendance already exists for this employee on this date"
        )

    worked_hours = calculate_worked_hours(
        attendance_data.check_in,
        attendance_data.check_out
    )

    status = determine_status(
        attendance_data.check_in,
        attendance_data.check_out
    )

    attendance = Attendance(
        employee_id=attendance_data.employee_id,
        attendance_date=attendance_data.attendance_date,
        check_in=attendance_data.check_in,
        check_out=attendance_data.check_out,
        worked_hours=worked_hours,
        status=status,
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


def get_attendances(db: Session):

    return (
        db.query(Attendance)
        .order_by(
            Attendance.attendance_date.desc(),
            Attendance.id.desc()
        )
        .all()
    )


def get_attendance(
    db: Session,
    attendance_id: int
):

    return db.query(Attendance).filter(
        Attendance.id == attendance_id
    ).first()


def update_attendance(
    db: Session,
    attendance: Attendance,
    attendance_data: AttendanceUpdate
):

    update_data = attendance_data.model_dump(
        exclude_unset=True
    )

    new_date = update_data.get(
        "attendance_date",
        attendance.attendance_date
    )

    new_check_in = update_data.get(
        "check_in",
        attendance.check_in
    )

    new_check_out = update_data.get(
        "check_out",
        attendance.check_out
    )

    existing_attendance = db.query(Attendance).filter(
        Attendance.employee_id == attendance.employee_id,
        Attendance.attendance_date == new_date,
        Attendance.id != attendance.id
    ).first()

    if existing_attendance:
        raise ValueError(
            "Attendance already exists for this employee on this date"
        )

    worked_hours = calculate_worked_hours(
        new_check_in,
        new_check_out
    )

    status = determine_status(
        new_check_in,
        new_check_out
    )

    attendance.attendance_date = new_date
    attendance.check_in = new_check_in
    attendance.check_out = new_check_out
    attendance.worked_hours = worked_hours
    attendance.status = status

    db.commit()
    db.refresh(attendance)

    return attendance


def delete_attendance(
    db: Session,
    attendance: Attendance
):

    db.delete(attendance)
    db.commit()

    return attendance