from database import db
from models import Competition, PydanticObjectId
from typing import List, Optional
from datetime import datetime, timezone

_competitions_collection = db.get_collection("competitions")

def _competition_helper(competition_data) -> Competition:
    return Competition(
        id=str(competition_data["_id"]),
        name=competition_data["name"],
        description=competition_data["description"],
        school_id=str(competition_data["school_id"]),
        is_global=competition_data["is_global"],
        max_teams=competition_data["max_teams"],
        max_members_per_team=competition_data["max_members_per_team"],
        created_by=str(competition_data["created_by"]),
        created_at=competition_data["created_at"],
        updated_at=competition_data["updated_at"],
    )

def create_competition(competition: Competition) -> Competition:
    competition_dict = competition.model_dump(by_alias=True)
    competition_dict["created_at"] = datetime.now(timezone.utc)
    competition_dict["updated_at"] = datetime.now(timezone.utc)
    result = _competitions_collection.insert_one(competition_dict)
    competition.id = result.inserted_id
    return competition

def get_competition(competition_id: PydanticObjectId) -> Optional[Competition]:
    competition_data = _competitions_collection.find_one({"_id": competition_id})
    if competition_data:
        return _competition_helper(competition_data)
    return None

def get_competitions() -> List[Competition]:
    competitions = []
    for competition_data in _competitions_collection.find():
        competitions.append(_competition_helper(competition_data))
    return competitions

def update_competition(competition_id: PydanticObjectId, competition_data: dict) -> Optional[Competition]:
    # Check if competition exists first
    if not _competitions_collection.find_one({"_id": competition_id}):
        return None
    competition_data["updated_at"] = datetime.now(timezone.utc)
    _competitions_collection.update_one({"_id": competition_id}, {"$set": competition_data})
    return get_competition(competition_id)

def delete_competition(competition_id: PydanticObjectId):
    result = _competitions_collection.delete_one({"_id": competition_id})
    return {"message": "Competition deleted successfully", "deleted_count": result.deleted_count}