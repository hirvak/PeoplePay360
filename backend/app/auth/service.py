from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.auth.model import Role,User
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

def authenticate_user(
    db: Session,
    email: str,
    password: str
):
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user


def login_user(
    db: Session,
    email: str,
    password: str
):
    user = authenticate_user(
        db,
        email,
        password
    )

    if not user:
        return None

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.name
    })

    return token