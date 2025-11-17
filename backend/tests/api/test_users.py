from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import MagicMock
from models import User, PydanticObjectId
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
def sample_user_data():
    return {
        "_id": str(PydanticObjectId()),
        "name": "Test User",
        "email": "test@example.com",
        "password": hashlib.sha256("password".encode()).hexdigest(),
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

def test_create_user(mocker, sample_user_data):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.insert_one.return_value = MagicMock(inserted_id=sample_user_data["_id"])
    
    response = client.post("/api/users/", json={
        "name": sample_user_data["name"],
        "email": sample_user_data["email"],
        "password": "password"
    })
    assert response.status_code == 200
    assert response.json()["name"] == sample_user_data["name"]
    assert response.json()["email"] == sample_user_data["email"]
    assert "password" not in response.json() # Password hash should not be returned

def test_get_users(mocker, sample_user_data):
    mock_collection = mocker.patch('services.user_service._users_collection')
    user_data_without_password = {k: v for k, v in sample_user_data.items() if k != "password"}
    mock_collection.find.return_value = [user_data_without_password]
    
    response = client.get("/api/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == sample_user_data["name"]
    assert "password" not in response.json()[0]

def test_get_user(mocker, sample_user_data):
    mock_collection = mocker.patch('services.user_service._users_collection')
    user_data_without_password = {k: v for k, v in sample_user_data.items() if k != "password"}
    mock_collection.find_one.return_value = user_data_without_password
    
    response = client.get(f"/api/users/{sample_user_data['_id']}")
    assert response.status_code == 200
    assert response.json()["name"] == sample_user_data["name"]
    assert "password" not in response.json()

def test_get_user_not_found(mocker):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.find_one.return_value = None
    
    response = client.get(f"/api/users/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_update_user(mocker, sample_user_data):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.find_one.side_effect = [sample_user_data, {**sample_user_data, "name": "Updated Name"}]
    mock_collection.update_one.return_value = MagicMock(matched_count=1)
    
    response = client.put(f"/api/users/{sample_user_data['_id']}", json={"name": "Updated Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"

def test_update_user_not_found(mocker):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.find_one.return_value = None
    
    response = client.put(f"/api/users/{PydanticObjectId()}", json={"name": "Updated Name"})
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"

def test_delete_user(mocker, sample_user_data):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=1)
    
    response = client.delete(f"/api/users/{sample_user_data['_id']}")
    assert response.status_code == 200
    assert response.json()["message"] == "User deleted successfully"

def test_delete_user_not_found(mocker):
    mock_collection = mocker.patch('services.user_service._users_collection')
    mock_collection.delete_one.return_value = MagicMock(deleted_count=0)
    
    response = client.delete(f"/api/users/{PydanticObjectId()}")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
