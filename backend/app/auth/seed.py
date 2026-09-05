from app.database.connection import SessionLocal
from app.auth.model import Role, User
from app.core.security import hash_password


def seed_data():
    db = SessionLocal()

    try:
        # -------------------------
        # Create roles
        # -------------------------

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

        for role_data in roles:
            existing_role = (
                db.query(Role)
                .filter(Role.name == role_data["name"])
                .first()
            )

            if not existing_role:
                db.add(Role(**role_data))

        db.commit()

        # -------------------------
        # Create development admin
        # -------------------------

        admin_role = (
            db.query(Role)
            .filter(Role.name == "Admin")
            .first()
        )

        existing_user = (
            db.query(User)
            .filter(User.email == "admin@peoplepay360.com")
            .first()
        )

        if not existing_user:
            admin_user = User(
                email="admin@peoplepay360.com",
                password_hash=hash_password("Admin@123"),
                role_id=admin_role.id,
                is_active=True
            )

            db.add(admin_user)
            db.commit()

        print("Seed data created successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()