from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.payroll.payslip_schema import (
    PayslipCreate,
    PayslipResponse,
)

from app.payroll.payslip_service import (
    create_payslip,
    get_payslips,
    get_payslip,
    cancel_payslip,
)


payslip_router = APIRouter(
    prefix="/payslips",
    tags=["Payslips"]
)


@payslip_router.get(
    "/",
    response_model=list[PayslipResponse]
)
def get_all_payslips(
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
    return get_payslips(db)


@payslip_router.get(
    "/{payslip_id}",
    response_model=PayslipResponse
)
def get_single_payslip(
    payslip_id: int,
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
    payslip = get_payslip(
        db,
        payslip_id
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found"
        )

    return payslip


@payslip_router.post(
    "/",
    response_model=PayslipResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_payslip(
    payslip_data: PayslipCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_payslip(
            db,
            payslip_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@payslip_router.delete(
    "/{payslip_id}",
    response_model=PayslipResponse
)
def cancel_existing_payslip(
    payslip_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    payslip = get_payslip(
        db,
        payslip_id
    )

    if not payslip:
        raise HTTPException(
            status_code=404,
            detail="Payslip not found"
        )

    try:
        return cancel_payslip(
            db,
            payslip
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )