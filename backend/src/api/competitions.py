from fastapi import APIRouter, Body, HTTPException
from typing import List, Optional
from src.services import competition_service
from src.models import Competition, PydanticObjectId
from datetime import datetime, timezone
from pydantic import BaseModel

router = APIRouter()


class CompetitionCreateRequest(BaseModel):
    name: str
    description: str
    school_id: PydanticObjectId
    is_global: bool
    max_teams: int
    max_members_per_team: int
    created_by: PydanticObjectId


class CompetitionUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    school_id: Optional[PydanticObjectId] = None
    is_global: Optional[bool] = None
    max_teams: Optional[int] = None
    max_members_per_team: Optional[int] = None


@router.post("/", response_model=Competition)
def create_competition(competition_data: CompetitionCreateRequest = Body(...)):
    new_competition = Competition(
        name=competition_data.name,
        description=competition_data.description,
        school_id=str(competition_data.school_id),
        is_global=competition_data.is_global,
        max_teams=competition_data.max_teams,
        max_members_per_team=competition_data.max_members_per_team,
        created_by=str(competition_data.created_by),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    return competition_service.create_competition(new_competition)


@router.get("/", response_model=List[Competition])
def get_competitions():
    return competition_service.get_competitions()


@router.get("/{competition_id}", response_model=Competition)
def get_competition(competition_id: PydanticObjectId):
    competition = competition_service.get_competition(competition_id)
    if competition:
        return competition
    raise HTTPException(status_code=404, detail="Competition not found")


@router.put("/{competition_id}", response_model=Competition)
def update_competition(
    competition_id: PydanticObjectId,
    competition_data: CompetitionUpdateRequest = Body(...),
):
    update_data = competition_data.model_dump(exclude_unset=True)
    updated_competition = competition_service.update_competition(
        competition_id, update_data
    )
    if updated_competition:
        return updated_competition
    raise HTTPException(status_code=404, detail="Competition not found")


@router.delete("/{competition_id}")
def delete_competition(competition_id: PydanticObjectId):
    result = competition_service.delete_competition(competition_id)
    if result["deleted_count"] == 0:
        raise HTTPException(status_code=404, detail="Competition not found")
    return {"message": "Competition deleted successfully"}

