from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.schema import RoleCreate, RoleResponse
from app.auth.service import create_role, get_roles, get_role
from app.database.connection import get_db


router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)


@router.post("/", response_model=RoleResponse, status_code=201)
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


@router.get("/", response_model=list[RoleResponse])
def get_all_roles(
    db: Session = Depends(get_db)
):
    return get_roles(db)


@router.get("/{role_id}", response_model=RoleResponse)
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