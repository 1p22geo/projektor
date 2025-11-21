from typing import List, Optional
from database import db
from models import JoinRequest, PydanticObjectId


def _join_request_helper(join_request_data) -> JoinRequest:
    """Helper to convert MongoDB document to JoinRequest model"""
    return JoinRequest(**join_request_data)


def create_join_request(join_request: JoinRequest) -> JoinRequest:
    """Create a new join request"""
    join_request_dict = join_request.model_dump(by_alias=True, exclude={"id"})
    result = db.join_requests.insert_one(join_request_dict)
    join_request_dict["_id"] = result.inserted_id
    return _join_request_helper(join_request_dict)


def get_join_request(request_id: PydanticObjectId) -> Optional[JoinRequest]:
    """Get a single join request by ID"""
    join_request = db.join_requests.find_one({"_id": request_id})
    if join_request:
        return _join_request_helper(join_request)
    return None


def get_join_requests_for_team(team_id: PydanticObjectId) -> List[JoinRequest]:
    """Get all join requests for a team"""
    join_requests = db.join_requests.find({"team_id": team_id})
    return [_join_request_helper(jr) for jr in join_requests]


def get_join_requests_for_user(user_id: PydanticObjectId) -> List[JoinRequest]:
    """Get all join requests made by a user"""
    join_requests = db.join_requests.find({"user_id": user_id})
    return [_join_request_helper(jr) for jr in join_requests]


def update_join_request(
    request_id: PydanticObjectId, update_data: dict
) -> Optional[JoinRequest]:
    """Update a join request"""
    result = db.join_requests.find_one_and_update(
        {"_id": request_id}, {"$set": update_data}, return_document=True
    )
    if result:
        return _join_request_helper(result)
    return None


def delete_join_request(request_id: PydanticObjectId):
    """Delete a join request"""
    result = db.join_requests.delete_one({"_id": request_id})
    return {"deleted_count": result.deleted_count}


def add_approval(request_id: PydanticObjectId, user_id: PydanticObjectId) -> Optional[JoinRequest]:
    """Add an approval to a join request"""
    result = db.join_requests.find_one_and_update(
        {"_id": request_id},
        {"$addToSet": {"approvals": user_id}},
        return_document=True
    )
    if result:
        return _join_request_helper(result)
    return None
