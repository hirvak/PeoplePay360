from sqlalchemy.orm import Session, joinedload

from app.auth.model import User
from app.employees.model import Employee
from app.employees.schema import EmployeeCreate, EmployeeUpdate
from app.schedules.model import Schedule


def create_employee(
    db: Session,
    employee_data: EmployeeCreate
):
    # Check employee code
    existing_employee = db.query(Employee).filter(
        Employee.employee_code == employee_data.employee_code
    ).first()

    if existing_employee:
        raise ValueError("Employee code already exists")

    # Check user if provided
    if employee_data.user_id is not None:
        existing_user = db.query(Employee).filter(
            Employee.user_id == employee_data.user_id
        ).first()

        if existing_user:
            raise ValueError("User is already linked to an employee")

    # Check manager
    if employee_data.manager_id is not None:
        manager = db.query(Employee).filter(
            Employee.id == employee_data.manager_id
        ).first()

        if not manager:
            raise ValueError("Manager not found")

    # Check schedule if provided
    if employee_data.schedule_id is not None:
        schedule = db.query(Schedule).filter(
            Schedule.id == employee_data.schedule_id,
            Schedule.is_active.is_(True)
        ).first()

        if not schedule:
            raise ValueError("Active schedule not found")

    # Create employee
    employee = Employee(
        user_id=employee_data.user_id,
        employee_code=employee_data.employee_code,
        first_name=employee_data.first_name,
        last_name=employee_data.last_name,
        department_id=employee_data.department_id,
        schedule_id=employee_data.schedule_id,
        manager_id=employee_data.manager_id,
        job_position=employee_data.job_position,
        employment_status=employee_data.employment_status,
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


def _enrich_employee_names(employee: Employee):
    if employee.user:
        employee.user_email = employee.user.email
        employee.user_role = (
            employee.user.role.name
            if employee.user.role
            else None
        )
    else:
        employee.user_email = None
        employee.user_role = None

    if employee.department:
        employee.department_name = employee.department.name
    else:
        employee.department_name = None

    if employee.schedule:
        employee.schedule_name = employee.schedule.name
    else:
        employee.schedule_name = None

    if employee.manager:
        employee.manager_name = f"{employee.manager.first_name} {employee.manager.last_name}"
    else:
        employee.manager_name = None


def get_employees(db: Session):
    employees = (
        db.query(Employee)
        .options(
            joinedload(Employee.user).joinedload(User.role),
            joinedload(Employee.schedule),
            joinedload(Employee.department),
            joinedload(Employee.manager),
        )
        .order_by(Employee.id)
        .all()
    )

    for employee in employees:
        _enrich_employee_names(employee)

    return employees


def get_employee(
    db: Session,
    employee_id: int
):
    employee = (
        db.query(Employee)
        .options(
            joinedload(Employee.user).joinedload(User.role),
            joinedload(Employee.schedule),
            joinedload(Employee.department),
            joinedload(Employee.manager),
        )
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        return None

    _enrich_employee_names(employee)

    return employee


def update_employee(
    db: Session,
    employee: Employee,
    employee_data: EmployeeUpdate
):
    update_data = employee_data.model_dump(
        exclude_unset=True
    )

    # Validate manager if being changed
    if "manager_id" in update_data:
        manager_id = update_data["manager_id"]

        if manager_id is not None:
            if manager_id == employee.id:
                raise ValueError(
                    "Employee cannot be their own manager"
                )

            manager = db.query(Employee).filter(
                Employee.id == manager_id
            ).first()

            if not manager:
                raise ValueError("Manager not found")

    # Validate schedule if being changed
    if "schedule_id" in update_data:
        schedule_id = update_data["schedule_id"]

        if schedule_id is not None:
            schedule = db.query(Schedule).filter(
                Schedule.id == schedule_id,
                Schedule.is_active.is_(True)
            ).first()

            if not schedule:
                raise ValueError("Active schedule not found")

    # Apply updates
    for field, value in update_data.items():
        setattr(employee, field, value)

    db.commit()
    db.refresh(employee)

    return employee


def delete_employee(
    db: Session,
    employee: Employee
):
    employee.is_active = False

    db.commit()
    db.refresh(employee)

    return employee