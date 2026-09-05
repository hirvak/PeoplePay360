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
    "Paid",
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
# SALARY STRUCTURE VALIDATION
# ============================================================

def get_active_salary_structure(
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
# EMPLOYEE ELIGIBILITY
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
                | (
                    Contract.end_date >= period_start
                )
            ),
        )
        .all()
    )

    if not contracts:
        raise ValueError(
            "No applicable active contract found"
        )

    if len(contracts) > 1:
        raise ValueError(
            "Multiple applicable active contracts found"
        )

    return contracts[0]


def get_eligible_employees(
    db: Session,
    salary_structure_id: int,
    period_start: date,
    period_end: date
):
    """
    Return active employees who are eligible for
    the selected salary structure and payrun period.

    Eligibility requires:
        - Employee is active
        - Exactly one applicable active contract
        - Contract has the selected salary structure
    """

    get_active_salary_structure(
        db,
        salary_structure_id
    )

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

    eligible_employees = []

    for employee in employees:

        try:
            contract = get_applicable_contract(
                db=db,
                employee_id=employee.id,
                period_start=period_start,
                period_end=period_end
            )

            if contract.salary_structure_id != salary_structure_id:
                continue

            eligible_employees.append(employee)

        except ValueError:
            continue

    return eligible_employees


# ============================================================
# VALIDATE SELECTED EMPLOYEES
# ============================================================

def validate_selected_employees(
    db: Session,
    selected_employee_ids: list[int],
    salary_structure_id: int,
    period_start: date,
    period_end: date
):
    if not selected_employee_ids:
        raise ValueError(
            "At least one employee must be selected"
        )

    # Remove duplicate IDs while preserving order
    unique_employee_ids = list(
        dict.fromkeys(selected_employee_ids)
    )

    if len(unique_employee_ids) != len(
        selected_employee_ids
    ):
        raise ValueError(
            "Duplicate employee IDs are not allowed"
        )

    get_active_salary_structure(
        db,
        salary_structure_id
    )

    employees = (
        db.query(Employee)
        .filter(
            Employee.id.in_(unique_employee_ids)
        )
        .all()
    )

    employee_map = {
        employee.id: employee
        for employee in employees
    }

    errors = []

    for employee_id in unique_employee_ids:

        employee = employee_map.get(
            employee_id
        )

        if not employee:
            errors.append(
                f"Employee {employee_id} not found"
            )
            continue

        if not employee.is_active:
            errors.append(
                f"Employee {employee.employee_code} "
                "is inactive"
            )
            continue

        try:
            contract = get_applicable_contract(
                db=db,
                employee_id=employee.id,
                period_start=period_start,
                period_end=period_end
            )

            if contract.salary_structure_id != salary_structure_id:
                errors.append(
                    f"{employee.employee_code}: "
                    "applicable contract does not use "
                    "the selected Salary Structure"
                )

        except ValueError as e:

            errors.append(
                f"{employee.employee_code}: {str(e)}"
            )

    if errors:
        raise ValueError(
            "Selected employee validation failed:\n"
            + "\n".join(errors)
        )

    return [
        employee_map[employee_id]
        for employee_id in unique_employee_ids
    ]


# ============================================================
# CREATE PAYRUN
# ============================================================

