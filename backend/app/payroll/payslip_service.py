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


VALID_PAYSLIP_STATUSES = {
    "Draft",
    "Calculated",
    "Finalized",
    "Cancelled",
}


def validate_payslip_dates(
    period_start: date,
    period_end: date
):
    if period_end < period_start:
        raise ValueError(
            "Payslip period end date cannot be before start date"
        )


def get_applicable_contract(
    db: Session,
    employee_id: int,
    period_start: date,
    period_end: date
):
    contracts = db.query(Contract).filter(
        Contract.employee_id == employee_id,
        Contract.is_active.is_(True),
        Contract.start_date <= period_end,
        (
            (Contract.end_date.is_(None))
            | (Contract.end_date >= period_start)
        ),
    ).all()

    if not contracts:
        raise ValueError(
            "No applicable active contract found for employee"
        )

    if len(contracts) > 1:
        raise ValueError(
            "Multiple applicable active contracts found for employee"
        )

    return contracts[0]


def validate_salary_structure(
    db: Session,
    salary_structure_id: int
):
    salary_structure = db.query(
        SalaryStructure
    ).filter(
        SalaryStructure.id == salary_structure_id,
        SalaryStructure.is_active.is_(True)
    ).first()

    if not salary_structure:
        raise ValueError(
            "Active Salary Structure not found"
        )

    return salary_structure


def create_payslip(
    db: Session,
    payslip_data: PayslipCreate
):
    

    validate_payslip_dates(
        payslip_data.period_start,
        payslip_data.period_end
    )



    employee = db.query(Employee).filter(
        Employee.id == payslip_data.employee_id
    ).first()

    if not employee:
        raise ValueError(
            "Employee not found"
        )



    payrun = db.query(Payrun).filter(
        Payrun.id == payslip_data.payrun_id
    ).first()

    if not payrun:
        raise ValueError(
            "Payrun not found"
        )

    if payrun.status in {
        "Finalized",
        "Cancelled"
    }:
        raise ValueError(
            "Payslip cannot be created for a finalized or cancelled payrun"
        )

    # Payslip period must exactly match
    # the Payrun period.

    if (
        payslip_data.period_start != payrun.period_start
        or payslip_data.period_end != payrun.period_end
    ):
        raise ValueError(
            "Payslip period must match payrun period"
        )


    existing_payslip = db.query(Payslip).filter(
        Payslip.payrun_id == payslip_data.payrun_id,
        Payslip.employee_id == payslip_data.employee_id
    ).first()

    if existing_payslip:
        raise ValueError(
            "Payslip already exists for this employee in this payrun"
        )

    contract = get_applicable_contract(
        db=db,
        employee_id=payslip_data.employee_id,
        period_start=payslip_data.period_start,
        period_end=payslip_data.period_end
    )

    # The contract selected by the frontend
    # must be the actually applicable contract.

    if contract.id != payslip_data.contract_id:
        raise ValueError(
            "Provided contract is not the applicable contract for this period"
        )

    # --------------------------------
    # Validate Salary Structure
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
    # Validate Contract Wage
    # --------------------------------

    if payslip_data.basic_wage != contract.wage:
        raise ValueError(
            "Basic wage does not match the employee contract"
        )

    # --------------------------------
    # RUN PAYROLL ENGINE
    # --------------------------------

    payroll_result = calculate_salary_rules(
        db=db,
        salary_structure_id=salary_structure.id,
        basic_wage=contract.wage
    )

    # --------------------------------
    # Create Payslip
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

    # Flush so payslip.id is available
    # before creating payslip lines.

    db.flush()

    # --------------------------------
    # Create Payslip Lines
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

    payrun.total_employees = (
        db.query(Payslip)
        .filter(
            Payslip.payrun_id == payrun.id,
            Payslip.status != "Cancelled"
        )
        .count()
    )

    payrun.total_gross = (
        (payrun.total_gross or 0)
        + payroll_result["gross"]
    )

    payrun.total_deductions = (
        (payrun.total_deductions or 0)
        + payroll_result["deductions"]
    )

    payrun.total_net = (
        (payrun.total_net or 0)
        + payroll_result["net"]
    )

    payrun.status = "Calculated"

    # --------------------------------
    # Commit Everything Together
    # --------------------------------

    db.commit()

    db.refresh(payslip)

    return payslip


def get_payslips(db: Session):
    return (
        db.query(Payslip)
        .order_by(
            Payslip.period_start.desc(),
            Payslip.id.desc()
        )
        .all()
    )


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


def cancel_payslip(
    db: Session,
    payslip: Payslip
):
    if payslip.status == "Finalized":
        raise ValueError(
            "Finalized payslip cannot be cancelled"
        )

    if payslip.status == "Cancelled":
        raise ValueError(
            "Payslip is already cancelled"
        )

    payslip.status = "Cancelled"

    # --------------------------------
    # Update Payrun Totals
    # --------------------------------

    payrun = db.query(Payrun).filter(
        Payrun.id == payslip.payrun_id
    ).first()

    if payrun:
        payrun.total_employees = max(
            0,
            payrun.total_employees - 1
        )

        payrun.total_gross = max(
            0,
            payrun.total_gross - payslip.gross_amount
        )

        payrun.total_deductions = max(
            0,
            payrun.total_deductions - payslip.deduction_amount
        )

        payrun.total_net = max(
            0,
            payrun.total_net - payslip.net_amount
        )

    db.commit()

    db.refresh(payslip)

    return payslip