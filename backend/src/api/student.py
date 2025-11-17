from __future__ import annotations
from fastapi import (
    APIRouter,
    Body,
    HTTPException,
    Header,
    UploadFile,
    File as FastAPIFile,
    Depends,
)
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import jwt
import os
from datetime import datetime
from bson import ObjectId
from src.database import db
from src.api.auth import SECRET_KEY, ALGORITHM, get_current_user
from src.models import (
    User,
    Competition,
    Team,
    PydanticObjectId,
    ChatMessage,
    File,
    JoinRequest,
)

router = APIRouter()


def verify_student_token(current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    return current_user


# Competitions
@router.get("/competitions", response_model=List[Competition])
def list_competitions(current_user: User = Depends(verify_student_token)):
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")

    user_data = users_collection.find_one({"_id": current_user.id})
    if not user_data or not user_data.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found for user")

    # Get school and global competitions
    competitions_data = list(
        competitions_collection.find(
            {
                "$or": [
                    {"school_id": PydanticObjectId(user_data["school_id"])},
                    {"is_global": True},
                ]
            }
        )
    )

    competitions = []
    for comp_data in competitions_data:
        competitions.append(Competition(**comp_data))

    return competitions


@router.get("/competitions/{competition_id}", response_model=Competition)
def get_competition(
    competition_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    competition = Competition(**competition_data)

    # Get teams for this competition
    teams_data = list(teams_collection.find({"competition_id": competition_id}))
    teams = []
    for team_data in teams_data:
        team = Team(**team_data)
        team.chat = []  # Don't expose chat to non-members
        team.files = []  # Don't expose files to non-members
        teams.append(team)

    competition_dict = competition.dict()
    competition_dict["teams"] = teams

    return competition_dict


# Teams
class TeamCreateRequest(BaseModel):
    name: str


@router.post("/competitions/{competition_id}/teams", response_model=Team)
def create_team(
    competition_id: PydanticObjectId,
    team_data: TeamCreateRequest,
    current_user: User = Depends(verify_student_token),
):
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    user_data = users_collection.find_one({"_id": current_user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Check competition exists
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    competition = Competition(**competition_data)

    # Check max teams limit
    team_count = teams_collection.count_documents({"competition_id": competition_id})
    if team_count >= competition.max_teams:
        raise HTTPException(
            status_code=400,
            detail="Maximum number of teams reached for this competition",
        )

    # Check if user is already in a team for this competition
    existing_team_member = teams_collection.find_one(
        {"competition_id": competition_id, "members.user_id": current_user.id}
    )
    if existing_team_member:
        raise HTTPException(
            status_code=400,
            detail="You are already a member of a team in this competition",
        )

    # Create team
    team = Team(
        name=team_data.name,
        competition_id=competition_id,
        members=[{"user_id": current_user.id, "name": current_user.name}],
        chat=[],
        files=[],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    result = teams_collection.insert_one(team.dict(by_alias=True))
    team.id = result.inserted_id

    return team


@router.get("/teams/{team_id}", response_model=Team)
def get_team(
    team_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")

    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)

    # Check if user is a member
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    return team


# Join requests
class JoinRequestCreate(BaseModel):
    team_id: PydanticObjectId


@router.post("/teams/{team_id}/join-requests", response_model=JoinRequest)
def create_join_request(
    team_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")

    user_data = users_collection.find_one({"_id": current_user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Check team exists
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)

    # Check if already a member
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if is_member:
        raise HTTPException(status_code=400, detail="Already a member of this team")

    # Check if request already exists
    existing_request_data = join_requests_collection.find_one(
        {"team_id": team_id, "user_id": current_user.id, "status": "pending"}
    )
    if existing_request_data:
        raise HTTPException(status_code=400, detail="Join request already exists")

    # Create join request
    join_request = JoinRequest(
        team_id=team_id,
        user_id=current_user.id,
        user_name=current_user.name,
        status="pending",
        approvals=[],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    result = join_requests_collection.insert_one(join_request.dict(by_alias=True))
    join_request.id = result.inserted_id

    return join_request


@router.get("/teams/{team_id}/join-requests", response_model=List[JoinRequest])
def list_join_requests(
    team_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Get pending requests
    requests_data = list(
        join_requests_collection.find({"team_id": team_id, "status": "pending"})
    )
    requests = []
    for req_data in requests_data:
        requests.append(JoinRequest(**req_data))

    return requests


class JoinRequestAction(BaseModel):
    action: str  # "approve" or "reject"


@router.put(
    "/teams/{team_id}/join-requests/{request_id}", response_model=Dict[str, Any]
)
def handle_join_request(
    team_id: PydanticObjectId,
    request_id: PydanticObjectId,
    action: JoinRequestAction,
    current_user: User = Depends(verify_student_token),
):
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")
    users_collection = db.get_collection("users")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Get join request
    join_request_data = join_requests_collection.find_one({"_id": request_id})
    if not join_request_data or join_request_data.get("status") != "pending":
        raise HTTPException(
            status_code=404, detail="Join request not found or already processed"
        )

    join_request = JoinRequest(**join_request_data)

    if action.action == "approve":
        # Add approval
        approvals = join_request.approvals
        if current_user.id not in approvals:
            approvals.append(current_user.id)

        # Check if majority approved
        member_count = len(team.members)
        required_approvals = (member_count // 2) + 1

        if len(approvals) >= required_approvals:
            # Add user to team
            user_to_add_data = users_collection.find_one({"_id": join_request.user_id})
            if user_to_add_data:
                user_to_add = User(**user_to_add_data)
                team.members.append(
                    {"user_id": user_to_add.id, "name": user_to_add.name}
                )

                teams_collection.update_one(
                    {"_id": team_id},
                    {
                        "$set": {
                            "members": [m.dict() for m in team.members],
                            "updated_at": datetime.now(timezone.utc),
                        }
                    },
                )

            # Mark request as approved
            join_requests_collection.update_one(
                {"_id": request_id},
                {"$set": {"status": "approved", "updated_at": datetime.now(timezone.utc)}},
            )

            return {"message": "Join request approved and user added to team"}
        else:
            # Update approvals
            join_requests_collection.update_one(
                {"_id": request_id},
                {"$set": {"approvals": approvals, "updated_at": datetime.now(timezone.utc)}},
            )

            return {
                "message": "Approval recorded",
                "approvals": len(approvals),
                "required": required_approvals,
            }

    elif action.action == "reject":
        # Mark request as rejected
        join_requests_collection.update_one(
            {"_id": request_id},
            {"$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc)}},
        )

        return {"message": "Join request rejected"}

    else:
        raise HTTPException(status_code=400, detail="Invalid action")


# Chat
class ChatMessageRequest(BaseModel):
    message: str


@router.post("/teams/{team_id}/chat", response_model=ChatMessage)
def send_chat_message(
    team_id: PydanticObjectId,
    msg: ChatMessageRequest,
    current_user: User = Depends(verify_student_token),
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")

    user_data = users_collection.find_one({"_id": current_user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Add message to chat
    chat_message = ChatMessage(
        user_id=current_user.id,
        user_name=current_user.name,
        message=msg.message,
        created_at=datetime.now(timezone.utc),
    )

    teams_collection.update_one(
        {"_id": team_id}, {"$push": {"chat": chat_message.dict(by_alias=True)}}
    )

    return chat_message


@router.get("/teams/{team_id}/chat", response_model=List[ChatMessage])
def get_chat_history(
    team_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    return team.chat


# Files
@router.get("/teams/{team_id}/files", response_model=List[File])
def list_team_files(
    team_id: PydanticObjectId, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    return team.files


@router.post("/teams/{team_id}/files", response_model=File)
async def upload_file(
    team_id: PydanticObjectId,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(verify_student_token),
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")

    user_data = users_collection.find_one({"_id": current_user.id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify user is a team member
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    team = Team(**team_data)
    is_member = any(m.get("user_id") == current_user.id for m in team.members)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Check file size (100MB limit per team)
    files = team.files
    total_size = sum(f.size for f in files)

    # Save file
    file_id = PydanticObjectId()
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as f:
        content = await file.read()
        file_size = len(content)
        f.write(content)

    if total_size + file_size > 100 * 1024 * 1024:  # 100MB
        os.remove(file_path)
        raise HTTPException(
            status_code=400, detail="Team file storage limit exceeded (100MB)"
        )

    # Add file to team
    file_doc = File(
        id=file_id,
        user_id=current_user.id,
        user_name=current_user.name,
        filename=file.filename,
        url=f"/api/files/{file_id}",
        size=file_size,
        created_at=datetime.now(timezone.utc),
    )

    teams_collection.update_one(
        {"_id": team_id}, {"$push": {"files": file_doc.dict(by_alias=True)}}
    )

    return file_doc

