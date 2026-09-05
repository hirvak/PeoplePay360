from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.payroll.payrun_model import Payrun
from app.payroll.payrun_schema import (
    PayrunCreate,
    PayrunUpdate,
)

from app.payroll.payslip_model import Payslip
from app.payroll.payslip_line_model import PayslipLine

from app.payroll.payroll_engine import calculate_salary_rules

from app.employees.model import Employee
from app.contracts.model import Contract
from app.salary.structure_model import SalaryStructure


VALID_STATUSES = {
    "Draft",
    "Calculated",
    "Finalized",
    "Cancelled",
}


# ============================================================
# PAYRUN VALIDATION
# ============================================================

def validate_payrun_dates(
    period_start: date,
    period_end: date
):
    if period_end < period_start:
        raise ValueError(
            "Payrun period end date cannot be before start date"
        )


def check_payrun_overlap(
    db: Session,
    period_start: date,
    period_end: date,
    exclude_payrun_id: int | None = None
):
    payruns = (
        db.query(Payrun)
        .filter(
            Payrun.status != "Cancelled"
        )
        .all()
    )

    for payrun in payruns:

        if (
            exclude_payrun_id is not None
            and payrun.id == exclude_payrun_id
        ):
            continue

        if (
            period_start <= payrun.period_end
            and payrun.period_start <= period_end
        ):
            raise ValueError(
                "Payrun period overlaps with an existing payrun"
            )


# ============================================================
# CREATE PAYRUN
# ============================================================

def create_payrun(
    db: Session,
    payrun_data: PayrunCreate
):
    validate_payrun_dates(
        payrun_data.period_start,
        payrun_data.period_end
    )

    check_payrun_overlap(
        db=db,
        period_start=payrun_data.period_start,
        period_end=payrun_data.period_end
    )

    payrun = Payrun(
        name=payrun_data.name,
        period_start=payrun_data.period_start,
        period_end=payrun_data.period_end,
        status="Draft",
        total_employees=0,
        total_gross=0,
        total_deductions=0,
        total_net=0,
    )

    db.add(payrun)
    db.commit()
    db.refresh(payrun)

    return payrun


# ============================================================
# GET PAYRUNS
# ============================================================

def get_payruns(db: Session):
    return (
        db.query(Payrun)
        .order_by(
            Payrun.period_start.desc(),
            Payrun.id.desc()
        )
        .all()
    )


def get_payrun(
    db: Session,
    payrun_id: int
):
    return (
        db.query(Payrun)
        .filter(
            Payrun.id == payrun_id
        )
        .first()
    )


# ============================================================
# UPDATE PAYRUN
# ============================================================

def update_payrun(
    db: Session,
    payrun: Payrun,
    payrun_data: PayrunUpdate
):
    if payrun.status != "Draft":
        raise ValueError(
            "Only Draft payruns can be updated"
        )

    update_data = payrun_data.model_dump(
        exclude_unset=True
    )

    new_period_start = update_data.get(
        "period_start",
        payrun.period_start
    )

    new_period_end = update_data.get(
        "period_end",
        payrun.period_end
    )

    validate_payrun_dates(
        new_period_start,
        new_period_end
    )

    check_payrun_overlap(
        db=db,
        period_start=new_period_start,
        period_end=new_period_end,
        exclude_payrun_id=payrun.id
    )

    for field, value in update_data.items():
        setattr(
            payrun,
            field,
            value
        )

    db.commit()
    db.refresh(payrun)

    return payrun


# ============================================================
# AUTOMATIC PAYRUN CALCULATION
# ============================================================

