from datetime import date

from sqlalchemy.orm import Session

from app.payroll.payslip_model import Payslip
from app.payroll.payslip_schema import PayslipCreate
from app.payroll.payslip_line_model import PayslipLine

from app.payroll.payrun_model import Payrun

from app.employees.model import Employee
from app.contracts.model import Contract
from app.salary.structure_model import SalaryStructure

from app.payroll.payroll_engine import calculate_salary_rules
from app.payroll.payslip_pdf_service import generate_payslip_pdf
from app.core.email_service import send_email


# ============================================================
# DATE VALIDATION
# ============================================================

def validate_payslip_dates(
    period_start: date,
    period_end: date
):
    if period_end < period_start:
        raise ValueError(
            "Payslip period end date cannot be before start date"
        )


# ============================================================
# APPLICABLE CONTRACT
# ============================================================

def get_applicable_contract(
    db: Session,
    employee_id: int,
    period_start: date,
    period_end: date
):
    contracts = (
        db.query(Contract)
        .filter(
            Contract.employee_id == employee_id,
            Contract.is_active.is_(True),
            Contract.start_date <= period_end,
            (
                (Contract.end_date.is_(None))
                | (Contract.end_date >= period_start)
            ),
        )
        .all()
    )

    if not contracts:
        raise ValueError(
            "No applicable active contract found for employee"
        )

    if len(contracts) > 1:
        raise ValueError(
            "Multiple applicable active contracts found for employee"
        )

    return contracts[0]


# ============================================================
# SALARY STRUCTURE
# ============================================================

def validate_salary_structure(
    db: Session,
    salary_structure_id: int
):
    salary_structure = (
        db.query(SalaryStructure)
        .filter(
            SalaryStructure.id == salary_structure_id,
            SalaryStructure.is_active.is_(True)
        )
        .first()
    )

    if not salary_structure:
        raise ValueError(
            "Active Salary Structure not found"
        )

    return salary_structure


# ============================================================
# UPDATE PAYRUN TOTALS
# ============================================================

def update_payrun_totals(
    db: Session,
    payrun: Payrun
):
    """
    Recalculate payrun totals from all non-cancelled payslips.

    This avoids total drift caused by repeatedly adding/subtracting
    payslip values.
    """

    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun.id,
            Payslip.status != "Cancelled"
        )
        .all()
    )

    payrun.total_employees = len(payslips)

    payrun.total_gross = sum(
        (
            payslip.gross_amount
            for payslip in payslips
        ),
        0
    )

    payrun.total_deductions = sum(
        (
            payslip.deduction_amount
            for payslip in payslips
        ),
        0
    )

    payrun.total_net = sum(
        (
            payslip.net_amount
            for payslip in payslips
        ),
        0
    )


# ============================================================
# CREATE PAYSLIP
# ============================================================

def create_payslip(
    db: Session,
    payslip_data: PayslipCreate
):

    # --------------------------------
    # Validate dates
    # --------------------------------

    validate_payslip_dates(
        payslip_data.period_start,
        payslip_data.period_end
    )

    # --------------------------------
    # Validate employee
    # --------------------------------

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == payslip_data.employee_id
        )
        .first()
    )

    if not employee:
        raise ValueError(
            "Employee not found"
        )

    if not employee.is_active:
        raise ValueError(
            "Cannot create payslip for an inactive employee"
        )

    # --------------------------------
    # Validate payrun
    # --------------------------------

    payrun = (
        db.query(Payrun)
        .filter(
            Payrun.id == payslip_data.payrun_id
        )
        .first()
    )

    if not payrun:
        raise ValueError(
            "Payrun not found"
        )

    if payrun.status in {
        "Finalized",
        "Paid",
        "Cancelled"
    }:
        raise ValueError(
            "Payslip cannot be created for a finalized, paid, "
            "or cancelled payrun"
        )

    # --------------------------------
    # Payslip period must match payrun
    # --------------------------------

    if (
        payslip_data.period_start
        != payrun.period_start
        or
        payslip_data.period_end
        != payrun.period_end
    ):
        raise ValueError(
            "Payslip period must match payrun period"
        )

    # --------------------------------
    # Duplicate payslip check
    # --------------------------------

    existing_payslip = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payslip_data.payrun_id,
            Payslip.employee_id == payslip_data.employee_id
        )
        .first()
    )

    if existing_payslip:
        raise ValueError(
            "Payslip already exists for this employee in this payrun"
        )

    # --------------------------------
    # Find applicable contract
    # --------------------------------

    contract = get_applicable_contract(
        db=db,
        employee_id=payslip_data.employee_id,
        period_start=payslip_data.period_start,
        period_end=payslip_data.period_end
    )

    if contract.id != payslip_data.contract_id:
        raise ValueError(
            "Provided contract is not the applicable contract "
            "for this period"
        )

    # --------------------------------
    # Validate salary structure
    # --------------------------------

    if contract.salary_structure_id is None:
        raise ValueError(
            "Employee contract has no salary structure assigned"
        )

    salary_structure = validate_salary_structure(
        db=db,
        salary_structure_id=contract.salary_structure_id
    )

    if (
        payslip_data.salary_structure_id
        != salary_structure.id
    ):
        raise ValueError(
            "Salary structure does not match the employee contract"
        )

    # --------------------------------
    # Validate wage
    # --------------------------------

    if payslip_data.basic_wage != contract.wage:
        raise ValueError(
            "Basic wage does not match the employee contract"
        )

    # --------------------------------
    # Run payroll engine
    # --------------------------------

    payroll_result = calculate_salary_rules(
        db=db,
        salary_structure_id=salary_structure.id,
        basic_wage=contract.wage
    )

    # --------------------------------
    # Create payslip
    # --------------------------------

    payslip = Payslip(
        payrun_id=payrun.id,
        employee_id=employee.id,
        contract_id=contract.id,
        salary_structure_id=salary_structure.id,
        period_start=payrun.period_start,
        period_end=payrun.period_end,
        basic_wage=contract.wage,
        gross_amount=payroll_result["gross"],
        deduction_amount=payroll_result["deductions"],
        net_amount=payroll_result["net"],
        status="Calculated",
    )

    db.add(payslip)

    # Make payslip ID available
    db.flush()

    # --------------------------------
    # Create payslip lines
    # --------------------------------

    for line in payroll_result["lines"]:

        payslip_line = PayslipLine(
            payslip_id=payslip.id,
            salary_rule_id=line["salary_rule_id"],
            code=line["code"],
            name=line["name"],
            category=line["category"],
            sequence=line["sequence"],
            base_amount=line["base_amount"],
            percentage=line["percentage"],
            amount=line["amount"],
        )

        db.add(payslip_line)

    # --------------------------------
    # Recalculate payrun totals
    # --------------------------------

    update_payrun_totals(
        db,
        payrun
    )

    payrun.status = "Calculated"

    # --------------------------------
    # Commit
    # --------------------------------

    db.commit()

    db.refresh(payslip)

    return payslip


