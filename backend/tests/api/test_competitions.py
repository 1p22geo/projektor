from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import MagicMock
from models import Competition, PydanticObjectId
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
def sample_competition_data():
    return {
        "_id": str(PydanticObjectId()),
        "name": "Test Competition",
        "description": "A competition for testing",
        "school_id": str(PydanticObjectId()),
        "is_global": False,
        "max_teams": 10,
        "max_members_per_team": 5,
        "created_by": str(PydanticObjectId()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

def test_create_competition(mocker, sample_competition_data):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.insert_one.return_value = MagicMock(inserted_id=sample_competition_data["_id"])
    
    response = client.post("/api/competitions/", json={
        "name": sample_competition_data["name"],
        "description": sample_competition_data["description"],
        "school_id": str(sample_competition_data["school_id"]),
        "is_global": sample_competition_data["is_global"],
        "max_teams": sample_competition_data["max_teams"],
        "max_members_per_team": sample_competition_data["max_members_per_team"],
        "created_by": str(sample_competition_data["created_by"])
    })
    assert response.status_code == 200
    assert response.json()["name"] == sample_competition_data["name"]
    assert response.json()["school_id"] == str(sample_competition_data["school_id"])

def test_get_competitions(mocker, sample_competition_data):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.find.return_value = [sample_competition_data]
    
    response = client.get("/api/competitions/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == sample_competition_data["name"]

def test_get_competition(mocker, sample_competition_data):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.find_one.return_value = sample_competition_data
    
    response = client.get(f"/api/competitions/{sample_competition_data['_id']}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_competition_data["name"]

def test_get_competition_not_found(mocker):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.find_one.return_value = None
    
    response = client.get(f"/api/competitions/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Competition not found"

def test_update_competition(mocker, sample_competition_data):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.find_one.side_effect = [sample_competition_data, {**sample_competition_data, "name": "Updated Competition"}]
    mock_collection.update_one.return_value = MagicMock(matched_count=1)
    
    response = client.put(f"/api/competitions/{sample_competition_data['_id']}", json={"name": "Updated Competition"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Competition"

def test_update_competition_not_found(mocker):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.find_one.return_value = None
    
    response = client.put(f"/api/competitions/{PydanticObjectId()}", json={"name": "Updated Competition"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Competition not found"

def test_delete_competition(mocker, sample_competition_data):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=1)
    
    response = client.delete(f"/api/competitions/{sample_competition_data['_id']}")
    assert response.status_code == 200
    assert response.json()["message"] == "Competition deleted successfully"

def test_delete_competition_not_found(mocker):
    mock_collection = mocker.patch('services.competition_service._competitions_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=0)
    
    response = client.delete(f"/api/competitions/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Competition not found"
