from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth.schema import LoginRequest,RoleCreate,RoleResponse,TokenResponse
from app.auth.service import authenticate_user,create_role,get_roles,get_role
from app.core.security import create_access_token
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.auth.model import User

# -------------------------
# Role Router
# -------------------------

role_router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@role_router.post(
    "/",
    response_model=RoleResponse,
    status_code=201
)
def create_new_role(
    role_data: RoleCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_role(db, role_data)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@role_router.get(
    "/",
    response_model=list[RoleResponse]
)
def get_all_roles(
    db: Session = Depends(get_db)
):
    return get_roles(db)


@role_router.get(
    "/{role_id}",
    response_model=RoleResponse
)
def get_single_role(
    role_id: int,
    db: Session = Depends(get_db)
):
    role = get_role(db, role_id)

    if not role:
        raise HTTPException(
            status_code=404,
            detail="Role not found"
        )

    return role


# -------------------------
# Auth Router
# -------------------------

auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@auth_router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = authenticate_user(
        db,
        login_data.email,
        login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role.name
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@auth_router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name,
        "is_active": current_user.is_active
    }