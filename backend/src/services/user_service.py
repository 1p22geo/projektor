from database import db
from models import User, UserOut, PydanticObjectId
from typing import List, Optional
from datetime import datetime, timezone

_users_collection = db.get_collection("users")


def _user_helper(user_data) -> UserOut:
    return UserOut(
        _id=PydanticObjectId(user_data["_id"]),
        name=user_data["name"],
        email=user_data["email"],
        role=user_data["role"],
        school_id=PydanticObjectId(user_data["school_id"])
        if user_data.get("school_id")
        else None,
        created_at=user_data["created_at"],
        updated_at=user_data["updated_at"],
    )


def create_user(user: User) -> User:
    user_dict = user.model_dump(by_alias=True)
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["updated_at"] = datetime.now(timezone.utc)
    result = _users_collection.insert_one(user_dict)
    user.id = result.inserted_id
    return user


def get_user(user_id: PydanticObjectId) -> Optional[UserOut]:
    user_data = _users_collection.find_one({"_id": user_id})
    if user_data:
        return _user_helper(user_data)
    return None


def get_users() -> List[UserOut]:
    users = []
    for user_data in _users_collection.find():
        users.append(_user_helper(user_data))
    return users


def update_user(user_id: PydanticObjectId, user_data: dict) -> Optional[UserOut]:
    # Check if user exists first
    if not _users_collection.find_one({"_id": user_id}):
        return None
    user_data["updated_at"] = datetime.now(timezone.utc)
    _users_collection.update_one({"_id": user_id}, {"$set": user_data})
    return get_user(user_id)


def delete_user(user_id: PydanticObjectId):
    result = _users_collection.delete_one({"_id": user_id})
    return {
        "message": "User deleted successfully",
        "deleted_count": result.deleted_count,
    }

