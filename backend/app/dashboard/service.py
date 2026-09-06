from collections import defaultdict

from sqlalchemy.orm import Session

from app.attendance.model import Attendance
from app.contracts.model import Contract
from app.employees.model import Employee
from app.leave.model import LeaveRequest
from app.payroll.payrun_model import Payrun
from app.payroll.payslip_model import Payslip
from app.salary.structure_model import SalaryStructure


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

def get_dashboard_summary(db: Session):

    # --------------------------------------------------------
    # Total Net Salary Paid
    # --------------------------------------------------------

    paid_payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status == "Paid"
        )
        .all()
    )

    total_net_salary_paid = sum(
        (
            payslip.net_amount
            for payslip in paid_payslips
        ),
        0
    )

    # --------------------------------------------------------
    # Payslips Generated
    # --------------------------------------------------------

    generated_payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status.in_(
                ["Finalized", "Paid"]
            )
        )
        .count()
    )

    # --------------------------------------------------------
    # Average Salary
    # --------------------------------------------------------

    if paid_payslips:
        average_salary = (
            total_net_salary_paid
            / len(paid_payslips)
        )
    else:
        average_salary = 0

    # --------------------------------------------------------
    # Approved Time Off
    # --------------------------------------------------------

    approved_time_off = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.status == "Approved"
        )
        .count()
    )

    # --------------------------------------------------------
    # Attendance Health
    # --------------------------------------------------------

    total_attendance = (
        db.query(Attendance)
        .count()
    )

    present_attendance = (
        db.query(Attendance)
        .filter(
            Attendance.status == "Present"
        )
        .count()
    )

    if total_attendance > 0:
        attendance_health = (
            present_attendance
            / total_attendance
        ) * 100
    else:
        attendance_health = 0

    # --------------------------------------------------------
    # Total Employees & Active Payruns
    # --------------------------------------------------------

    total_employees = db.query(Employee).count()

    total_payruns = (
        db.query(Payrun)
        .filter(
            Payrun.status != "Cancelled"
        )
        .count()
    )

    return {
        "total_net_salary_paid": total_net_salary_paid,
        "payslips_generated": generated_payslips,
        "average_salary": average_salary,
        "approved_time_off": approved_time_off,
        "attendance_health": round(
            attendance_health,
            2
        ),
        "total_employees": total_employees,
        "total_payruns": total_payruns,
    }


# ============================================================
# SALARY COST BY DEPARTMENT
# ============================================================

def get_salary_cost_by_department(
    db: Session
):
    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status.in_(
                ["Finalized", "Paid"]
            )
        )
        .all()
    )

    department_totals = defaultdict(
        lambda: 0
    )

    for payslip in payslips:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id
                == payslip.employee_id
            )
            .first()
        )

        if not employee:
            continue

        department_name = "Unassigned"

        if employee.department:
            department_name = (
                employee.department.name
            )

        department_totals[
            department_name
        ] += payslip.net_amount

    return [
        {
            "department": department,
            "salary_cost": amount
        }
        for department, amount
        in department_totals.items()
    ]


# ============================================================
# MONTHLY NET SALARY TRENDS
# ============================================================

def get_monthly_net_salary_trends(
    db: Session
):
    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status.in_(
                ["Finalized", "Paid"]
            )
        )
        .order_by(
            Payslip.period_start
        )
        .all()
    )

    monthly_totals = defaultdict(
        lambda: 0
    )

    for payslip in payslips:

        month_key = payslip.period_start.strftime(
            "%Y-%m"
        )

        monthly_totals[
            month_key
        ] += payslip.net_amount

    return [
        {
            "month": month,
            "net_salary": amount
        }
        for month, amount
        in sorted(monthly_totals.items())
    ]


# ============================================================
# DASHBOARD ALERTS
# ============================================================

