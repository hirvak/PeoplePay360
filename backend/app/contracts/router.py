from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.contracts.schema import (
    ContractCreate,
    ContractResponse,
    ContractUpdate,
)

from app.contracts.service import (
    create_contract,
    get_contracts,
    get_contract,
    update_contract,
    delete_contract,
)

from app.core.dependencies import (
    require_role,
    get_current_employee,
)

from app.database.connection import get_db
from app.contracts.model import Contract


contract_router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


# ============================================================
# GET MY CONTRACTS
# Employee can see ONLY their own contracts
# ============================================================

@contract_router.get(
    "/me",
    response_model=list[ContractResponse]
)
def get_my_contracts(
    current_employee=Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    return (
        db.query(Contract)
        .filter(
            Contract.employee_id == current_employee.id
        )
        .order_by(Contract.start_date.desc())
        .all()
    )


# ============================================================
# GET ALL CONTRACTS
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@contract_router.get(
    "/",
    response_model=list[ContractResponse]
)
def get_all_contracts(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_contracts(db)


# ============================================================
# GET SINGLE CONTRACT
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@contract_router.get(
    "/{contract_id}",
    response_model=ContractResponse
)
def get_single_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    contract = get_contract(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


# ============================================================
# CREATE CONTRACT
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@contract_router.post(
    "/",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_contract(
    contract_data: ContractCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_contract(
            db,
            contract_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# UPDATE CONTRACT
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@contract_router.put(
    "/{contract_id}",
    response_model=ContractResponse
)
def update_existing_contract(
    contract_id: int,
    contract_data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    contract = get_contract(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    try:
        return update_contract(
            db,
            contract,
            contract_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DELETE CONTRACT
# HR Manager / HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@contract_router.delete(
    "/{contract_id}",
    response_model=ContractResponse
)
def delete_existing_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    contract = get_contract(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return delete_contract(
        db,
        contract
    )