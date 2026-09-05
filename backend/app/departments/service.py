from sqlalchemy.orm import Session

from app.departments.model import Department
from app.departments.schema import (
    DepartmentCreate,
    DepartmentUpdate,
)


def create_department(
    db: Session,
    department_data: DepartmentCreate
):
    existing_department = (
        db.query(Department)
        .filter(Department.name == department_data.name)
        .first()
    )

    if existing_department:
        raise ValueError("Department already exists")

    department = Department(
        name=department_data.name,
        description=department_data.description
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


def get_departments(db: Session):
    return (
        db.query(Department)
        .order_by(Department.id)
        .all()
    )


def get_department(
    db: Session,
    department_id: int
):
    return (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )


def update_department(
    db: Session,
    department: Department,
    department_data: DepartmentUpdate
):
    update_data = department_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        existing_department = (
            db.query(Department)
            .filter(
                Department.name == update_data["name"],
                Department.id != department.id
            )
            .first()
        )

        if existing_department:
            raise ValueError("Department already exists")

    for field, value in update_data.items():
        setattr(department, field, value)

    db.commit()
    db.refresh(department)

    return department


def delete_department(
    db: Session,
    department: Department
):
    department.is_active = False

    db.commit()
    db.refresh(department)

    return department