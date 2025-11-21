from fastapi import APIRouter, Body, HTTPException, Header, UploadFile, File as FastAPIFile, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import jwt
import secrets
import hashlib
from datetime import datetime, timezone
from bson import ObjectId
from database import db
from api.auth import SECRET_KEY, ALGORITHM, get_current_user
from models import User, School, Competition, Team, PydanticObjectId, RegistrationToken, ChatMessage, File

router = APIRouter()

def verify_headteacher_token(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["headteacher", "admin"]:
        raise HTTPException(status_code=403, detail="Headteacher access required")
    return current_user

def get_user_with_school(current_user: User):
    """Helper to get user data with school_id, handling both string and ObjectId IDs"""
    users_collection = db.get_collection("users")
    
    # Try to find user by string ID first, then by ObjectId
    user = users_collection.find_one({"_id": str(current_user.id)})
    if not user:
        try:
            from bson import ObjectId
            user = users_collection.find_one({"_id": ObjectId(str(current_user.id))})
        except:
            pass
    
    if not user or not user.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found for user")
    
    return user

# Token generation
class TokenGenerateRequest(BaseModel):
    count: int

@router.post("/tokens")
def generate_tokens(request: TokenGenerateRequest, current_user: User = Depends(verify_headteacher_token)):
    registration_tokens_collection = db.get_collection("registration_tokens")
    
    user = get_user_with_school(current_user)
    
    tokens = []
    for _ in range(request.count):
        token_str = secrets.token_urlsafe(16)
        # Store school_id as string to match how it's stored in users collection
        token_dict = {
            "token": token_str,
            "school_id": user["school_id"],  # Keep as string
            "used": False,
            "created_at": datetime.now(timezone.utc)
        }
        result = registration_tokens_collection.insert_one(token_dict)
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

@router.get("/competitions")
def list_competitions(current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    
    user = get_user_with_school(current_user)
    
    # Query with string school_id (matches what's in DB)
    competitions_data = list(competitions_collection.find({"school_id": user["school_id"]}))
    
    competitions = []
    for comp_data in competitions_data:
        # Convert _id to id for frontend compatibility
        comp_data["id"] = str(comp_data.pop("_id"))
        competitions.append(comp_data)
    
    return competitions

@router.post("/competitions")
def create_competition(competition: CompetitionCreateRequest, current_user: User = Depends(verify_headteacher_token)):
    competitions_collection = db.get_collection("competitions")
    
    user = get_user_with_school(current_user)
    
    comp_doc = Competition(
        name=competition.name,
        description=competition.description,
        max_teams=competition.max_teams,
        max_members_per_team=competition.max_members_per_team,
        is_global=competition.is_global,
        school_id=PydanticObjectId(user["school_id"]),
        created_by=current_user.id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    # Remove auto-generated _id to let MongoDB generate proper ObjectId
    comp_dict = comp_doc.dict(by_alias=True, exclude_unset=True)
    if '_id' in comp_dict:
        del comp_dict['_id']
    
    result = competitions_collection.insert_one(comp_dict)
    
    # Reload from database and return with id field
    created_comp = competitions_collection.find_one({"_id": result.inserted_id})
    created_comp["id"] = str(created_comp.pop("_id"))
    return created_comp

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
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = competitions_collection.update_one(
        {"_id": competition_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    
    updated_competition_data = competitions_collection.find_one({"_id": competition_id})
    updated_competition_data["id"] = str(updated_competition_data.pop("_id"))
    return updated_competition_data

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

@router.delete("/teams/{team_id}/chat/{message_id}")
def delete_chat_message(team_id: PydanticObjectId, message_id: str, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    # Remove the message from the team's chat array
    result = teams_collection.update_one(
        {"_id": team_id},
        {"$pull": {"chat": {"_id": message_id}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}

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
        {"$set": {"members": [m.dict() for m in team.members], "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Member removed successfully"}

@router.get("/teams", response_model=List[Team])
def list_all_teams_for_headteacher(current_user: User = Depends(verify_headteacher_token)):
    user = get_user_with_school(current_user)
    school_id = user.get("school_id")
    
    if not school_id:
        # Return empty list if no school_id (shouldn't happen but be defensive)
        return []
    
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")
    
    # Get all competitions for the school - try both string and ObjectId formats
    competitions_data = list(competitions_collection.find({"school_id": school_id}))
    
    if not competitions_data:
        # Try converting school_id to ObjectId if it's a string
        try:
            from bson import ObjectId
            competitions_data = list(competitions_collection.find({"school_id": ObjectId(school_id)}))
        except:
            pass
    
    if not competitions_data:
        return []
    
    competition_ids = [comp["_id"] for comp in competitions_data]
    
    # Get all teams for those competitions - need to convert ObjectIds to strings for comparison
    competition_ids_str = [str(cid) for cid in competition_ids]
    teams_data = list(teams_collection.find({"competition_id": {"$in": competition_ids_str}}))
    
    teams = []
    for team_data in teams_data:
        # Transform chat messages - flatten user object
        if "chat" in team_data:
            for msg in team_data["chat"]:
                if "user" in msg and isinstance(msg["user"], dict):
                    msg["user_id"] = msg["user"].get("user_id")
                    msg["user_name"] = msg["user"].get("name")
                    del msg["user"]
        
        # Transform files - flatten user object  
        if "files" in team_data:
            for file in team_data["files"]:
                if "user" in file and isinstance(file["user"], dict):
                    file["user_id"] = file["user"].get("user_id")
                    file["user_name"] = file["user"].get("name")
                    del file["user"]
        
        team_data["id"] = str(team_data.pop("_id"))
        if "competition_id" in team_data:
            team_data["competition_id"] = str(team_data["competition_id"])
        teams.append(team_data)
    
    return teams

@router.get("/teams/{team_id}", response_model=dict)
def get_team_for_moderation(team_id: str, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    try:
        team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
    except:
        team_data = teams_collection.find_one({"_id": team_id})
    
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team_data["id"] = str(team_data.pop("_id"))
    if "competition_id" in team_data:
        team_data["competition_id"] = str(team_data["competition_id"])
    
    return team_data

@router.delete("/teams/{team_id}/messages/{message_id}")
def delete_team_message(team_id: str, message_id: str, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    try:
        team_oid = ObjectId(team_id)
    except:
        team_oid = team_id
        
    try:
        message_oid = ObjectId(message_id)
    except:
        message_oid = message_id
    
    team_data = teams_collection.find_one({"_id": team_oid})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Remove the message from chat array
    result = teams_collection.update_one(
        {"_id": team_oid},
        {"$pull": {"chat": {"_id": message_oid}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return {"message": "Message deleted successfully"}

@router.delete("/teams/{team_id}/files/{file_id}")
def delete_team_file(team_id: str, file_id: str, current_user: User = Depends(verify_headteacher_token)):
    teams_collection = db.get_collection("teams")
    
    try:
        team_oid = ObjectId(team_id)
    except:
        team_oid = team_id
        
    try:
        file_oid = ObjectId(file_id)
    except:
        file_oid = file_id
    
    team_data = teams_collection.find_one({"_id": team_oid})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Remove the file from files array
    result = teams_collection.update_one(
        {"_id": team_oid},
        {"$pull": {"files": {"_id": file_oid}}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {"message": "File deleted successfully"}

