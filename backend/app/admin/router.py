from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.admin.schema import AdminUserResponse,UpdateUserRole,UpdateUserStatus
from app.admin.service import get_all_users,get_user_by_id,update_user_role,update_user_status
from app.core.dependencies import require_role
from app.database.connection import get_db

admin_router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@admin_router.get(
    "/users",
    response_model=list[AdminUserResponse]
)
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return get_all_users(db)


@admin_router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return get_user_by_id(db, user_id)


@admin_router.put(
    "/users/{user_id}/role",
    response_model=AdminUserResponse
)
def change_user_role(
    user_id: int,
    role_data: UpdateUserRole,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return update_user_role(
        db,
        user_id,
        role_data.role
    )


@admin_router.put(
    "/users/{user_id}/status",
    response_model=AdminUserResponse
)
def change_user_status(
    user_id: int,
    status_data: UpdateUserStatus,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("Admin"))
):
    return update_user_status(
        db,
        user_id,
        status_data.is_active
    )