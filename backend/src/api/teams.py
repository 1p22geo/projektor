from fastapi import APIRouter, Body, HTTPException, UploadFile, File as FastAPIFile
from typing import List
from services import team_service
from models import Team, PydanticObjectId, ChatMessage, File
from pydantic import BaseModel
from typing import Optional, Dict
import os
import uuid
from datetime import datetime, timezone

router = APIRouter()


class TeamCreateRequest(BaseModel):
    name: str
    competition_id: PydanticObjectId


class TeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    competition_id: Optional[PydanticObjectId] = None
    members: Optional[List[Dict[str, PydanticObjectId | str]]] = (
        None  # List of {"user_id": ObjectId, "name": str}
    )
    url: Optional[str] = None


@router.post("/", response_model=Team)
def create_team(team_data: TeamCreateRequest = Body(...)):
    new_team = Team(
        name=team_data.name,
        competition_id=str(team_data.competition_id),
        # owner_id and initial members will be handled by student/headteacher API
    )
    return team_service.create_team(new_team)


@router.get("/", response_model=List[Team])
def get_teams():
    return team_service.get_teams()


@router.get("/{team_id}", response_model=Team)
def get_team(team_id: PydanticObjectId):
    team = team_service.get_team(team_id)
    if team:
        return team
    raise HTTPException(status_code=404, detail="Team not found")


@router.put("/{team_id}", response_model=Team)
def update_team(team_id: PydanticObjectId, team_data: TeamUpdateRequest = Body(...)):
    update_data = team_data.model_dump(exclude_unset=True)
    updated_team = team_service.update_team(team_id, update_data)
    if updated_team:
        return updated_team
    raise HTTPException(status_code=404, detail="Team not found")


@router.delete("/{team_id}")
def delete_team(team_id: PydanticObjectId):
    result = team_service.delete_team(team_id)
    if result["deleted_count"] == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"message": "Team deleted successfully"}


@router.post("/{team_id}/members", response_model=Team)
def add_member_to_team(
    team_id: PydanticObjectId,
    user_id: PydanticObjectId = Body(..., embed=True),
    user_name: str = Body(..., embed=True),
):
    updated_team = team_service.add_member_to_team(team_id, user_id, user_name)
    if updated_team:
        return updated_team
    raise HTTPException(status_code=404, detail="Team not found")


@router.delete("/{team_id}/members/{user_id}", response_model=Team)
def remove_member_from_team(team_id: PydanticObjectId, user_id: PydanticObjectId):
    updated_team = team_service.remove_member_from_team(team_id, user_id)
    if updated_team:
        return updated_team
    raise HTTPException(status_code=404, detail="Team not found")


class ChatMessageRequest(BaseModel):
    user_id: PydanticObjectId
    user_name: str
    message: str


@router.post("/{team_id}/chat", response_model=Team)
def add_chat_message(
    team_id: PydanticObjectId,
    message_data: ChatMessageRequest = Body(...)
):
    """Add a chat message to a team"""
    team = team_service.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    new_message = ChatMessage(
        user_id=message_data.user_id,
        user_name=message_data.user_name,
        message=message_data.message,
        created_at=datetime.now(timezone.utc)
    )
    
    updated_team = team_service.add_chat_message(team_id, new_message)
    if updated_team:
        return updated_team
    raise HTTPException(status_code=404, detail="Team not found")


@router.get("/{team_id}/chat", response_model=List[ChatMessage])
def get_chat_messages(team_id: PydanticObjectId):
    """Get all chat messages for a team"""
    team = team_service.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team.chat


@router.post("/{team_id}/files")
async def upload_file(
    team_id: PydanticObjectId,
    file: UploadFile = FastAPIFile(...),
    user_id: str = Body(...),
    user_name: str = Body(...)
):
    """Upload a file to a team"""
    team = team_service.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads", str(team_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Create file record
    file_url = f"/api/teams/{team_id}/files/{unique_filename}"
    new_file = File(
        user_id=PydanticObjectId(user_id),
        user_name=user_name,
        filename=file.filename,
        url=file_url,
        size=len(contents),
        created_at=datetime.now(timezone.utc)
    )
    
    updated_team = team_service.add_file(team_id, new_file)
    if updated_team:
        return {"message": "File uploaded successfully", "file": new_file}
    raise HTTPException(status_code=404, detail="Team not found")


@router.get("/{team_id}/files", response_model=List[File])
def get_files(team_id: PydanticObjectId):
    """Get all files for a team"""
    team = team_service.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team.files


@router.get("/{team_id}/files/{filename}")
async def download_file(team_id: PydanticObjectId, filename: str):
    """Download a file from a team"""
    from fastapi.responses import FileResponse
    
    file_path = os.path.join(os.getcwd(), "uploads", str(team_id), filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)


@router.delete("/{team_id}/files/{file_id}")
async def delete_file(team_id: PydanticObjectId, file_id: str):
    """Delete a file from a team"""
    team = team_service.get_team(team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Find the file to get its filename
    file_to_delete = None
    for file in team.files:
        if file.id == file_id:
            file_to_delete = file
            break
    
    if not file_to_delete:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Extract filename from URL
    filename = file_to_delete.url.split('/')[-1]
    file_path = os.path.join(os.getcwd(), "uploads", str(team_id), filename)
    
    # Delete physical file
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete file record from database
    updated_team = team_service.delete_file(team_id, file_id)
    if updated_team:
        return {"message": "File deleted successfully"}
    raise HTTPException(status_code=404, detail="Failed to delete file")
