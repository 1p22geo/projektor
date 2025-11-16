from fastapi import APIRouter, Body, HTTPException, Header, UploadFile, File as FastAPIFile, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import jwt
import secrets
import hashlib
from datetime import datetime
from bson import ObjectId
from database import db
from api.auth import SECRET_KEY, ALGORITHM, get_current_user
from models import User, School, Competition, Team, PydanticObjectId, RegistrationToken, ChatMessage, File

router = APIRouter()

def verify_headteacher_token(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["headteacher", "admin"]:
        raise HTTPException(status_code=403, detail="Headteacher access required")
    return current_user

# Token generation
class TokenGenerateRequest(BaseModel):
    count: int

@router.post("/tokens")
def generate_tokens(request: TokenGenerateRequest, current_user: User = Depends(verify_headteacher_token)):
    users_collection = db.get_collection("users")
    registration_tokens_collection = db.get_collection("registration_tokens")
    
    user = users_collection.find_one({"_id": current_user.id})
    if not user or not user.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found for user")
    
    tokens = []
    for _ in range(request.count):
        token_str = secrets.token_urlsafe(16)
        token_doc = RegistrationToken(
            token=token_str,
            school_id=PydanticObjectId(user["school_id"]),
            used=False,
            created_at=datetime.utcnow()
        )
        result = registration_tokens_collection.insert_one(token_doc.dict(by_alias=True))
        tokens.append(token_str)
    
    return {"tokens": tokens}

# Competition models
class CompetitionCreateRequest(BaseModel):
    name: str
    description: str = ""
    max_teams: int
    max_members_per_team: int
    is_global: bool = False

class CompetitionUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_teams: Optional[int] = None
    max_members_per_team: Optional[int] = None
    is_global: Optional[bool] = None

@router.get("/competitions", response_model=List[Competition])
def list_competitions(current_user: User = Depends(verify_headteacher_token)):
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")
    
    user = users_collection.find_one({"_id": current_user.id})
    if not user or not user.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found")
    
    competitions_data = list(competitions_collection.find({"school_id": PydanticObjectId(user["school_id"])}))
    
    competitions = []
    for comp_data in competitions_data:
        competitions.append(Competition(**comp_data))
    
    return competitions

@router.post("/competitions", response_model=Competition)
def create_competition(competition: CompetitionCreateRequest, current_user: User = Depends(verify_headteacher_token)):
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")
    
    user = users_collection.find_one({"_id": current_user.id})
    if not user or not user.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found")
    
    comp_doc = Competition(
        name=competition.name,
        description=competition.description,
        max_teams=competition.max_teams,
        max_members_per_team=competition.max_members_per_team,
        is_global=competition.is_global,
        school_id=PydanticObjectId(user["school_id"]),
        created_by=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    result = competitions_collection.insert_one(comp_doc.dict(by_alias=True))
    comp_doc.id = result.inserted_id
    
    return comp_doc

@router.get("/competitions/{competition_id}", response_model=Competition)
def get_competition(competition_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return Competition(**competition_data)

@router.put("/competitions/{competition_id}", response_model=Competition)
def update_competition(competition_id: PydanticObjectId, data: CompetitionUpdateRequest, current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    
    update_data = data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = competitions_collection.update_one(
        {"_id": competition_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    updated_competition_data = competitions_collection.find_one({"_id": competition_id})
    return Competition(**updated_competition_data)

@router.delete("/competitions/{competition_id}")
def delete_competition(competition_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    
    result = competitions_collection.delete_one({"_id": competition_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    return {"message": "Competition deleted successfully"}

# Moderation endpoints
@router.get("/schools/{school_id}/teams", response_model=List[Team])
def list_school_teams(school_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")
    
    # Get all competitions for the school
    competitions_data = list(competitions_collection.find({"school_id": school_id}))
    competition_ids = [comp["_id"] for comp in competitions_data]
    
    # Get all teams for those competitions
    teams_data = list(teams_collection.find({"competition_id": {"$in": competition_ids}}))
    
    teams = []
    for team_data in teams_data:
        team = Team(**team_data)
        team.chat = [] # Don't expose chat directly here
        team.files = [] # Don't expose files directly here
        teams.append(team)
    
    return teams

@router.get("/teams/{team_id}/chat", response_model=List[ChatMessage])
def get_team_chat_for_moderation(team_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = Team(**team_data)
    return team.chat

@router.get("/teams/{team_id}/files", response_model=List[File])
def get_team_files_for_moderation(team_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = Team(**team_data)
    return team.files

@router.delete("/teams/{team_id}/members/{member_id}")
def remove_team_member(team_id: PydanticObjectId, member_id: PydanticObjectId, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team = Team(**team_data)
    
    # Remove member
    initial_member_count = len(team.members)
    team.members = [m for m in team.members if m.get("user_id") != member_id]
    
    if len(team.members) == initial_member_count:
        raise HTTPException(status_code=404, detail="Member not found in team")
    
    teams_collection.update_one(
        {"_id": team_id},
        {"$set": {"members": [m.dict() for m in team.members], "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Member removed successfully"}