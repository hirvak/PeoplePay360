from app.database.connection import SessionLocal
from app.auth.model import Role


roles = [
    {
        "name": "Employee",
        "description": "Employee user with access to personal HR and payroll information."
    },
    {
        "name": "HR Manager",
        "description": "Manages employees, departments, attendance, and leave operations."
    },
    {
        "name": "HR Payroll User",
        "description": "Handles payroll-related HR operations."
    },
    {
        "name": "HR Payroll Manager",
        "description": "Manages and validates payroll operations."
    },
    {
        "name": "Admin",
        "description": "System administrator with full platform access."
    },
]


def seed_roles():
    db = SessionLocal()

    try:
        for role_data in roles:
            existing_role = (
                db.query(Role)
                .filter(Role.name == role_data["name"])
                .first()
            )

            if not existing_role:
                db.add(Role(**role_data))

        db.commit()
        print("Roles seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()