from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.departments.schema import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)

from app.departments.service import (
    create_department,
    get_departments,
    get_department,
    update_department,
    delete_department,
)


department_router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


# GET ALL DEPARTMENTS
@department_router.get(
    "/",
    response_model=list[DepartmentResponse]
)
def get_all_departments(
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
    return get_departments(db)


# GET SINGLE DEPARTMENT
@department_router.get(
    "/{department_id}",
    response_model=DepartmentResponse
)
def get_single_department(
    department_id: int,
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
    department = get_department(
        db,
        department_id
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return department


# CREATE DEPARTMENT
@department_router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    try:
        return create_department(
            db,
            department_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# UPDATE DEPARTMENT
@department_router.put(
    "/{department_id}",
    response_model=DepartmentResponse
)
def update_existing_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    department = get_department(
        db,
        department_id
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    try:
        return update_department(
            db,
            department,
            department_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# DELETE / DEACTIVATE DEPARTMENT
@department_router.delete(
    "/{department_id}",
    response_model=DepartmentResponse
)
def delete_existing_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    department = get_department(
        db,
        department_id
    )

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return delete_department(
        db,
        department
    )