def create_payrun(
    db: Session,
    payrun_data: PayrunCreate
):
    """
    Create a Draft Payrun.

    The payrun stores:
        - Salary Structure
        - Period
        - Explicitly selected employees

    Payroll is not calculated at creation time.
    """

    validate_payrun_dates(
        payrun_data.period_start,
        payrun_data.period_end
    )

    check_payrun_overlap(
        db=db,
        period_start=payrun_data.period_start,
        period_end=payrun_data.period_end
    )

    # Validate selected salary structure
    get_active_salary_structure(
        db,
        payrun_data.salary_structure_id
    )

    # Validate selected employees
    validate_selected_employees(
        db=db,
        selected_employee_ids=(
            payrun_data.selected_employee_ids
        ),
        salary_structure_id=(
            payrun_data.salary_structure_id
        ),
        period_start=payrun_data.period_start,
        period_end=payrun_data.period_end
    )

    payrun = Payrun(
        name=payrun_data.name,
        period_start=payrun_data.period_start,
        period_end=payrun_data.period_end,
        salary_structure_id=(
            payrun_data.salary_structure_id
        ),
        selected_employee_ids=(
            payrun_data.selected_employee_ids
        ),
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

    new_salary_structure_id = update_data.get(
        "salary_structure_id",
        payrun.salary_structure_id
    )

    new_employee_ids = update_data.get(
        "selected_employee_ids",
        payrun.selected_employee_ids
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

    # Validate new salary structure and employees
    validate_selected_employees(
        db=db,
        selected_employee_ids=new_employee_ids,
        salary_structure_id=new_salary_structure_id,
        period_start=new_period_start,
        period_end=new_period_end
    )

    # Update normal fields
    payrun.name = update_data.get(
        "name",
        payrun.name
    )

    payrun.period_start = new_period_start
    payrun.period_end = new_period_end
    payrun.salary_structure_id = (
        new_salary_structure_id
    )
    payrun.selected_employee_ids = (
        new_employee_ids
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
    Calculate payroll only for the employees explicitly
    selected in the Payrun.

    Workflow:

        Salary Structure
                +
        Selected Employees
                +
        Payrun Period
                ↓
        Applicable Contracts
                ↓
        Salary Rules
                ↓
        Payroll Engine
                ↓
        Payslips
                ↓
        Payslip Lines
    """

    # --------------------------------------------------------
    # Payrun must be Draft
    # --------------------------------------------------------

    if payrun.status != "Draft":
        raise ValueError(
            "Only Draft payruns can be calculated"
        )

    # --------------------------------------------------------
    # Validate salary structure
    # --------------------------------------------------------

    salary_structure = get_active_salary_structure(
        db,
        payrun.salary_structure_id
    )

    # --------------------------------------------------------
    # Validate selected employees
    # --------------------------------------------------------

    employees = validate_selected_employees(
        db=db,
        selected_employee_ids=(
            payrun.selected_employee_ids
        ),
        salary_structure_id=(
            payrun.salary_structure_id
        ),
        period_start=payrun.period_start,
        period_end=payrun.period_end
    )

    calculated_payslips = []
    errors = []

    # --------------------------------------------------------
    # Process selected employees only
    # --------------------------------------------------------

    for employee in employees:

        try:

            # ------------------------------------------------
            # Find applicable contract
            # ------------------------------------------------

            contract = get_applicable_contract(
                db=db,
                employee_id=employee.id,
                period_start=payrun.period_start,
                period_end=payrun.period_end
            )

            # ------------------------------------------------
            # Contract must use selected structure
            # ------------------------------------------------

            if contract.salary_structure_id != (
                payrun.salary_structure_id
            ):
                raise ValueError(
                    "Employee contract does not use "
                    "the selected Salary Structure"
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
                salary_structure_id=(
                    salary_structure.id
                ),
                basic_wage=contract.wage
            )

            # ------------------------------------------------
            # Create payslip
            # ------------------------------------------------

            payslip = Payslip(
                payrun_id=payrun.id,
                employee_id=employee.id,
                contract_id=contract.id,
                salary_structure_id=(
                    salary_structure.id
                ),
                period_start=payrun.period_start,
                period_end=payrun.period_end,
                basic_wage=contract.wage,
                gross_amount=(
                    payroll_result["gross"]
                ),
                deduction_amount=(
                    payroll_result["deductions"]
                ),
                net_amount=(
                    payroll_result["net"]
                ),
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
    # If ANY selected employee has an error,
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
    if payrun.status in {
        "Finalized",
        "Paid"
    }:
        raise ValueError(
            "Finalized or Paid payrun cannot be cancelled"
        )

    if payrun.status == "Cancelled":
        raise ValueError(
            "Payrun is already cancelled"
        )

    payrun.status = "Cancelled"

    db.commit()
    db.refresh(payrun)

    return payrun


# ============================================================
# FINALIZE PAYRUN
# ============================================================

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
        - Every payslip has the selected salary structure
        - Every payslip period matches the payrun
        - Payrun totals match payslip totals
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

    errors = []

    # --------------------------------
    # Validate every payslip
    # --------------------------------

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

        if payslip.salary_structure_id != (
            payrun.salary_structure_id
        ):
            errors.append(
                f"Payslip {payslip.id} "
                "does not use the Payrun Salary Structure"
            )

        if payslip.period_start != (
            payrun.period_start
        ):
            errors.append(
                f"Payslip {payslip.id} "
                "period start does not match payrun"
            )

        if payslip.period_end != (
            payrun.period_end
        ):
            errors.append(
                f"Payslip {payslip.id} "
                "period end does not match payrun"
            )

        # --------------------------------
        # Validate employee
        # --------------------------------

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == payslip.employee_id
            )
            .first()
        )

        if not employee:
            errors.append(
                f"Payslip {payslip.id}: "
                "Employee not found"
            )
            continue

        if not employee.is_active:
            errors.append(
                f"Payslip {payslip.id}: "
                "Employee is inactive"
            )

        if payslip.employee_id not in (
            payrun.selected_employee_ids
        ):
            errors.append(
                f"Payslip {payslip.id}: "
                "Employee was not selected for this payrun"
            )

        # --------------------------------
        # Validate contract
        # --------------------------------

        if payslip.contract_id:

            contract = (
                db.query(Contract)
                .filter(
                    Contract.id == payslip.contract_id
                )
                .first()
            )

            if not contract:
                errors.append(
                    f"Payslip {payslip.id}: "
                    "Contract not found"
                )
            else:

                if contract.employee_id != (
                    payslip.employee_id
                ):
                    errors.append(
                        f"Payslip {payslip.id}: "
                        "Contract does not belong "
                        "to the payslip employee"
                    )

                if not contract.is_active:
                    errors.append(
                        f"Payslip {payslip.id}: "
                        "Contract is inactive"
                    )

                if contract.start_date > (
                    payrun.period_start
                ):
                    errors.append(
                        f"Payslip {payslip.id}: "
                        "Contract starts after "
                        "the payrun period"
                    )

                if (
                    contract.end_date is not None
                    and contract.end_date < (
                        payrun.period_end
                    )
                ):
                    errors.append(
                        f"Payslip {payslip.id}: "
                        "Contract ends before "
                        "the payrun period"
                    )

                if contract.salary_structure_id != (
                    payrun.salary_structure_id
                ):
                    errors.append(
                        f"Payslip {payslip.id}: "
                        "Contract does not use "
                        "the Payrun Salary Structure"
                    )

        # --------------------------------
        # Validate salary structure
        # --------------------------------

        salary_structure = (
            db.query(SalaryStructure)
            .filter(
                SalaryStructure.id == (
                    payslip.salary_structure_id
                ),
                SalaryStructure.is_active.is_(True)
            )
            .first()
        )

        if not salary_structure:
            errors.append(
                f"Payslip {payslip.id}: "
                "Active Salary Structure not found"
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

    if payrun.total_employees != len(
        payslips
    ):
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
    # Validate selected employee count
    # --------------------------------

    selected_employee_count = len(
        payrun.selected_employee_ids
    )

    if selected_employee_count != len(
        payslips
    ):
        errors.append(
            "Selected employee count does not match "
            "the number of payslips"
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


# ============================================================
# MARK PAYRUN AS PAID
# ============================================================

def mark_payrun_paid(
    db: Session,
    payrun: Payrun
):
    if payrun.status != "Finalized":
        raise ValueError(
            "Only Finalized payruns can be marked as Paid"
        )

    payslips = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun.id,
            Payslip.status != "Cancelled"
        )
        .all()
    )

    if not payslips:
        raise ValueError(
            "Cannot mark payrun as Paid because "
            "no payslips exist"
        )

    for payslip in payslips:

        if payslip.status != "Finalized":
            raise ValueError(
                f"Payslip {payslip.id} is not Finalized"
            )

    for payslip in payslips:
        payslip.status = "Paid"

    payrun.status = "Paid"

    db.commit()
    db.refresh(payrun)

    return payrun