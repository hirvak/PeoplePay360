from datetime import date

from sqlalchemy.orm import Session

from app.contracts.model import Contract
from app.contracts.schema import ContractCreate, ContractUpdate
from app.employees.model import Employee
from app.schedules.model import Schedule


def validate_contract_dates(
    start_date: date,
    end_date: date | None
):
    if end_date is not None and end_date < start_date:
        raise ValueError(
            "Contract end date cannot be before start date"
        )


def check_contract_overlap(
    db: Session,
    employee_id: int,
    start_date: date,
    end_date: date | None,
    exclude_contract_id: int | None = None
):
    contracts = (
        db.query(Contract)
        .filter(
            Contract.employee_id == employee_id,
            Contract.is_active.is_(True)
        )
        .all()
    )

    for contract in contracts:
        if (
            exclude_contract_id is not None
            and contract.id == exclude_contract_id
        ):
            continue

        existing_start = contract.start_date
        existing_end = contract.end_date

        new_end = end_date

        if new_end is None:
            new_end = date.max

        if existing_end is None:
            existing_end = date.max

        if (
            start_date <= existing_end
            and existing_start <= new_end
        ):
            raise ValueError(
                "Contract dates overlap with an existing active contract"
            )


def validate_schedule(
    db: Session,
    schedule_id: int | None
):
    if schedule_id is None:
        return

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.is_active.is_(True)
        )
        .first()
    )

    if not schedule:
        raise ValueError(
            "Active schedule not found"
        )


def create_contract(
    db: Session,
    contract_data: ContractCreate
):
    employee = (
        db.query(Employee)
        .filter(
            Employee.id == contract_data.employee_id
        )
        .first()
    )

    if not employee:
        raise ValueError(
            "Employee not found"
        )

    validate_contract_dates(
        contract_data.start_date,
        contract_data.end_date
    )

    check_contract_overlap(
        db=db,
        employee_id=contract_data.employee_id,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date
    )

    validate_schedule(
        db=db,
        schedule_id=contract_data.schedule_id
    )

    contract = Contract(
        employee_id=contract_data.employee_id,
        start_date=contract_data.start_date,
        end_date=contract_data.end_date,
        department_id=contract_data.department_id,
        schedule_id=contract_data.schedule_id,
        job_position=contract_data.job_position,
        wage=contract_data.wage,
        status=contract_data.status,
    )

    db.add(contract)
    db.commit()
    db.refresh(contract)

    return contract


def get_contracts(db: Session):
    return (
        db.query(Contract)
        .order_by(Contract.id)
        .all()
    )


def get_contract(
    db: Session,
    contract_id: int
):
    return (
        db.query(Contract)
        .filter(
            Contract.id == contract_id
        )
        .first()
    )


def update_contract(
    db: Session,
    contract: Contract,
    contract_data: ContractUpdate
):
    update_data = contract_data.model_dump(
        exclude_unset=True
    )

    new_start_date = update_data.get(
        "start_date",
        contract.start_date
    )

    new_end_date = update_data.get(
        "end_date",
        contract.end_date
    )

    validate_contract_dates(
        new_start_date,
        new_end_date
    )

    check_contract_overlap(
        db=db,
        employee_id=contract.employee_id,
        start_date=new_start_date,
        end_date=new_end_date,
        exclude_contract_id=contract.id
    )

    if "schedule_id" in update_data:
        validate_schedule(
            db=db,
            schedule_id=update_data["schedule_id"]
        )

    for field, value in update_data.items():
        setattr(contract, field, value)

    db.commit()
    db.refresh(contract)

    return contract


def delete_contract(
    db: Session,
    contract: Contract
):
    contract.is_active = False
    contract.status = "Terminated"

    db.commit()
    db.refresh(contract)

    return contract