"""
Unit and integration tests for database operations:
- Document sanitization and ObjectId serialization
- Connection failure behavior when MONGODB_URI is misconfigured
- Intentional JSON mode with sequential and concurrent CRUD operations
- Migration idempotency simulation
"""

import os
import sys
import json
import asyncio
from pathlib import Path

# Add backend directory to path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from database import serialize_doc, serialize_docs, Database
import migrate_to_atlas

def test_document_serialization():
    print("Testing document sanitization and ObjectId stripping...")
    # Case 1: Standard mongo doc with ObjectId
    sample_doc = {
        "_id": "664b38d1e2f6c91a8b456789",
        "id": 12345,
        "phone": "9876543210",
        "name": "Ramesh",
        "role": "farmer"
    }
    cleaned = serialize_doc(sample_doc)
    assert "_id" not in cleaned, "Expected '_id' to be removed from serialized document"
    assert cleaned["id"] == 12345, "Expected application-level 'id' to be preserved"
    assert cleaned["phone"] == "9876543210"

    # Case 2: Doc with only _id
    id_only_doc = {
        "_id": "664b38d1e2f6c91a8b456789",
        "name": "Company X"
    }
    cleaned_id = serialize_doc(id_only_doc)
    assert "_id" not in cleaned_id
    assert cleaned_id["id"] == "664b38d1e2f6c91a8b456789", "Expected _id to become string id if application id is missing"

    # Case 3: None doc
    assert serialize_doc(None) is None

    # Case 4: List serialization
    docs_list = [sample_doc, None, id_only_doc]
    cleaned_list = serialize_docs(docs_list)
    assert len(cleaned_list) == 2
    for doc in cleaned_list:
        assert "_id" not in doc

    print("  [PASS] Document serialization tests passed.")

async def test_connection_failure_behavior():
    print("Testing connection failure behavior when MONGODB_URI is set...")
    # Temporarily set invalid MONGODB_URI
    os.environ["MONGODB_URI"] = "mongodb+srv://invalid_user:invalid_pass@nonexistent.example.com/agribridge"
    test_db = Database()
    raised = False
    try:
        await test_db.init()
    except RuntimeError as e:
        raised = True
        # Verify it raises an error and does not silently fall back
        assert test_db.backend_type == "error", "Expected backend_type to be 'error'"
        assert "Failed to connect to configured MongoDB" in str(e) or "Critical Error" in str(e)
    finally:
        os.environ.pop("MONGODB_URI", None)

    assert raised, "Expected Database.init() to raise RuntimeError on connection failure when MONGODB_URI is provided"
    print("  [PASS] Connection failure behavior test passed (no silent fallback).")

async def test_intentional_json_mode_and_concurrency():
    print("Testing intentional JSON mode with sequential and concurrent operations...")
    if "MONGODB_URI" in os.environ:
        del os.environ["MONGODB_URI"]

    json_db = Database()
    await json_db.init()
    assert json_db.backend_type == "json", "Expected backend_type to be 'json'"

    # 1. Sequential user creation and retrieval
    test_phone = "9111222333"
    user_payload = {
        "phone": test_phone,
        "name": "Test User",
        "role": "farmer",
        "location": "Mysuru",
        "password_hash": "testhash123"
    }
    created = await json_db.create_user(user_payload)
    assert created["phone"] == test_phone

    found = await json_db.get_user_by_phone(test_phone)
    assert found is not None
    assert found["name"] == "Test User"

    # 2. Sequential listing creation and retrieval
    listing_id = 99887711
    listing_payload = {
        "id": listing_id,
        "user_phone": test_phone,
        "farmer": "Test User",
        "village": "Mysuru",
        "waste": "Paddy Straw",
        "qty": 15,
        "price": 2000,
        "status": "available"
    }
    await json_db.create_listing(listing_payload)
    my_listings = await json_db.get_listings_by_user(test_phone)
    assert any(l["id"] == listing_id for l in my_listings)

    # 3. Concurrent operations test using asyncio.gather
    async def create_concurrent_demand(num: int):
        demand_doc = {
            "id": 880000 + num,
            "user_phone": test_phone,
            "company": f"Concurrent Corp {num}",
            "type": "Sugarcane Bagasse",
            "qty": 10 + num,
            "budget": 1500,
            "status": "open"
        }
        return await json_db.create_demand(demand_doc)

    async def create_concurrent_deal(num: int):
        deal_doc = {
            "id": 770000 + num,
            "buyer_phone": test_phone,
            "farmer_phone": "9999888801",
            "farmer_name": "Ramesh",
            "waste": "Cotton Stalks",
            "qty": 5 + num,
            "price": 1800,
            "status": "Pending"
        }
        return await json_db.create_deal(deal_doc)

    # Fire 5 concurrent demands and 5 concurrent deals simultaneously
    tasks = [create_concurrent_demand(i) for i in range(5)] + [create_concurrent_deal(i) for i in range(5)]
    results = await asyncio.gather(*tasks)
    assert len(results) == 10

    demands_found = await json_db.get_demands_by_user(test_phone)
    deals_found = await json_db.get_deals_for_user(test_phone, role="industry")
    assert len(demands_found) >= 5
    assert len(deals_found) >= 5

    print("  [PASS] Intentional JSON mode sequential and concurrent operations passed.")

async def test_migration_dry_run():
    print("Testing migration script in dry-run mode...")
    res = await migrate_to_atlas.run_migration(dry_run=True)
    assert res.get("mode") == "dry_run"
    assert res.get("status") == "ready"
    assert res.get("users_count", 0) >= 1
    assert res.get("listings_count", 0) >= 1
    print("  [PASS] Migration dry-run test passed.")

async def main():
    print("\n--- Running Agri-Bridge MongoDB Integration Test Suite ---")
    test_document_serialization()
    await test_connection_failure_behavior()
    await test_intentional_json_mode_and_concurrency()
    await test_migration_dry_run()
    print("--- ALL 4 TEST MODULES PASSED SUCCESSFULLY ---\n")

if __name__ == "__main__":
    asyncio.run(main())
