from __future__ import annotations
from fastapi import (
    APIRouter,
    Body,
    HTTPException,
    Header,
    UploadFile,
    File as FastAPIFile,
    Depends,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import jwt
import os
import json
from datetime import datetime, timezone
from bson import ObjectId
from database import db
from api.auth import SECRET_KEY, ALGORITHM, get_current_user
from models import (
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
@router.get("/competitions")
def list_competitions(current_user: User = Depends(verify_student_token)):
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    # Flexible user lookup
    user_data = users_collection.find_one({"_id": str(current_user.id)})
    if not user_data:
        try:
            from bson import ObjectId

            user_data = users_collection.find_one(
                {"_id": ObjectId(str(current_user.id))}
            )
        except:
            pass

    if not user_data or not user_data.get("school_id"):
        raise HTTPException(status_code=400, detail="School not found for user")

    # Get school and global competitions (query with string school_id)
    competitions_data = list(
        competitions_collection.find(
            {
                "$or": [
                    {"school_id": user_data["school_id"]},
                    {"is_global": True},
                ]
            }
        )
    )

    competitions = []
    for comp_data in competitions_data:
        # Convert _id to id for frontend
        comp_id = str(comp_data["_id"])
        comp_data["id"] = comp_id
        comp_data.pop("_id")

        # Load teams for this competition
        teams_data = list(teams_collection.find({"competition_id": comp_id}))
        teams = []
        for team_data in teams_data:
            team_data["id"] = str(team_data.pop("_id"))
            team_data["chat"] = []  # Don't expose chat
            team_data["files"] = []  # Don't expose files
            teams.append(team_data)

        comp_data["teams"] = teams
        competitions.append(comp_data)

    return competitions


@router.get("/competitions/{competition_id}")
def get_competition(
    competition_id: str, current_user: User = Depends(verify_student_token)
):
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    # Flexible competition lookup
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        try:
            from bson import ObjectId

            competition_data = competitions_collection.find_one(
                {"_id": ObjectId(competition_id)}
            )
        except:
            pass

    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    # Get actual competition_id from DB
    actual_comp_id = str(competition_data["_id"])

    # Get teams for this competition
    teams_data = list(teams_collection.find({"competition_id": actual_comp_id}))
    teams = []
    for team_data in teams_data:
        team_data["id"] = str(team_data.pop("_id"))
        team_data["chat"] = []  # Don't expose chat to non-members
        team_data["files"] = []  # Don't expose files to non-members
        teams.append(team_data)

    # Convert competition _id to id
    competition_data["id"] = str(competition_data.pop("_id"))
    competition_data["teams"] = teams

    return competition_data


@router.get("/competitions/{competition_id}/my-team")
def get_my_team_for_competition(
    competition_id: str, current_user: User = Depends(verify_student_token)
):
    """Check if the current user is already in a team for this competition"""
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    # Flexible competition lookup
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        try:
            from bson import ObjectId

            competition_data = competitions_collection.find_one(
                {"_id": ObjectId(competition_id)}
            )
        except:
            pass

    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    # Get actual competition_id from DB
    actual_comp_id = str(competition_data["_id"])
    user_id_str = str(current_user.id)

    # Check if user is in any team for this competition
    existing_team = teams_collection.find_one(
        {"competition_id": actual_comp_id, "members.user_id": user_id_str}
    )

    if not existing_team:
        raise HTTPException(
            status_code=404, detail="Not in a team for this competition"
        )

    # Return the team
    existing_team["id"] = str(existing_team.pop("_id"))
    return existing_team


# Teams
class TeamCreateRequest(BaseModel):
    name: str


@router.post("/competitions/{competition_id}/teams")
def create_team(
    competition_id: str,  # Accept as string
    team_data: TeamCreateRequest,
    current_user: User = Depends(verify_student_token),
):
    log_file_path = "/home/bartoszg/.gemini/tmp/718ff143cbffa6b812a15f4e413e7d6cf9d697a71c04ee41464b160bab583b8a/student_debug.log"
    with open(log_file_path, "a") as f:
        f.write(f"[{datetime.now(timezone.utc)}] DEBUG: create_team called.\n")

    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")
    teams_collection = db.get_collection("teams")

    # Flexible user lookup
    user_data = users_collection.find_one({"_id": str(current_user.id)})
    if not user_data:
        try:
            from bson import ObjectId

            user_data = users_collection.find_one(
                {"_id": ObjectId(str(current_user.id))}
            )
        except:
            pass

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Check competition exists (try both string and ObjectId)
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        try:
            from bson import ObjectId

            competition_data = competitions_collection.find_one(
                {"_id": ObjectId(competition_id)}
            )
        except:
            pass

    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    competition = Competition(**competition_data)

    # Check max teams limit (use actual competition_id from DB)
    actual_comp_id = str(competition_data["_id"])
    team_count = teams_collection.count_documents({"competition_id": actual_comp_id})

    log_file_path = "/home/bartoszg/.gemini/tmp/718ff143cbffa6b812a15f4e413e7d6cf9d697a71c04ee41464b160bab583b8a/student_debug.log"
    with open(log_file_path, "a") as f:
        f.write(
            f"[{datetime.now(timezone.utc)}] DEBUG: team_count: {team_count}, competition.max_teams: {competition.max_teams}\n"
        )
        f.write(
            f"[{datetime.now(timezone.utc)}] DEBUG: current_user.id: {current_user.id}, type: {type(current_user.id)}\n"
        )
        f.write(
            f"[{datetime.now(timezone.utc)}] DEBUG: actual_comp_id: {actual_comp_id}, type: {type(actual_comp_id)}\n"
        )

    if team_count >= competition.max_teams:
        raise HTTPException(
            status_code=400,
            detail="Maximum number of teams reached for this competition",
        )

    # Check if user is already in a team for this competition (check both str formats)
    user_id_str = str(current_user.id)
    existing_team_member = teams_collection.find_one(
        {
            "competition_id": actual_comp_id,
            "members.user_id": {"$in": [user_id_str, current_user.id]},
        }
    )

    with open(log_file_path, "a") as f:
        f.write(
            f"[{datetime.now(timezone.utc)}] DEBUG: Checking for existing team member with user_id: {user_id_str}\n"
        )
        f.write(
            f"[{datetime.now(timezone.utc)}] DEBUG: existing_team_member: {existing_team_member}\n"
        )

    if existing_team_member:
        raise HTTPException(
            status_code=400,
            detail="Already in a team for this competition",
        )

    # Create team
    team_dict = {
        "name": team_data.name,
        "competition_id": actual_comp_id,  # Use actual comp ID from DB
        "members": [
            {
                "user_id": str(current_user.id),
                "name": user_data.get("name", current_user.name),
                "email": user_data.get("email", current_user.email),
            }
        ],
        "chat": [],
        "files": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = teams_collection.insert_one(team_dict)

    # Reload and return with id field
    created_team = teams_collection.find_one({"_id": result.inserted_id})
    created_team["id"] = str(created_team.pop("_id"))
    return created_team


@router.get("/teams/{team_id}")
def get_team(team_id: str, current_user: User = Depends(verify_student_token)):
    teams_collection = db.get_collection("teams")

    # Flexible ID lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if user is a member (check both string formats)
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )

    # Convert _id to id for response
    team_data["id"] = str(team_data.pop("_id"))

    # If not a member, hide chat and files
    if not is_member:
        team_data["chat"] = []
        team_data["files"] = []

    return team_data


@router.put("/teams/{team_id}")
def update_team(
    team_id: str, update_data: dict, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")

    # Find the team
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
            team_id = ObjectId(team_id)
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check if user is a member
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )

    if not is_member:
        raise HTTPException(
            status_code=403, detail="Only team members can update team details"
        )

    # Only allow updating certain fields
    allowed_fields = {"url"}
    filtered_updates = {k: v for k, v in update_data.items() if k in allowed_fields}

    if filtered_updates:
        teams_collection.update_one({"_id": team_id}, {"$set": filtered_updates})

    # Return updated team
    updated_team = teams_collection.find_one({"_id": team_id})
    updated_team["id"] = str(updated_team.pop("_id"))
    return updated_team


# Join requests
class JoinRequestCreate(BaseModel):
    team_id: PydanticObjectId


@router.post("/teams/{team_id}/join-requests")
def create_join_request(
    team_id: str, current_user: User = Depends(verify_student_token)
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")

    print(
        f"DEBUG: Creating join request for team_id={team_id}, user_id={current_user.id}"
    )

    # Flexible user lookup
    user_data = users_collection.find_one({"_id": str(current_user.id)})
    if not user_data:
        try:
            user_data = users_collection.find_one(
                {"_id": ObjectId(str(current_user.id))}
            )
        except:
            pass

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    actual_team_id = str(team_data["_id"])

    # Check if already a member (check both string formats)
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if is_member:
        raise HTTPException(status_code=400, detail="Already a member of this team")

    # Check if request already exists
    existing_request_data = join_requests_collection.find_one(
        {
            "team_id": actual_team_id,
            "user_id": str(current_user.id),
            "status": "pending",
        }
    )
    if existing_request_data:
        raise HTTPException(status_code=400, detail="Join request already exists")

    # Create join request
    join_request_dict = {
        "team_id": actual_team_id,
        "user_id": str(current_user.id),
        "user_name": user_data.get("email", current_user.email),
        "status": "pending",
        "approvals": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = join_requests_collection.insert_one(join_request_dict)
    join_request_dict["id"] = str(result.inserted_id)
    join_request_dict.pop("_id", None)  # Remove ObjectId if it exists

    print(f"DEBUG: Join request created: {join_request_dict}")
    return join_request_dict


@router.get("/teams/{team_id}/join-requests")
def list_join_requests(
    team_id: str, current_user: User = Depends(verify_student_token)
):
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")

    print(
        f"DEBUG: Loading join requests for team_id={team_id}, user_id={current_user.id}"
    )

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    actual_team_id = str(team_data["_id"])

    print(f"DEBUG: Actual team_id={actual_team_id}")

    # Verify user is a team member
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        print(f"DEBUG: User {current_user.id} is not a member")
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Get pending requests
    requests_data = list(
        join_requests_collection.find({"team_id": actual_team_id, "status": "pending"})
    )
    print(f"DEBUG: Found {len(requests_data)} pending join requests")
    requests = []
    for req_data in requests_data:
        req_data["id"] = str(req_data.pop("_id"))
        requests.append(req_data)
        print(f"DEBUG: Join request: {req_data}")

    return requests


class JoinRequestAction(BaseModel):
    action: str  # "approve" or "reject"


@router.put("/teams/{team_id}/join-requests/{request_id}")
def handle_join_request(
    team_id: str,
    request_id: str,
    action: JoinRequestAction,
    current_user: User = Depends(verify_student_token),
):
    teams_collection = db.get_collection("teams")
    join_requests_collection = db.get_collection("join_requests")
    users_collection = db.get_collection("users")
    competitions_collection = db.get_collection("competitions")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    actual_team_id = str(team_data["_id"])

    # Verify user is a team member
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Get competition to check max members
    competition_id = team_data.get("competition_id")
    competition_data = competitions_collection.find_one({"_id": competition_id})
    if not competition_data:
        try:
            competition_data = competitions_collection.find_one(
                {"_id": ObjectId(competition_id)}
            )
        except:
            pass

    if not competition_data:
        raise HTTPException(status_code=404, detail="Competition not found")

    max_members = competition_data.get("max_members_per_team", 4)

    # Flexible request lookup
    join_request_data = join_requests_collection.find_one({"_id": request_id})
    if not join_request_data:
        try:
            join_request_data = join_requests_collection.find_one(
                {"_id": ObjectId(request_id)}
            )
        except:
            pass

    if not join_request_data or join_request_data.get("status") != "pending":
        raise HTTPException(
            status_code=404, detail="Join request not found or already processed"
        )

    actual_request_id = str(join_request_data["_id"])

    if action.action == "approve":
        # Add approval
        approvals = join_request_data.get("approvals", [])
        user_id_str = str(current_user.id)
        if user_id_str not in approvals:
            approvals.append(user_id_str)

        # Check if majority approved
        member_count = len(team_data.get("members", []))
        required_approvals = (member_count // 2) + 1

        if len(approvals) >= required_approvals:
            # Check max members limit
            if len(team_data.get("members", [])) >= max_members:
                raise HTTPException(
                    status_code=400, detail="Team has reached maximum member limit"
                )

            # Add user to team
            user_id_to_add = join_request_data.get("user_id")
            user_to_add_data = users_collection.find_one({"_id": user_id_to_add})
            if not user_to_add_data:
                try:
                    user_to_add_data = users_collection.find_one(
                        {"_id": ObjectId(user_id_to_add)}
                    )
                except:
                    pass

            if user_to_add_data:
                new_member = {
                    "user_id": str(user_to_add_data["_id"]),
                    "name": user_to_add_data.get("name", ""),
                    "email": user_to_add_data.get("email", ""),
                }

            teams_collection.update_one(
                {"_id": team_data["_id"]},
                {
                    "$push": {"members": new_member},
                    "$set": {"updated_at": datetime.now(timezone.utc)},
                },
            )

            # Mark request as approved
            join_requests_collection.update_one(
                {"_id": join_request_data["_id"]},
                {
                    "$set": {
                        "status": "approved",
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )

            return {"message": "Request approved"}
        else:
            # Update approvals
            join_requests_collection.update_one(
                {"_id": join_request_data["_id"]},
                {
                    "$set": {
                        "approvals": approvals,
                        "updated_at": datetime.now(timezone.utc),
                    }
                },
            )

            return {
                "message": "Approval recorded",
                "approvals": len(approvals),
                "required": required_approvals,
            }

    elif action.action == "reject":
        # Mark request as rejected
        join_requests_collection.update_one(
            {"_id": join_request_data["_id"]},
            {"$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc)}},
        )

        return {"message": "Request rejected"}

    else:
        raise HTTPException(status_code=400, detail="Invalid action")


# Chat
class ChatMessageRequest(BaseModel):
    message: str


# Chat - REST API
@router.post("/teams/{team_id}/chat")
def send_chat_message(
    team_id: str,
    msg: ChatMessageRequest,
    current_user: User = Depends(verify_student_token),
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")

    # Flexible user lookup
    user_data = users_collection.find_one({"_id": str(current_user.id)})
    if not user_data:
        try:
            from bson import ObjectId

            user_data = users_collection.find_one(
                {"_id": ObjectId(str(current_user.id))}
            )
        except:
            pass

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check membership
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Create message
    chat_message = {
        "_id": str(ObjectId()),
        "user_id": str(current_user.id),
        "user_name": user_data.get("name", current_user.name),
        "message": msg.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Update team - use the original _id from team_data to maintain correct type
    teams_collection.update_one(
        {"_id": team_data["_id"]}, {"$push": {"chat": chat_message}}
    )

    return chat_message


@router.get("/teams/{team_id}/chat")
def get_chat_history(team_id: str, current_user: User = Depends(verify_student_token)):
    teams_collection = db.get_collection("teams")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check membership
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    return {"chat": team_data.get("chat", [])}


# Files
# Files
@router.get("/teams/{team_id}/files")
def list_team_files(team_id: str, current_user: User = Depends(verify_student_token)):
    teams_collection = db.get_collection("teams")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check membership
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Convert _id to id for files
    files = []
    for f in team_data.get("files", []):
        file_dict = dict(f)
        if "_id" in file_dict:
            file_dict["id"] = file_dict.pop("_id")
        files.append(file_dict)

    return files


@router.post("/teams/{team_id}/files")
async def upload_file(
    team_id: str,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(verify_student_token),
):
    users_collection = db.get_collection("users")
    teams_collection = db.get_collection("teams")

    # Flexible user lookup
    user_data = users_collection.find_one({"_id": str(current_user.id)})
    if not user_data:
        try:
            from bson import ObjectId

            user_data = users_collection.find_one(
                {"_id": ObjectId(str(current_user.id))}
            )
        except:
            pass

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check membership
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Check file size (100MB limit per team)
    files = team_data.get("files", [])
    total_size = sum(f.get("size", 0) for f in files)

    # Save file
    file_id = str(PydanticObjectId())
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")

    content = await file.read()
    file_size = len(content)

    if total_size + file_size > 100 * 1024 * 1024:  # 100MB
        raise HTTPException(
            status_code=400, detail="Team file storage limit exceeded (100MB)"
        )

    with open(file_path, "wb") as f:
        f.write(content)

    # Add file to team
    file_doc = {
        "_id": file_id,
        "user_id": str(current_user.id),
        "user_name": user_data.get("name", current_user.name),
        "filename": file.filename,
        "url": f"/student/files/{file_id}",
        "size": file_size,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    teams_collection.update_one(
        {"_id": team_data["_id"]}, {"$push": {"files": file_doc}}
    )

    return file_doc


# File Download
@router.get("/files/{file_id}")
async def download_file(file_id: str):
    """Download a file by ID"""
    upload_dir = "uploads"

    # Find the file in the uploads directory
    for filename in os.listdir(upload_dir):
        if filename.startswith(file_id):
            file_path = os.path.join(upload_dir, filename)
            # Extract original filename (after file_id_)
            original_name = filename.split("_", 1)[1] if "_" in filename else filename
            return FileResponse(
                path=file_path,
                filename=original_name,
                media_type="application/octet-stream",
            )

    raise HTTPException(status_code=404, detail="File not found")


@router.delete("/teams/{team_id}/files/{file_id}")
async def delete_file(
    team_id: str,
    file_id: str,
    current_user: User = Depends(verify_student_token),
):
    """Delete a file from a team"""
    teams_collection = db.get_collection("teams")

    # Flexible team lookup
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            from bson import ObjectId

            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        raise HTTPException(status_code=404, detail="Team not found")

    # Check membership
    is_member = any(
        m.get("user_id") in [str(current_user.id), current_user.id]
        for m in team_data.get("members", [])
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this team")

    # Find and delete the file
    files = team_data.get("files", [])
    file_to_delete = None
    for f in files:
        if f.get("_id") == file_id or f.get("id") == file_id:
            file_to_delete = f
            break

    if not file_to_delete:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete physical file
    upload_dir = "uploads"
    for filename in os.listdir(upload_dir):
        if filename.startswith(file_id):
            file_path = os.path.join(upload_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
            break

    # Remove from database
    teams_collection.update_one(
        {"_id": team_data["_id"]},
        {"$pull": {"files": {"_id": file_id}}}
    )

    return {"message": "File deleted successfully"}


# WebSocket for real-time chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, team_id: str):
        await websocket.accept()
        if team_id not in self.active_connections:
            self.active_connections[team_id] = []
        self.active_connections[team_id].append(websocket)

    def disconnect(self, websocket: WebSocket, team_id: str):
        if team_id in self.active_connections:
            self.active_connections[team_id].remove(websocket)
            if not self.active_connections[team_id]:
                del self.active_connections[team_id]

    async def broadcast(self, message: dict, team_id: str):
        if team_id in self.active_connections:
            disconnected = []
            for connection in self.active_connections[team_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.append(connection)

            # Clean up disconnected clients
            for conn in disconnected:
                self.disconnect(conn, team_id)


manager = ConnectionManager()


@router.websocket("/teams/{team_id}/ws")
async def websocket_endpoint(websocket: WebSocket, team_id: str):
    """WebSocket endpoint for real-time team chat"""
    # Get token from query params
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        return

    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=1008)
            return
    except:
        await websocket.close(code=1008)
        return

    # Verify user is team member
    teams_collection = db.get_collection("teams")
    team_data = teams_collection.find_one({"_id": team_id})
    if not team_data:
        try:
            team_data = teams_collection.find_one({"_id": ObjectId(team_id)})
        except:
            pass

    if not team_data:
        await websocket.close(code=1008)
        return

    is_member = any(
        m.get("user_id") in [str(user_id), user_id]
        for m in team_data.get("members", [])
    )

    if not is_member:
        await websocket.close(code=1008)
        return

    # Connect to team chat
    await manager.connect(websocket, team_id)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Get user info
            users_collection = db.get_collection("users")
            user_data = users_collection.find_one({"_id": str(user_id)})
            if not user_data:
                try:
                    user_data = users_collection.find_one(
                        {"_id": ObjectId(str(user_id))}
                    )
                except:
                    pass

            # Create message
            chat_message = {
                "user_id": str(user_id),
                "user_name": user_data.get("name", "Unknown")
                if user_data
                else "Unknown",
                "message": message_data.get("message", ""),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

            # Save to database
            teams_collection.update_one(
                {"_id": team_data["_id"]}, {"$push": {"chat": chat_message}}
            )

            # Broadcast to all connected clients in this team
            await manager.broadcast(chat_message, team_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, team_id)