def get_dashboard_alerts(
    db: Session
):
    alerts = []

    # ========================================================
    # 1. PAYRUN STATUS ALERTS
    # ========================================================

    payruns = (
        db.query(Payrun)
        .filter(
            Payrun.status.in_(
                ["Draft", "Calculated"]
            )
        )
        .order_by(
            Payrun.period_start.desc()
        )
        .all()
    )

    for payrun in payruns:

        if payrun.status == "Draft":

            alerts.append(
                {
                    "type": "payrun",
                    "severity": "warning",
                    "title": "Draft Payrun",
                    "message": (
                        f"Payrun '{payrun.name}' "
                        "has not been calculated yet."
                    ),
                    "reference_id": payrun.id,
                }
            )

        elif payrun.status == "Calculated":

            alerts.append(
                {
                    "type": "payrun",
                    "severity": "info",
                    "title": "Payrun Ready for Validation",
                    "message": (
                        f"Payrun '{payrun.name}' "
                        "has been calculated and "
                        "is ready for validation/finalization."
                    ),
                    "reference_id": payrun.id,
                }
            )

    # ========================================================
    # 2. EMPLOYEES WITHOUT APPLICABLE CONTRACT
    # ========================================================

    employees = (
        db.query(Employee)
        .filter(
            Employee.is_active.is_(True)
        )
        .all()
    )

    for employee in employees:

        contracts = (
            db.query(Contract)
            .filter(
                Contract.employee_id == employee.id,
                Contract.is_active.is_(True)
            )
            .all()
        )

        if not contracts:

            alerts.append(
                {
                    "type": "contract",
                    "severity": "warning",
                    "title": "Missing Contract",
                    "message": (
                        f"{employee.employee_code} "
                        f"({employee.first_name} "
                        f"{employee.last_name}) "
                        "has no active contract."
                    ),
                    "reference_id": employee.id,
                }
            )

    # ========================================================
    # 3. CONTRACT ATTENTION
    # ========================================================

    contracts = (
        db.query(Contract)
        .filter(
            Contract.is_active.is_(True)
        )
        .all()
    )

    for contract in contracts:

        if contract.end_date is None:
            continue

        # Contract has already ended
        from datetime import date

        if contract.end_date < date.today():

            alerts.append(
                {
                    "type": "contract",
                    "severity": "warning",
                    "title": "Expired Contract",
                    "message": (
                        f"Contract {contract.id} "
                        "has expired."
                    ),
                    "reference_id": contract.id,
                }
            )

    # ========================================================
    # 4. MISSING SALARY STRUCTURE
    # ========================================================

    for employee in employees:

        active_contract = (
            db.query(Contract)
            .filter(
                Contract.employee_id == employee.id,
                Contract.is_active.is_(True)
            )
            .first()
        )

        if (
            active_contract
            and active_contract.salary_structure_id
            is None
        ):

            alerts.append(
                {
                    "type": "salary_structure",
                    "severity": "warning",
                    "title": "Missing Salary Structure",
                    "message": (
                        f"{employee.employee_code} "
                        "has an active contract without "
                        "a salary structure."
                    ),
                    "reference_id": employee.id,
                }
            )

    # ========================================================
    # 5. DUPLICATE PAYSLIPS
    # ========================================================

    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status != "Cancelled"
        )
        .all()
    )

    payslip_groups = defaultdict(list)

    for payslip in payslips:

        key = (
            payslip.payrun_id,
            payslip.employee_id
        )

        payslip_groups[key].append(
            payslip
        )

    for key, grouped_payslips in (
        payslip_groups.items()
    ):

        if len(grouped_payslips) > 1:

            payrun_id, employee_id = key

            alerts.append(
                {
                    "type": "duplicate_payslip",
                    "severity": "error",
                    "title": "Duplicate Payslips",
                    "message": (
                        f"Multiple active payslips "
                        f"exist for employee {employee_id} "
                        f"in payrun {payrun_id}."
                    ),
                    "reference_id": payrun_id,
                }
            )

    # ========================================================
    # 6. ZERO / NEGATIVE NET PAY
    # ========================================================

    calculated_payslips = (
        db.query(Payslip)
        .filter(
            Payslip.status == "Calculated"
        )
        .all()
    )

    for payslip in calculated_payslips:

        if payslip.net_amount <= 0:

            alerts.append(
                {
                    "type": "payroll",
                    "severity": "warning",
                    "title": "Invalid Net Salary",
                    "message": (
                        f"Payslip {payslip.id} "
                        "has zero or negative net salary."
                    ),
                    "reference_id": payslip.id,
                }
            )

    # ========================================================
    # RETURN
    # ========================================================

    return {
        "alerts": alerts,
        "total": len(alerts)
    }