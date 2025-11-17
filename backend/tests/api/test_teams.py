from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import MagicMock
from models import Team, PydanticObjectId
from datetime import datetime, timezone
import hashlib

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_db_connection(mocker):
    # Mock the db object directly
    mocker.patch('database.db')
    
    # Mock collections
    mocker.patch('database.db.get_collection', return_value=MagicMock())
    
    # Mock specific collections used in services
    mocker.patch('services.user_service._users_collection', new=MagicMock())
    mocker.patch('services.team_service._teams_collection', new=MagicMock())
    mocker.patch('services.competition_service._competitions_collection', new=MagicMock())
    mocker.patch('api.auth.db.get_collection', return_value=MagicMock())
    mocker.patch('api.admin.db.get_collection', return_value=MagicMock())
    mocker.patch('api.headteacher.db.get_collection', return_value=MagicMock())
    mocker.patch('api.student.db.get_collection', return_value=MagicMock())

@pytest.fixture
def sample_team_data():
    return {
        "_id": str(PydanticObjectId()),
        "name": "Test Team",
        "competition_id": str(PydanticObjectId()),
        "members": [{"user_id": str(PydanticObjectId()), "name": "Member One"}],
        "chat": [],
        "files": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

def test_create_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.insert_one.return_value = MagicMock(inserted_id=sample_team_data["_id"])
    
    response = client.post("/api/teams/", json={
        "name": sample_team_data["name"],
        "competition_id": str(sample_team_data["competition_id"])
    })
    assert response.status_code == 200
    assert response.json()["name"] == sample_team_data["name"]
    assert response.json()["competition_id"] == str(sample_team_data["competition_id"])

def test_get_teams(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.find.return_value = [sample_team_data]
    
    response = client.get("/api/teams/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == sample_team_data["name"]

def test_get_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.find_one.return_value = sample_team_data
    
    response = client.get(f"/api/teams/{sample_team_data['_id']}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_team_data["name"]

def test_get_team_not_found(mocker):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.find_one.return_value = None
    
    response = client.get(f"/api/teams/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Team not found"

def test_update_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.find_one.side_effect = [sample_team_data, {**sample_team_data, "name": "Updated Team"}]
    mock_collection.update_one.return_value = MagicMock(matched_count=1)
    
    response = client.put(f"/api/teams/{sample_team_data['_id']}", json={"name": "Updated Team"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Team"

def test_update_team_not_found(mocker):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.find_one.return_value = None
    
    response = client.put(f"/api/teams/{PydanticObjectId()}", json={"name": "Updated Team"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Team not found"

def test_delete_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=1)
    
    response = client.delete(f"/api/teams/{sample_team_data['_id']}")
    assert response.status_code == 200
    assert response.json()["message"] == "Team deleted successfully"

def test_delete_team_not_found(mocker):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=0)
    
    response = client.delete(f"/api/teams/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Team not found"

def test_add_member_to_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    new_member_id = PydanticObjectId()
    new_member_name = "New Member"
    
    mock_collection.find_one.side_effect = [
        sample_team_data,
        {**sample_team_data, "members": [*sample_team_data["members"], {"user_id": new_member_id, "name": new_member_name}]}
    ]
    mock_collection.update_one.return_value = MagicMock(matched_count=1)
    
    response = client.post(f"/api/teams/{sample_team_data['_id']}/members", json={"user_id": str(new_member_id), "user_name": new_member_name})
    assert response.status_code == 200
    assert len(response.json()["members"]) == len(sample_team_data["members"]) + 1
    assert response.json()["members"][-1]["user_id"] == str(new_member_id)

def test_remove_member_from_team(mocker, sample_team_data):
    mock_collection = mocker.patch('services.team_service._teams_collection')
    member_to_remove_id = sample_team_data["members"][0]["user_id"]
    
    mock_collection.find_one.side_effect = [
        sample_team_data,
        {**sample_team_data, "members": []}
    ]
    mock_collection.update_one.return_value = MagicMock(matched_count=1)
    
    response = client.delete(f"/api/teams/{sample_team_data['_id']}/members/{member_to_remove_id}")
    assert response.status_code == 200
    assert len(response.json()["members"]) == 0
