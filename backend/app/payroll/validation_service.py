from sqlalchemy.orm import Session

from app.payroll.payrun_model import Payrun
from app.payroll.payslip_model import Payslip
from app.payroll.payslip_line_model import PayslipLine
from app.contracts.model import Contract
from app.salary.rule_model import SalaryRule
from app.salary.structure_model import SalaryStructure
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

    if payrun.status != "Calculated":
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
    # Employee count
    # --------------------------------

    if payrun.total_employees != len(payslips):
        errors.append(
            "Payrun employee count does not match "
            "the number of generated payslips"
        )

    # --------------------------------
    # Duplicate payslip check
    # --------------------------------

    employee_ids = set()

    for payslip in payslips:

        if payslip.employee_id in employee_ids:
            errors.append(
                f"Duplicate payslip found for "
                f"employee {payslip.employee_id}"
            )

        employee_ids.add(payslip.employee_id)

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

        # --------------------------------
        # Employee check
        # --------------------------------

        if not employee:
            errors.append(
                f"{employee_name}: Employee not found"
            )
            continue

        if not employee.is_active:
            errors.append(
                f"{employee_name}: Employee is inactive"
            )

        # --------------------------------
        # Contract check
        # --------------------------------

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
        else:

            # Contract must belong to the payslip employee
            if contract.employee_id != payslip.employee_id:
                errors.append(
                    f"{employee_name}: "
                    "Contract does not belong to the employee"
                )

            # Contract must cover the complete payrun period
            if contract.start_date > payrun.period_start:
                errors.append(
                    f"{employee_name}: "
                    "Contract starts after the payrun period begins"
                )

            if (
                contract.end_date is not None
                and contract.end_date < payrun.period_end
            ):
                errors.append(
                    f"{employee_name}: "
                    "Contract ends before the payrun period ends"
                )

            # Contract salary structure must match payslip
            if (
                contract.salary_structure_id
                != payslip.salary_structure_id
            ):
                errors.append(
                    f"{employee_name}: "
                    "Payslip salary structure does not match "
                    "contract salary structure"
                )

            # Contract wage must match payslip basic wage
            if contract.wage != payslip.basic_wage:
                errors.append(
                    f"{employee_name}: "
                    "Payslip basic wage does not match contract wage"
                )

        # --------------------------------
        # Salary structure check
        # --------------------------------

        if not payslip.salary_structure_id:
            errors.append(
                f"{employee_name}: "
                "Salary structure is missing"
            )

        else:
            salary_structure = (
                db.query(SalaryStructure)
                .filter(
                    SalaryStructure.id
                    == payslip.salary_structure_id
                )
                .first()
            )

            if not salary_structure:
                errors.append(
                    f"{employee_name}: "
                    "Salary structure not found"
                )

            elif not salary_structure.is_active:
                errors.append(
                    f"{employee_name}: "
                    "Salary structure is inactive"
                )

        # --------------------------------
        # Payslip status
        # --------------------------------

        if payslip.status != "Calculated":
            errors.append(
                f"{employee_name}: "
                f"Payslip status is {payslip.status}"
            )

        # --------------------------------
        # Period check
        # --------------------------------

        if (
            payslip.period_start != payrun.period_start
            or payslip.period_end != payrun.period_end
        ):
            errors.append(
                f"{employee_name}: "
                "Payslip period does not match payrun period"
            )

        # --------------------------------
        # Salary rule lines
        # --------------------------------

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

        else:
            for line in lines:

                if not line.salary_rule_id:
                    errors.append(
                        f"{employee_name}: "
                        "Payslip line has no salary rule"
                    )
                    continue

                rule = (
                    db.query(SalaryRule)
                    .filter(
                        SalaryRule.id == line.salary_rule_id
                    )
                    .first()
                )

                if not rule:
                    errors.append(
                        f"{employee_name}: "
                        f"Salary rule {line.salary_rule_id} "
                        "not found"
                    )

                elif rule.salary_structure_id != payslip.salary_structure_id:
                    errors.append(
                        f"{employee_name}: "
                        "Payslip contains a salary rule "
                        "from a different salary structure"
                    )

        # --------------------------------
        # Zero / negative net warning
        # --------------------------------

        if payslip.net_amount <= 0:
            warnings.append(
                f"{employee_name}: "
                "Net salary is zero or negative"
            )

        # --------------------------------
        # Negative deduction warning
        # --------------------------------

        if payslip.deduction_amount < 0:
            errors.append(
                f"{employee_name}: "
                "Deduction amount cannot be negative"
            )


        if payslip.gross_amount < payslip.basic_wage:
            warnings.append(
                f"{employee_name}: "
                "Gross salary is lower than basic wage"
            )


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



    return {
        "valid": len(errors) == 0,
        "warnings": warnings,
        "errors": errors
    }