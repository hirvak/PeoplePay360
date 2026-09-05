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

from app.core.dependencies import require_role
from app.database.connection import get_db


contract_router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


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
    contract = get_contract(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


@contract_router.post(
    "/",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_contract(
    contract_data: ContractCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("HR Manager", "Admin")
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


@contract_router.put(
    "/{contract_id}",
    response_model=ContractResponse
)
def update_existing_contract(
    contract_id: int,
    contract_data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("HR Manager", "Admin")
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


@contract_router.delete(
    "/{contract_id}",
    response_model=ContractResponse
)
def delete_existing_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("HR Manager", "Admin")
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