# ============================================================
# GET ALL PAYSLIPS
# ============================================================

def get_payslips(db: Session):
    return (
        db.query(Payslip)
        .order_by(
            Payslip.period_start.desc(),
            Payslip.id.desc()
        )
        .all()
    )


# ============================================================
# GET SINGLE PAYSLIP
# ============================================================

def get_payslip(
    db: Session,
    payslip_id: int
):
    return (
        db.query(Payslip)
        .filter(
            Payslip.id == payslip_id
        )
        .first()
    )


# ============================================================
# CANCEL PAYSLIP
# ============================================================

def cancel_payslip(
    db: Session,
    payslip: Payslip
):
    if payslip.status == "Finalized":
        raise ValueError(
            "Finalized payslip cannot be cancelled"
        )

    if payslip.status == "Paid":
        raise ValueError(
            "Paid payslip cannot be cancelled"
        )

    if payslip.status == "Cancelled":
        raise ValueError(
            "Payslip is already cancelled"
        )

    payslip.status = "Cancelled"

    # --------------------------------
    # Update payrun totals
    # --------------------------------

    payrun = (
        db.query(Payrun)
        .filter(
            Payrun.id == payslip.payrun_id
        )
        .first()
    )

    if payrun:
        update_payrun_totals(
            db,
            payrun
        )

    db.commit()

    db.refresh(payslip)

    return payslip


# ============================================================
# SEND PAYRUN PAYSLIPS BY EMAIL
# ============================================================

def send_payrun_payslips(
    db: Session,
    payrun_id: int
):
    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun_id,
            Payslip.status.in_(["Finalized", "Paid"])
        )
        .all()
    )

    if not payslips:
        raise ValueError(
            "No finalized or paid payslips found for this payrun"
        )

    results = []

    for payslip in payslips:

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == payslip.employee_id
            )
            .first()
        )

        if not employee:
            results.append({
                "payslip_id": payslip.id,
                "status": "failed",
                "message": "Employee not found"
            })
            continue

        if not employee.user or not employee.user.email:
            results.append({
                "payslip_id": payslip.id,
                "employee_id": employee.id,
                "status": "failed",
                "message": "Employee email not found"
            })
            continue

        try:
            # Generate PDF
            pdf_buffer = generate_payslip_pdf(
                db,
                payslip.id
            )

            pdf_data = pdf_buffer.getvalue()

            # Send email
            send_email(
                recipient_email=employee.user.email,
                subject=(
                    f"PeoplePay360 Payslip - "
                    f"{payslip.period_start} to "
                    f"{payslip.period_end}"
                ),
                body=(
                    f"Dear {employee.first_name} "
                    f"{employee.last_name},\n\n"
                    f"Please find attached your payslip for the "
                    f"period {payslip.period_start} to "
                    f"{payslip.period_end}.\n\n"
                    f"Regards,\n"
                    f"PeoplePay360 HR & Payroll"
                ),
                attachment_data=pdf_data,
                attachment_filename=(
                    f"Payslip_"
                    f"{employee.employee_code}_"
                    f"{payslip.period_start}_"
                    f"{payslip.period_end}.pdf"
                )
            )

            results.append({
                "payslip_id": payslip.id,
                "employee_id": employee.id,
                "email": employee.user.email,
                "status": "sent",
                "message": "Payslip sent successfully"
            })

        except Exception as e:
            results.append({
                "payslip_id": payslip.id,
                "employee_id": employee.id,
                "status": "failed",
                "message": str(e)
            })

    return results