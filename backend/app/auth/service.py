from sqlalchemy.orm import Session

from app.auth.model import Role
from app.auth.schema import RoleCreate


def create_role(db: Session, role_data: RoleCreate):
    existing_role = (
        db.query(Role)
        .filter(Role.name == role_data.name)
        .first()
    )

    if existing_role:
        raise ValueError("Role already exists")

    role = Role(
        name=role_data.name,
        description=role_data.description
    )

    db.add(role)
    db.commit()
    db.refresh(role)

    return role


def get_roles(db: Session):
    return db.query(Role).all()


def get_role(db: Session, role_id: int):
    return (
        db.query(Role)
        .filter(Role.id == role_id)
        .first()
    )