from sqlalchemy.orm import Session

from app.payroll.payrun_model import Payrun
from app.payroll.payslip_model import Payslip
from app.payroll.payslip_line_model import PayslipLine
from app.contracts.model import Contract
from app.salary.rule_model import SalaryRule
from app.employees.model import Employee


def validate_payrun(
    db: Session,
    payrun: Payrun
):
    warnings = []
    errors = []

    # --------------------------------
    # Payrun status
    # --------------------------------

    if payrun.status not in {"Calculated"}:
        errors.append(
            "Payrun must be Calculated before validation"
        )
        return {
            "valid": False,
            "warnings": warnings,
            "errors": errors
        }

    # --------------------------------
    # Get payslips
    # --------------------------------

    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun.id,
            Payslip.status != "Cancelled"
        )
        .all()
    )

    if not payslips:
        errors.append(
            "No payslips found for this payrun"
        )

    # --------------------------------
    # Check each payslip
    # --------------------------------

    for payslip in payslips:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == payslip.employee_id
            )
            .first()
        )

        employee_name = (
            employee.employee_code
            if employee
            else f"Employee {payslip.employee_id}"
        )

        # Contract check
        contract = (
            db.query(Contract)
            .filter(
                Contract.id == payslip.contract_id,
                Contract.is_active.is_(True)
            )
            .first()
        )

        if not contract:
            errors.append(
                f"{employee_name}: "
                "Active contract not found"
            )

        # Salary structure check
        if not payslip.salary_structure_id:
            errors.append(
                f"{employee_name}: "
                "Salary structure is missing"
            )

        # Payslip status
        if payslip.status != "Calculated":
            errors.append(
                f"{employee_name}: "
                f"Payslip status is {payslip.status}"
            )

        # Period check
        if (
            payslip.period_start != payrun.period_start
            or payslip.period_end != payrun.period_end
        ):
            errors.append(
                f"{employee_name}: "
                "Payslip period does not match payrun period"
            )

        # Payslip lines
        lines = (
            db.query(PayslipLine)
            .filter(
                PayslipLine.payslip_id == payslip.id
            )
            .all()
        )

        if not lines:
            errors.append(
                f"{employee_name}: "
                "No salary rule lines found"
            )

        # Zero net salary warning
        if payslip.net_amount <= 0:
            warnings.append(
                f"{employee_name}: "
                "Net salary is zero or negative"
            )

    # --------------------------------
    # Duplicate payslip check
    # --------------------------------

    employee_ids = {}

    for payslip in payslips:

        if payslip.employee_id in employee_ids:

            errors.append(
                f"Duplicate payslip found for "
                f"employee {payslip.employee_id}"
            )

        employee_ids[payslip.employee_id] = payslip.id

    # --------------------------------
    # Payrun totals validation
    # --------------------------------

    calculated_gross = sum(
        (
            payslip.gross_amount
            for payslip in payslips
        ),
        0
    )

    calculated_deductions = sum(
        (
            payslip.deduction_amount
            for payslip in payslips
        ),
        0
    )

    calculated_net = sum(
        (
            payslip.net_amount
            for payslip in payslips
        ),
        0
    )

    if payrun.total_gross != calculated_gross:
        errors.append(
            "Payrun gross total does not match "
            "payslip totals"
        )

    if payrun.total_deductions != calculated_deductions:
        errors.append(
            "Payrun deduction total does not match "
            "payslip totals"
        )

    if payrun.total_net != calculated_net:
        errors.append(
            "Payrun net total does not match "
            "payslip totals"
        )

    # --------------------------------
    # Final result
    # --------------------------------

    return {
        "valid": len(errors) == 0,
        "warnings": warnings,
        "errors": errors
    }