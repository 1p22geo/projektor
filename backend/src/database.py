from pymongo import MongoClient
from dotenv import load_dotenv, find_dotenv
import os

# Load from .env.local file in project root
load_dotenv(find_dotenv(".env.local", usecwd=True))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/projektor")
TEST_DATABASE = os.getenv("MONGO_TEST_DATABASE", "projektor_test")

# Lazy database connection - allows TEST_MODE to be set after import
_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI)
        # Use test database if in test mode
        if os.getenv("TEST_MODE") == "true":
            _db = _client[TEST_DATABASE]
        else:
            _db = _client.get_database()
    return _db

# For backwards compatibility
db = type('LazyDB', (), {'get_collection': lambda self, name: get_db()[name]})()
client = None  # Will be set on first get_db() call