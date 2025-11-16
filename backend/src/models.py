from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

# Custom Pydantic type for ObjectId
class PydanticObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId string")
            return ObjectId(v)
        raise ValueError("ObjectId must be a string or ObjectId instance")

    def __new__(cls, value: Any = None):
        if value is None:
            value = ObjectId()
        if isinstance(value, ObjectId):
            return str(value)
        return str(cls.validate(value))

custom_config = ConfigDict(
    allow_population_by_field_name=True,
    json_encoders={ObjectId: str},
    arbitrary_types_allowed=True,
    populate_by_name=True
)

class User(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    password: Optional[str]  # Hashed password
    role: str      # "ADMIN", "HEADTEACHER", "STUDENT"
    school_id: Optional[PydanticObjectId] = None # Reference to schools collection
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserOut(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    role: str
    school_id: Optional[PydanticObjectId] = None
    created_at: datetime
    updated_at: datetime

class School(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    headteacher_id: PydanticObjectId # Reference to users collection
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Competition(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    description: str
    school_id: PydanticObjectId # Reference to schools collection
    is_global: bool
    max_teams: int
    max_members_per_team: int
    created_by: PydanticObjectId # Reference to users collection (headteacher)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default_factory=ObjectId)
    user_id: PydanticObjectId
    user_name: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class File(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default_factory=ObjectId)
    user_id: PydanticObjectId
    user_name: str
    filename: str
    url: str
    size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Team(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    competition_id: PydanticObjectId # Reference to competitions collection
    members: List[Dict[str, PydanticObjectId | str]] = [] # List of {"user_id": ObjectId, "name": str}
    chat: List[ChatMessage] = []
    files: List[File] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class RegistrationToken(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    token: str
    school_id: PydanticObjectId # Reference to schools collection
    used: bool = False
    used_by: Optional[PydanticObjectId] = None # Reference to user who used it
    created_at: datetime = Field(default_factory=datetime.utcnow)
    used_at: Optional[datetime] = None

class JoinRequest(BaseModel):
    model_config = custom_config
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    team_id: PydanticObjectId # Reference to teams collection
    user_id: PydanticObjectId # Reference to users collection
    user_name: str
    status: str # "PENDING", "APPROVED", "REJECTED"
    approvals: List[PydanticObjectId] = [] # Array of user ids who approved
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
