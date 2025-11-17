from fastapi import APIRouter, Body, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
import os
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
import jwt
from src.database import db
from src.models import User, PydanticObjectId, RegistrationToken, School

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Generate admin password on startup
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    ADMIN_PASSWORD = secrets.token_urlsafe(16)
    print(f"\n{'='*60}")
    print(f"ADMIN PASSWORD (save this!): {ADMIN_PASSWORD}")
    print(f"{ '='*60}\n")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AdminLoginRequest(BaseModel):
    password: str

class RegisterStudentRequest(BaseModel):
    token: str
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest = Body(...)):
    users_collection = db.get_collection("users")
    user_data = users_collection.find_one({"email": credentials.email})
    
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_data)
    
    hashed_password = hash_password(credentials.password)
    if user.password != hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    })
    
    user_dict = user.dict(by_alias=True)
    user_dict["id"] = str(user.id)
    user_dict.pop("password", None)
    
    return {"access_token": access_token, "user": user_dict}

@router.post("/login/admin", response_model=TokenResponse)
def login_admin(credentials: AdminLoginRequest = Body(...)):
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    access_token = create_access_token({
        "sub": "admin",
        "role": "admin"
    })
    
    return {
        "access_token": access_token,
        "user": {
            "id": "admin",
            "role": "admin",
            "email": "admin@projektor.local"
        }
    }

@router.post("/register/student")
def register_student(data: RegisterStudentRequest = Body(...)):
    users_collection = db.get_collection("users")
    registration_tokens_collection = db.get_collection("registration_tokens")
    
    # Verify registration token
    token_doc_data = registration_tokens_collection.find_one({"token": data.token, "used": False})
    if not token_doc_data:
        raise HTTPException(status_code=400, detail="Invalid or already used token")
    
    token_doc = RegistrationToken(**token_doc_data)
    
    # Check if email already exists
    existing_user_data = users_collection.find_one({"email": data.email})
    if existing_user_data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(data.password)
    user = User(
        name=data.name,
        email=data.email,
        password=hashed_password,
        role="student",
        school_id=token_doc.school_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    result = users_collection.insert_one(user.dict(by_alias=True))
    user.id = result.inserted_id
    
    # Mark token as used
    registration_tokens_collection.update_one(
        {"_id": token_doc.id},
        {"$set": {"used": True, "used_by": user.id, "used_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Registration successful"}

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user_role = payload.get("role")
        
        if user_id is None or user_role is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        if user_role == "admin":
            return User(id=None, name="Admin", email=None, password=None, role="admin")
        
        users_collection = db.get_collection("users")
        user_data = users_collection.find_one({"_id": PydanticObjectId(user_id)})
        if user_data is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_data)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")