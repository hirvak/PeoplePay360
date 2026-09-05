from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.payroll.payrun_schema import (
    PayrunCreate,
    PayrunResponse,
    PayrunUpdate,
)
from app.payroll.service import (
    create_payrun,
    get_payruns,
    get_payrun,
    update_payrun,
    calculate_payrun,
    finalize_payrun,
    cancel_payrun
)
from app.payroll.validation_service import validate_payrun
from app.payroll.validation_schema import PayrunValidationResponse
from app.payroll.service import mark_payrun_paid
payrun_router = APIRouter(
    prefix="/payruns",
    tags=["Payruns"]
)


@payrun_router.get(
    "/",
    response_model=list[PayrunResponse]
)
def get_all_payruns(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "HR Manager",
            "Admin"
        )
    )
):
    return get_payruns(db)


@payrun_router.get(
    "/{payrun_id}",
    response_model=PayrunResponse
)
def get_single_payrun(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "HR Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(db, payrun_id)

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    return payrun


@payrun_router.post(
    "/",
    response_model=PayrunResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_payrun(
    payrun_data: PayrunCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_payrun(
            db,
            payrun_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@payrun_router.put(
    "/{payrun_id}",
    response_model=PayrunResponse
)
def update_existing_payrun(
    payrun_id: int,
    payrun_data: PayrunUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(db, payrun_id)

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    try:
        return update_payrun(
            db,
            payrun,
            payrun_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@payrun_router.post(
    "/{payrun_id}/calculate",
    response_model=PayrunResponse
)
def calculate_existing_payrun(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(
        db,
        payrun_id
    )

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    try:
        return calculate_payrun(
            db,
            payrun
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    
@payrun_router.delete(
    "/{payrun_id}",
    response_model=PayrunResponse
)
def cancel_existing_payrun(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(db, payrun_id)

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    try:
        return cancel_payrun(
            db,
            payrun
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@payrun_router.post(
    "/{payrun_id}/finalize",
    response_model=PayrunResponse
)
def finalize_existing_payrun(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(
        db,
        payrun_id
    )

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    try:
        return finalize_payrun(
            db,
            payrun
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@payrun_router.post(
    "/{payrun_id}/validate",
    response_model=PayrunValidationResponse
)
def validate_existing_payrun(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(
        db,
        payrun_id
    )

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    return validate_payrun(
        db,
        payrun
    )

@payrun_router.post(
    "/{payrun_id}/mark-paid",
    response_model=PayrunResponse
)
def mark_payrun_as_paid(
    payrun_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payrun = get_payrun(
        db,
        payrun_id
    )

    if not payrun:
        raise HTTPException(
            status_code=404,
            detail="Payrun not found"
        )

    try:
        return mark_payrun_paid(
            db,
            payrun
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )