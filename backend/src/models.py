from __future__ import annotations
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime, timezone
from bson import ObjectId
from pydantic_core import core_schema


# Custom Pydantic type for ObjectId
class PydanticObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.with_info_plain_validator_function(
            cls._validate,
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def _validate(cls, v: Any, _info) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


custom_config = ConfigDict(
    allow_population_by_field_name=True,
    json_encoders={ObjectId: str},
    arbitrary_types_allowed=True,
    populate_by_name=True,
)


class User(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    name: str
    email: Optional[EmailStr] = None
    password: Optional[str] = None  # Hashed password
    role: str  # "ADMIN", "HEADTEACHER", "STUDENT"
    school_id: Optional[PydanticObjectId] = None  # Reference to schools collection
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserOut(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    name: str
    email: EmailStr
    role: str
    school_id: Optional[PydanticObjectId] = None
    created_at: datetime
    updated_at: datetime


class School(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    name: str
    email: EmailStr
    headteacher_id: PydanticObjectId  # Reference to users collection
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Competition(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    name: str
    description: str
    school_id: PydanticObjectId  # Reference to schools collection
    is_global: bool
    max_teams: int
    max_members_per_team: int
    created_by: PydanticObjectId  # Reference to users collection (headteacher)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    teams: Optional[List["Team"]] = None


class ChatMessage(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    user_id: PydanticObjectId
    user_name: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class File(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    user_id: PydanticObjectId
    user_name: str
    filename: str
    url: str
    size: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Team(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    name: str
    competition_id: PydanticObjectId  # Reference to competitions collection
    members: List[
        Dict[str, PydanticObjectId | str]
    ] = []  # List of {"user_id": ObjectId, "name": str}
    chat: List[ChatMessage] = []
    files: List[File] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RegistrationToken(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    token: str
    school_id: PydanticObjectId  # Reference to schools collection
    used: bool = False
    used_by: Optional[PydanticObjectId] = None  # Reference to user who used it
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    used_at: Optional[datetime] = None


class JoinRequest(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(
        alias="_id", default_factory=PydanticObjectId
    )
    team_id: PydanticObjectId  # Reference to teams collection
    user_id: PydanticObjectId  # Reference to users collection
    user_name: str
    status: str  # "PENDING", "APPROVED", "REJECTED"
    approvals: List[PydanticObjectId] = []  # Array of user ids who approved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
