from src.database import db
from src.models import Team, PydanticObjectId
from typing import List, Optional
from datetime import datetime, timezone

_teams_collection = db.get_collection("teams")

def _team_helper(team_data) -> Team:
    members = []
    for member in team_data.get("members", []):
        members.append({"user_id": str(member["user_id"]), "name": member["name"]})
    return Team.model_construct(
        _fields_set={"id", "name", "competition_id", "members", "chat", "files", "created_at", "updated_at"},
        id=str(team_data["_id"]),
        name=team_data["name"],
        competition_id=str(team_data["competition_id"]),
        members=members,
        chat=team_data.get("chat", []),
        files=team_data.get("files", []),
        created_at=team_data["created_at"],
        updated_at=team_data["updated_at"],
    )

def create_team(team: Team) -> Team:
    team_dict = team.model_dump(by_alias=True)
    team_dict["created_at"] = datetime.now(timezone.utc)
    team_dict["updated_at"] = datetime.now(timezone.utc)
    result = _teams_collection.insert_one(team_dict)
    team.id = result.inserted_id
    return team

def get_team(team_id: PydanticObjectId) -> Optional[Team]:
    team_data = _teams_collection.find_one({"_id": team_id})
    if team_data:
        return _team_helper(team_data)
    return None

def get_teams() -> List[Team]:
    teams = []
    for team_data in _teams_collection.find():
        teams.append(_team_helper(team_data))
    return teams

def update_team(team_id: PydanticObjectId, team_data: dict) -> Optional[Team]:
    # Check if team exists first
    if not _teams_collection.find_one({"_id": team_id}):
        return None
    team_data["updated_at"] = datetime.now(timezone.utc)
    _teams_collection.update_one({"_id": team_id}, {"$set": team_data})
    return get_team(team_id)

def delete_team(team_id: PydanticObjectId):
    result = _teams_collection.delete_one({"_id": team_id})
    return {"message": "Team deleted successfully", "deleted_count": result.deleted_count}

def add_member_to_team(team_id: PydanticObjectId, user_id: PydanticObjectId, user_name: str) -> Optional[Team]:
    # Check if team exists first
    if not _teams_collection.find_one({"_id": team_id}):
        return None
    member_data = {"user_id": user_id, "name": user_name}
    _teams_collection.update_one({"_id": team_id}, {"$push": {"members": member_data}})
    return get_team(team_id)

def remove_member_from_team(team_id: PydanticObjectId, user_id: PydanticObjectId) -> Optional[Team]:
    # Check if team exists first
    if not _teams_collection.find_one({"_id": team_id}):
        return None
    _teams_collection.update_one({"_id": team_id}, {"$pull": {"members": {"user_id": user_id}}})
    return get_team(team_id)