from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminUserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateUserRole(BaseModel):
    role: str


class UpdateUserStatus(BaseModel):
    is_active: bool