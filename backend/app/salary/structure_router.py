from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.salary.structure_schema import (
    SalaryStructureCreate,
    SalaryStructureResponse,
    SalaryStructureUpdate,
)

from app.salary.service import (
    create_salary_structure,
    get_salary_structures,
    get_salary_structure,
    update_salary_structure,
    delete_salary_structure,
)


salary_structure_router = APIRouter(
    prefix="/salary-structures",
    tags=["Salary Structures"]
)


# ============================================================
# GET ALL SALARY STRUCTURES
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@salary_structure_router.get(
    "/",
    response_model=list[SalaryStructureResponse]
)
def get_all_salary_structures(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    return get_salary_structures(db)


# ============================================================
# GET SINGLE SALARY STRUCTURE
# HR Payroll User / HR Payroll Manager / Admin
# ============================================================

@salary_structure_router.get(
    "/{structure_id}",
    response_model=SalaryStructureResponse
)
def get_single_salary_structure(
    structure_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll User",
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_structure = get_salary_structure(
        db,
        structure_id
    )

    if not salary_structure:
        raise HTTPException(
            status_code=404,
            detail="Salary Structure not found"
        )

    return salary_structure


# ============================================================
# CREATE SALARY STRUCTURE
# HR Payroll Manager / Admin
# ============================================================

@salary_structure_router.post(
    "/",
    response_model=SalaryStructureResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_salary_structure(
    structure_data: SalaryStructureCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    try:
        return create_salary_structure(
            db,
            structure_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# UPDATE SALARY STRUCTURE
# HR Payroll Manager / Admin
# ============================================================

@salary_structure_router.put(
    "/{structure_id}",
    response_model=SalaryStructureResponse
)
def update_existing_salary_structure(
    structure_id: int,
    structure_data: SalaryStructureUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_structure = get_salary_structure(
        db,
        structure_id
    )

    if not salary_structure:
        raise HTTPException(
            status_code=404,
            detail="Salary Structure not found"
        )

    try:
        return update_salary_structure(
            db,
            salary_structure,
            structure_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# DELETE SALARY STRUCTURE
# HR Payroll Manager / Admin
# ============================================================

@salary_structure_router.delete(
    "/{structure_id}",
    response_model=SalaryStructureResponse
)
def delete_existing_salary_structure(
    structure_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Payroll Manager",
            "Admin"
        )
    )
):
    salary_structure = get_salary_structure(
        db,
        structure_id
    )

    if not salary_structure:
        raise HTTPException(
            status_code=404,
            detail="Salary Structure not found"
        )

    return delete_salary_structure(
        db,
        salary_structure
    )