"""
Focused verification test for local MongoDB connection selection and failure behavior:
1. Verifies that MONGODB_URI=mongodb://127.0.0.1:27017/agribridge selects 'mongodb' as database_backend.
2. Verifies that /api/health returns database_backend: 'mongodb'.
3. Verifies that setting an unreachable MONGODB_URI raises RuntimeError and does NOT silently fall back to 'json'.
4. Verifies that unsetting MONGODB_URI selects intentional 'json' mode.
"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

# Load backend/.env
ENV_FILE = BACKEND_DIR / ".env"
load_dotenv(ENV_FILE)

from database import Database
from main import app, startup_db, health_check

async def test_local_mongodb_selection():
    print("\n--- Running Focused MongoDB Selection & Verification Test ---")

    # 1. Test that local MongoDB URI selects 'mongodb'
    os.environ["MONGODB_URI"] = "mongodb://127.0.0.1:27017/agribridge"
    db_instance = Database()
    await db_instance.init()
    assert db_instance.backend_type == "mongodb", f"Expected backend_type 'mongodb', got '{db_instance.backend_type}'"
    assert db_instance.mongo_db is not None, "Expected mongo_db to be initialized"
    assert db_instance.mongo_db.name == "agribridge", f"Expected db name 'agribridge', got '{db_instance.mongo_db.name}'"
    print("  [PASS] 1. Configured local MongoDB URI successfully selects 'mongodb' backend.")

    # 2. Test that FastAPI health_check reports 'mongodb'
    await startup_db()
    health = health_check()
    assert health["status"] == "ok"
    assert health["database_backend"] == "mongodb", f"Expected health database_backend 'mongodb', got '{health.get('database_backend')}'"
    assert health["gemini_model"] == "gemini-3.5-flash-lite"
    print("  [PASS] 2. FastAPI /api/health contract returns database_backend: 'mongodb'.")

    # 3. Test that unreachable MongoDB raises RuntimeError and refuses to silently fallback to json
    os.environ["MONGODB_URI"] = "mongodb://127.0.0.1:27999/agribridge"
    failing_db = Database()
    raised = False
    try:
        await failing_db.init()
    except RuntimeError as re:
        raised = True
        assert failing_db.backend_type == "error", "Expected backend_type 'error' on connection failure"
        assert "Failed to connect to configured MongoDB" in str(re) or "Critical Error" in str(re)
    assert raised, "Expected Database.init() to raise RuntimeError on connection failure when MONGODB_URI is set"
    print("  [PASS] 3. Unreachable MongoDB fails visibly and does NOT silently degrade to JSON.")

    # 4. Test intentional JSON mode when MONGODB_URI is empty/unset
    os.environ["MONGODB_URI"] = ""
    json_db = Database()
    await json_db.init()
    assert json_db.backend_type == "json", f"Expected backend_type 'json' when MONGODB_URI is empty, got '{json_db.backend_type}'"
    print("  [PASS] 4. Unset MONGODB_URI selects intentional 'json' mode.")

    # Restore local URI
    os.environ["MONGODB_URI"] = "mongodb://127.0.0.1:27017/agribridge"
    print("\n--- ALL FOCUSED VERIFICATION TESTS PASSED SUCCESSFULLY! ---\n")

if __name__ == "__main__":
    asyncio.run(test_local_mongodb_selection())
