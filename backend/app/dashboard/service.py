from sqlalchemy import func
from sqlalchemy.orm import Session

from app.payroll.payslip_model import Payslip
from app.attendance.model import Attendance
from app.leave.model import LeaveRequest
from app.employees.model import Employee
from app.departments.model import Department


def get_dashboard_summary(db: Session):

    total_net_salary_paid = (
        db.query(
            func.coalesce(
                func.sum(Payslip.net_amount),
                0
            )
        )
        .filter(
            Payslip.status == "Paid"
        )
        .scalar()
    )

    payslips_generated = (
        db.query(Payslip)
        .filter(
            Payslip.status.in_(["Finalized", "Paid"])
        )
        .count()
    )

    average_salary = (
        db.query(
            func.coalesce(
                func.avg(Payslip.net_amount),
                0
            )
        )
        .filter(
            Payslip.status.in_(["Finalized", "Paid"])
        )
        .scalar()
    )

    approved_time_off = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.status == "Approved"
        )
        .count()
    )

    total_attendance = db.query(Attendance).count()

    present_attendance = (
        db.query(Attendance)
        .filter(
            Attendance.status == "Present"
        )
        .count()
    )

    attendance_health = (
        round(
            (present_attendance / total_attendance) * 100,
            2
        )
        if total_attendance > 0
        else 0
    )

    return {
        "total_net_salary_paid": total_net_salary_paid,
        "payslips_generated": payslips_generated,
        "average_salary": average_salary,
        "approved_time_off": approved_time_off,
        "attendance_health": attendance_health,
    }

def get_salary_by_department(db: Session):

    results = (
        db.query(
            Department.name,
            func.coalesce(
                func.sum(Payslip.net_amount),
                0
            ).label("salary_cost")
        )
        .join(
            Employee,
            Employee.department_id == Department.id
        )
        .join(
            Payslip,
            Payslip.employee_id == Employee.id
        )
        .filter(
            Payslip.status.in_(["Finalized", "Paid"])
        )
        .group_by(
            Department.id,
            Department.name
        )
        .order_by(
            Department.name
        )
        .all()
    )

    return [
        {
            "department": department_name,
            "salary_cost": salary_cost
        }
        for department_name, salary_cost in results
    ]


def get_monthly_net_salary(db: Session):

    results = (
        db.query(
            func.date_trunc(
                "month",
                Payslip.period_start
            ).label("month"),
            func.sum(
                Payslip.net_amount
            ).label("net_salary")
        )
        .filter(
            Payslip.status.in_(["Finalized", "Paid"])
        )
        .group_by(
            func.date_trunc(
                "month",
                Payslip.period_start
            )
        )
        .order_by(
            func.date_trunc(
                "month",
                Payslip.period_start
            )
        )
        .all()
    )

    return [
        {
            "month": month.strftime("%Y-%m"),
            "net_salary": net_salary
        }
        for month, net_salary in results
    ]