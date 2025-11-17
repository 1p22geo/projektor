from fastapi import APIRouter, Body, HTTPException
from typing import List
from src.services import team_service
from src.models import Team, PydanticObjectId
from pydantic import BaseModel
from typing import Optional, Dict

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

