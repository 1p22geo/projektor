from fastapi import APIRouter, Body, HTTPException
from typing import List
from services import join_request_service, team_service
from models import JoinRequest, PydanticObjectId
from pydantic import BaseModel

router = APIRouter()


class JoinRequestCreateRequest(BaseModel):
    team_id: PydanticObjectId
    user_id: PydanticObjectId
    user_name: str


@router.post("/", response_model=JoinRequest)
def create_join_request(request_data: JoinRequestCreateRequest = Body(...)):
    """Create a new join request"""
    # Check if user already has a pending request for this team
    existing_requests = join_request_service.get_join_requests_for_user(request_data.user_id)
    for req in existing_requests:
        if req.team_id == request_data.team_id and req.status == "PENDING":
            raise HTTPException(status_code=400, detail="Join request already exists for this team")
    
    # Check if user is already a member of the team
    team = team_service.get_team(request_data.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    for member in team.members:
        if member.get("user_id") == request_data.user_id:
            raise HTTPException(status_code=400, detail="User is already a member of this team")
    
    new_request = JoinRequest(
        team_id=request_data.team_id,
        user_id=request_data.user_id,
        user_name=request_data.user_name,
        status="PENDING",
        approvals=[],
    )
    return join_request_service.create_join_request(new_request)


@router.get("/team/{team_id}", response_model=List[JoinRequest])
def get_team_join_requests(team_id: PydanticObjectId):
    """Get all join requests for a team"""
    return join_request_service.get_join_requests_for_team(team_id)


@router.get("/user/{user_id}", response_model=List[JoinRequest])
def get_user_join_requests(user_id: PydanticObjectId):
    """Get all join requests made by a user"""
    return join_request_service.get_join_requests_for_user(user_id)


@router.post("/{request_id}/approve", response_model=JoinRequest)
def approve_join_request(
    request_id: PydanticObjectId,
    user_id: PydanticObjectId = Body(..., embed=True)
):
    """Approve a join request (add approval from a team member)"""
    join_request = join_request_service.get_join_request(request_id)
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")
    
    if join_request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Join request is not pending")
    
    # Get the team to check membership and majority
    team = team_service.get_team(join_request.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if user is a team member
    is_member = False
    for member in team.members:
        if member.get("user_id") == user_id:
            is_member = True
            break
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Only team members can approve join requests")
    
    # Add approval
    updated_request = join_request_service.add_approval(request_id, user_id)
    if not updated_request:
        raise HTTPException(status_code=404, detail="Join request not found")
    
    # Check if majority is reached
    team_size = len(team.members)
    approvals_needed = (team_size // 2) + 1  # Simple majority
    
    if len(updated_request.approvals) >= approvals_needed:
        # Approve the request and add user to team
        join_request_service.update_join_request(request_id, {"status": "APPROVED"})
        team_service.add_member_to_team(
            team.id,
            updated_request.user_id,
            updated_request.user_name
        )
        updated_request.status = "APPROVED"
    
    return updated_request


@router.post("/{request_id}/reject", response_model=JoinRequest)
def reject_join_request(request_id: PydanticObjectId):
    """Reject a join request"""
    join_request = join_request_service.get_join_request(request_id)
    if not join_request:
        raise HTTPException(status_code=404, detail="Join request not found")
    
    if join_request.status != "PENDING":
        raise HTTPException(status_code=400, detail="Join request is not pending")
    
    updated_request = join_request_service.update_join_request(
        request_id, {"status": "REJECTED"}
    )
    if updated_request:
        return updated_request
    raise HTTPException(status_code=404, detail="Join request not found")


@router.delete("/{request_id}")
def delete_join_request(request_id: PydanticObjectId):
    """Delete a join request"""
    result = join_request_service.delete_join_request(request_id)
    if result["deleted_count"] == 0:
        raise HTTPException(status_code=404, detail="Join request not found")
    return {"message": "Join request deleted successfully"}