def calculate_payrun(
    db: Session,
    payrun: Payrun
):
    """
    Calculate payroll for all active employees
    with an applicable active contract.

    For every employee:

        Employee
            ↓
        Applicable Contract
            ↓
        Salary Structure
            ↓
        Salary Rules
            ↓
        Payroll Engine
            ↓
        Payslip
            ↓
        Payslip Lines

    The complete operation is committed only if
    all employees can be calculated successfully.
    """

    # --------------------------------------------------------
    # Payrun must be in Draft state
    # --------------------------------------------------------

    if payrun.status != "Draft":
        raise ValueError(
            "Only Draft payruns can be calculated"
        )

    # --------------------------------------------------------
    # Find active employees
    # --------------------------------------------------------

    employees = (
        db.query(Employee)
        .filter(
            Employee.is_active.is_(True)
        )
        .order_by(
            Employee.id
        )
        .all()
    )

    if not employees:
        raise ValueError(
            "No active employees found for this payrun"
        )

    calculated_payslips = []

    errors = []

    # --------------------------------------------------------
    # Process every active employee
    # --------------------------------------------------------

    for employee in employees:

        try:

            # ------------------------------------------------
            # Find applicable contracts
            # ------------------------------------------------

            contracts = (
                db.query(Contract)
                .filter(
                    Contract.employee_id == employee.id,
                    Contract.is_active.is_(True),
                    Contract.start_date <= payrun.period_end,
                    (
                        (Contract.end_date.is_(None))
                        | (
                            Contract.end_date
                            >= payrun.period_start
                        )
                    ),
                )
                .all()
            )

            # No contract
            if not contracts:
                raise ValueError(
                    "No applicable active contract found"
                )

            # Multiple contracts
            if len(contracts) > 1:
                raise ValueError(
                    "Multiple applicable active contracts found"
                )

            contract = contracts[0]

            # ------------------------------------------------
            # Salary structure validation
            # ------------------------------------------------

            if contract.salary_structure_id is None:
                raise ValueError(
                    "Employee contract has no salary structure assigned"
                )

            salary_structure = (
                db.query(SalaryStructure)
                .filter(
                    SalaryStructure.id
                    == contract.salary_structure_id,
                    SalaryStructure.is_active.is_(True)
                )
                .first()
            )

            if not salary_structure:
                raise ValueError(
                    "Active Salary Structure not found"
                )

            # ------------------------------------------------
            # Check duplicate payslip
            # ------------------------------------------------

            existing_payslip = (
                db.query(Payslip)
                .filter(
                    Payslip.payrun_id == payrun.id,
                    Payslip.employee_id == employee.id
                )
                .first()
            )

            if existing_payslip:
                raise ValueError(
                    "Payslip already exists for this employee"
                )

            # ------------------------------------------------
            # Run payroll engine
            # ------------------------------------------------

            payroll_result = calculate_salary_rules(
                db=db,
                salary_structure_id=salary_structure.id,
                basic_wage=contract.wage
            )

            # ------------------------------------------------
            # Create payslip
            # ------------------------------------------------

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

            # Get payslip ID
            db.flush()

            # ------------------------------------------------
            # Create payslip lines
            # ------------------------------------------------

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

            calculated_payslips.append(
                payslip
            )

        except ValueError as e:

            employee_name = (
                f"{employee.first_name} "
                f"{employee.last_name}"
            )

            errors.append(
                f"{employee.employee_code} "
                f"({employee_name}): {str(e)}"
            )

    # --------------------------------------------------------
    # If ANY employee has an error,
    # don't partially calculate the payrun.
    # --------------------------------------------------------

    if errors:

        db.rollback()

        error_message = (
            "Payrun calculation failed:\n"
            + "\n".join(errors)
        )

        raise ValueError(
            error_message
        )

    # --------------------------------------------------------
    # Calculate Payrun totals
    # --------------------------------------------------------

    total_employees = len(
        calculated_payslips
    )

    total_gross = sum(
        (
            payslip.gross_amount
            for payslip in calculated_payslips
        ),
        Decimal("0")
    )

    total_deductions = sum(
        (
            payslip.deduction_amount
            for payslip in calculated_payslips
        ),
        Decimal("0")
    )

    total_net = sum(
        (
            payslip.net_amount
            for payslip in calculated_payslips
        ),
        Decimal("0")
    )

    # --------------------------------------------------------
    # Update Payrun
    # --------------------------------------------------------

    payrun.total_employees = total_employees
    payrun.total_gross = total_gross
    payrun.total_deductions = total_deductions
    payrun.total_net = total_net
    payrun.status = "Calculated"

    # --------------------------------------------------------
    # Commit entire calculation
    # --------------------------------------------------------

    db.commit()

    db.refresh(payrun)

    return payrun


# ============================================================
# CANCEL PAYRUN
# ============================================================

def cancel_payrun(
    db: Session,
    payrun: Payrun
):
    if payrun.status == "Finalized":
        raise ValueError(
            "Finalized payrun cannot be cancelled"
        )

    if payrun.status == "Cancelled":
        raise ValueError(
            "Payrun is already cancelled"
        )

    payrun.status = "Cancelled"

    db.commit()
    db.refresh(payrun)

    return payrun

def finalize_payrun(
    db: Session,
    payrun: Payrun
):
    """
    Validate and finalize a calculated payrun.

    Finalization is allowed only when:
        - Payrun status is Calculated
        - At least one payslip exists
        - All payslips are Calculated
        - Every payslip has a contract
        - Every payslip has a salary structure
        - Payrun totals match the payslip totals

    Once finalized:
        - All payslips become Finalized
        - Payrun becomes Finalized
    """

    # --------------------------------
    # Payrun status validation
    # --------------------------------

    if payrun.status != "Calculated":
        raise ValueError(
            "Only Calculated payruns can be finalized"
        )

    # --------------------------------
    # Get active payslips
    # --------------------------------

    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun.id,
            Payslip.status != "Cancelled"
        )
        .order_by(Payslip.id)
        .all()
    )

    if not payslips:
        raise ValueError(
            "Cannot finalize payrun without payslips"
        )

    # --------------------------------
    # Validate every payslip
    # --------------------------------

    errors = []

    for payslip in payslips:

        if payslip.status != "Calculated":
            errors.append(
                f"Payslip {payslip.id} "
                f"has status '{payslip.status}'"
            )

        if not payslip.contract_id:
            errors.append(
                f"Payslip {payslip.id} has no contract"
            )

        if not payslip.salary_structure_id:
            errors.append(
                f"Payslip {payslip.id} "
                "has no salary structure"
            )

        if payslip.period_start != payrun.period_start:
            errors.append(
                f"Payslip {payslip.id} "
                "period start does not match payrun"
            )

        if payslip.period_end != payrun.period_end:
            errors.append(
                f"Payslip {payslip.id} "
                "period end does not match payrun"
            )

    # --------------------------------
    # Validate Payrun totals
    # --------------------------------

    calculated_gross = sum(
        (
            payslip.gross_amount
            for payslip in payslips
        ),
        Decimal("0")
    )

    calculated_deductions = sum(
        (
            payslip.deduction_amount
            for payslip in payslips
        ),
        Decimal("0")
    )

    calculated_net = sum(
        (
            payslip.net_amount
            for payslip in payslips
        ),
        Decimal("0")
    )

    if payrun.total_employees != len(payslips):
        errors.append(
            "Payrun employee total does not match "
            "the number of payslips"
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
    # Block finalization if errors exist
    # --------------------------------

    if errors:
        raise ValueError(
            "Payrun finalization failed:\n"
            + "\n".join(errors)
        )

    # --------------------------------
    # Finalize all payslips
    # --------------------------------

    for payslip in payslips:
        payslip.status = "Finalized"

    # --------------------------------
    # Finalize Payrun
    # --------------------------------

    payrun.status = "Finalized"

    db.commit()
    db.refresh(payrun)

    return payrun