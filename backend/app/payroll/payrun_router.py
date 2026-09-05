from datetime import date

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
    cancel_payrun,
    mark_payrun_paid,
    get_eligible_employees,
)

from app.payroll.validation_service import validate_payrun
from app.payroll.validation_schema import PayrunValidationResponse


payrun_router = APIRouter(
    prefix="/payruns",
    tags=["Payruns"]
)


# ============================================================
# GET ELIGIBLE EMPLOYEES FOR PAYRUN WIZARD
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@payrun_router.get(
    "/eligible-employees"
)
def get_payrun_eligible_employees(
    salary_structure_id: int,
    period_start: date,
    period_end: date,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    if period_end < period_start:
        raise HTTPException(
            status_code=400,
            detail=(
                "Payrun period end date cannot be "
                "before start date"
            )
        )

    try:
        employees = get_eligible_employees(
            db=db,
            salary_structure_id=salary_structure_id,
            period_start=period_start,
            period_end=period_end
        )

        return [
            {
                "id": employee.id,
                "employee_code": employee.employee_code,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "job_position": employee.job_position,
                "department_id": employee.department_id,
                "employment_status": employee.employment_status,
            }
            for employee in employees
        ]

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# GET ALL PAYRUNS
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

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
            "Admin"
        )
    )
):
    return get_payruns(db)


# ============================================================
# GET SINGLE PAYRUN
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

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

    return payrun


# ============================================================
# CREATE PAYRUN
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

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
            "HR Payroll User",
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


# ============================================================
# UPDATE PAYRUN
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

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
            "HR Payroll User",
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


# ============================================================
# CALCULATE PAYRUN
# HR Payroll Manager / Admin
# ============================================================

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


# ============================================================
# CANCEL PAYRUN
# HR Payroll Manager / Admin
# ============================================================

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
        return cancel_payrun(
            db,
            payrun
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# FINALIZE PAYRUN
# HR Payroll Manager / Admin
# ============================================================

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


# ============================================================
# VALIDATE PAYRUN
# HR Payroll Manager / Admin
# ============================================================

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


# ============================================================
# MARK PAYRUN AS PAID
# HR Payroll Manager / Admin
# ============================================================

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