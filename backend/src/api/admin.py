from fastapi import APIRouter, Body, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import hashlib
import secrets
from datetime import datetime
from database import db
from models import User, School, PydanticObjectId, RegistrationToken
from api.auth import get_current_user, hash_password

router = APIRouter()

def verify_admin_token(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# School models
class SchoolCreate(BaseModel):
    name: str
    email: EmailStr

class SchoolResponse(BaseModel):
    id: PydanticObjectId
    name: str
    email: str
    headteacher_id: PydanticObjectId
    created_at: datetime
    updated_at: datetime
    headteacher: Optional[User] = None

# Schools
@router.get("/schools", response_model=List[SchoolResponse])
def list_schools(current_user: User = Depends(verify_admin_token)):
    schools_collection = db.get_collection("schools")
    schools_data = list(schools_collection.find())
    
    schools = []
    for school_data in schools_data:
        school = School(**school_data)
        schools.append(school)
    return schools

@router.post("/schools", response_model=SchoolResponse)
def create_school(school_data: SchoolCreate = Body(...), current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    schools_collection = db.get_collection("schools")
    
    # Check if school email already exists
    existing_school = schools_collection.find_one({"email": school_data.email})
    if existing_school:
        raise HTTPException(status_code=400, detail="School email already exists")
    
    # Auto-generate headteacher credentials
    headteacher_name = f"Headteacher of {school_data.name}"
    headteacher_email = school_data.email
    headteacher_password = secrets.token_urlsafe(12)
    
    # Check if headteacher email already exists
    existing_user = users_collection.find_one({"email": headteacher_email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create headteacher account
    hashed_password = hash_password(headteacher_password)
    headteacher = User(
        name=headteacher_name,
        email=headteacher_email,
        password=hashed_password,
        role="headteacher",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    headteacher_result = users_collection.insert_one(headteacher.dict(by_alias=True))
    headteacher.id = headteacher_result.inserted_id
    
    # Create school
    school = School(
        name=school_data.name,
        email=school_data.email,
        headteacher_id=headteacher.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    result = schools_collection.insert_one(school.dict(by_alias=True))
    school.id = result.inserted_id
    
    # Update headteacher with school_id
    users_collection.update_one(
        {"_id": headteacher.id},
        {"$set": {"school_id": school.id}}
    )
    
    school_response = school.dict(by_alias=True)
    school_response["generated_password"] = headteacher_password
    school_response["headteacher"] = headteacher.dict(by_alias=True)
    school_response["headteacher"].pop("password", None)
    
    return school_response

@router.get("/schools/{school_id}", response_model=SchoolResponse)
def get_school(school_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    schools_collection = db.get_collection("schools")
    users_collection = db.get_collection("users")
    
    school_data = schools_collection.find_one({"_id": school_id})
    if not school_data:
        raise HTTPException(status_code=404, detail="School not found")
    
    school = School(**school_data)
    
    # Get headteacher info
    if school.headteacher_id:
        headteacher_data = users_collection.find_one({"_id": school.headteacher_id})
        if headteacher_data:
            headteacher = User(**headteacher_data)
            school.headteacher = headteacher
    
    return school

@router.put("/schools/{school_id}", response_model=SchoolResponse)
def update_school(school_id: PydanticObjectId, data: dict = Body(...), current_user: User = Depends(verify_admin_token)):
    schools_collection = db.get_collection("schools")
    
    school_data = schools_collection.find_one({"_id": school_id})
    if not school_data:
        raise HTTPException(status_code=404, detail="School not found")
    
    update_data = {k: v for k, v in data.items() if k in ["name", "email"]}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        schools_collection.update_one(
            {"_id": school_id},
            {"$set": update_data}
        )
    
    updated_school_data = schools_collection.find_one({"_id": school_id})
    return School(**updated_school_data)

@router.delete("/schools/{school_id}")
def delete_school(school_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    schools_collection = db.get_collection("schools")
    users_collection = db.get_collection("users")
    
    school_data = schools_collection.find_one({"_id": school_id})
    if not school_data:
        raise HTTPException(status_code=404, detail="School not found")
    
    school = School(**school_data)
    
    # Delete associated headteacher
    if school.headteacher_id:
        users_collection.delete_one({"_id": school.headteacher_id})
    
    # Delete school
    result = schools_collection.delete_one({"_id": school_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="School not found")
    
    return {"message": "School deleted successfully"}

# Users
@router.get("/users", response_model=List[User])
def list_users(current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    users_data = list(users_collection.find())
    
    users = []
    for user_data in users_data:
        user = User(**user_data)
        user.password = "" # Don't expose password hash
        users.append(user)
    return users

@router.put("/users/{user_id}/reset-password")
def reset_user_password(user_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    
    user_data = users_collection.find_one({"_id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate new password
    new_password = secrets.token_urlsafe(12)
    hashed_password = hash_password(new_password)
    
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"password": hashed_password, "password_reset_at": datetime.utcnow()}}
    )
    
    return {"message": "Password reset successful", "new_password": new_password}

@router.delete("/users/{user_id}")
def delete_user(user_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    
    result = users_collection.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

@router.get("/users/{user_id}/export")
def export_user_data(user_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    
    user_data = users_collection.find_one({"_id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove password hash before exporting
    user_data.pop("password", None)
    
    # In a real application, you might also fetch and include other user-related data
    # (e.g., teams they are part of, messages, files)
    
    return user_data

@router.delete("/users/{user_id}/data")
def delete_user_data(user_id: PydanticObjectId, current_user: User = Depends(verify_admin_token)):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")
    
    user_data = users_collection.find_one({"_id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user account
    users_collection.delete_one({"_id": user_id})
    
    # Remove user from any teams they are a member of
    teams_collection.update_many(
        {"members.user_id": user_id},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    
    # In a real application, you would also delete chat messages, files, join requests, etc.
    # For now, we'll just delete the user and remove them from teams.
    
    return {"message": "User data deleted successfully"}