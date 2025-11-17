from fastapi import APIRouter, Body, HTTPException
from typing import List
from src.services import user_service
from pydantic import BaseModel, EmailStr
from src.models import User, UserOut, PydanticObjectId
from typing import Optional
from datetime import datetime, timezone

router = APIRouter()


class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    password: str  # This will be hashed in the service


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None  # This will be hashed in the service
    role: Optional[str] = None
    school_id: Optional[PydanticObjectId] = None


@router.post("/", response_model=UserOut)
def create_user(user_data: UserCreateRequest = Body(...)):
    # In a real app, hash password here or in service before creating User object
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,  # This should be hashed before saving
        role="student",  # Default role for direct creation, can be changed by admin
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    created_user = user_service.create_user(new_user)
    return UserOut(**created_user.model_dump())


@router.get("/", response_model=List[UserOut])
def get_users():
    return user_service.get_users()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: PydanticObjectId):
    user = user_service.get_user(user_id)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: PydanticObjectId, user_data: UserUpdateRequest = Body(...)):
    update_data = user_data.model_dump(exclude_unset=True)
    if "password" in update_data:
        # Hash password before updating
        pass  # Hashing logic will be implemented in auth or service

    updated_user = user_service.update_user(user_id, update_data)
    if updated_user:
        return updated_user
    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/{user_id}")
def delete_user(user_id: PydanticObjectId):
    result = user_service.delete_user(user_id)
    if result["deleted_count"] == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

