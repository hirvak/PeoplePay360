from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.employees.schema import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)

from app.employees.service import (
    create_employee,
    get_employees,
    get_employee,
    update_employee,
    delete_employee,
)


employee_router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


# GET ALL EMPLOYEES
@employee_router.get(
    "/",
    response_model=list[EmployeeResponse]
)
def get_all_employees(
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
    return get_employees(db)


# GET SINGLE EMPLOYEE
@employee_router.get(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def get_single_employee(
    employee_id: int,
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
    employee = get_employee(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


# CREATE EMPLOYEE
@employee_router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED
)
def create_new_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    try:
        return create_employee(
            db,
            employee_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# UPDATE EMPLOYEE
@employee_router.put(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def update_existing_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    employee = get_employee(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    try:
        return update_employee(
            db,
            employee,
            employee_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# DELETE / DEACTIVATE EMPLOYEE
@employee_router.delete(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def delete_existing_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "HR Manager",
            "Admin"
        )
    )
):
    employee = get_employee(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return delete_employee(
        db,
        employee
    )