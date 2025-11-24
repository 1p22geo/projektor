#!/usr/bin/env python3
"""
Script to clean up the test database before running E2E tests.
This should be called from Playwright's global setup.
"""
import os
import sys

# Add backend src to path so we can import from it
backend_src = os.path.join(os.path.dirname(__file__), '..', 'backend', 'src')
sys.path.insert(0, backend_src)

from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env.local
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(env_path)

def cleanup_test_database():
    """Clean up the test database by dropping all collections."""
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        print("❌ Error: MONGO_URI not found in environment variables", file=sys.stderr)
        sys.exit(1)
    
    # Use a separate test database
    test_db_name = os.getenv("MONGO_TEST_DATABASE", "projektor_test")
    
    # Safety check: Only allow cleaning test databases
    if not ("test" in test_db_name.lower() or test_db_name.endswith("_test")):
        print(f"❌ Error: Refusing to clean non-test database: {test_db_name}", file=sys.stderr)
        print("   Database name must contain 'test' or end with '_test'", file=sys.stderr)
        sys.exit(1)
    
    print(f"🧹 Cleaning up test database: {test_db_name}")
    
    client = None
    try:
        client = MongoClient(mongo_uri)
        db = client[test_db_name]
        
        # Get all collection names
        collections = db.list_collection_names()
        
        if not collections:
            print("✅ Test database is already empty")
            return
        
        # Drop all collections
        for collection_name in collections:
            db.drop_collection(collection_name)
            print(f"  🗑️  Dropped collection: {collection_name}")
        
        print(f"✅ Successfully cleaned up {len(collections)} collection(s)")
        
    except Exception as e:
        print(f"❌ Error cleaning up database: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if client:
            client.close()

if __name__ == "__main__":
    cleanup_test_database()
