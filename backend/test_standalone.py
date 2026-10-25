import asyncio
import os
import sys
import time
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import db
from auth import hash_password, verify_password, create_access_token, decode_access_token

async def run_tests():
    print("1. Testing Password Hashing & Verification...")
    raw = "super_secret_pass_123"
    hashed = hash_password(raw)
    assert raw != hashed
    assert verify_password(raw, hashed)
    assert not verify_password("wrong_password", hashed)
    print("   [PASS] Password security validated.")

    print("2. Testing Signed Token Generation & Decoding...")
    token = create_access_token({"phone": "9876543210", "role": "farmer", "name": "Karthik"})
    payload = decode_access_token(token)
    assert payload["phone"] == "9876543210"
    assert payload["role"] == "farmer"
    print("   [PASS] Token cryptography validated.")

    print("3. Testing Database Initialization & Storage...")
    await db.init()

    # Use an isolated unique test identifier and clean up afterwards
    test_phone = f"99990{int(time.time()) % 100000:05d}"
    test_user = {
        "phone": test_phone,
        "name": "Integration Tester",
        "role": "farmer",
        "location": "Coimbatore",
        "password_hash": hashed,
        "created_at": int(time.time()),
        "earned": "₹0", "sold": "0 T", "co2": "0 T", "deals": "0", "sourced": "0 T", "saved": "₹0"
    }
    await db.create_user(test_user)
    retrieved = await db.get_user_by_phone(test_phone)
    assert retrieved is not None
    assert retrieved["name"] == "Integration Tester"
    print("   [PASS] User creation and retrieval validated.")

    print("4. Testing Listing Creation & Retrieval...")
    test_listing_id = int(time.time() * 1000)
    test_listing = {
        "id": test_listing_id,
        "user_phone": test_phone,
        "farmer": "Integration Tester",
        "village": "Coimbatore",
        "waste": "Paddy Straw",
        "qty": 20,
        "price": 2400,
        "status": "available"
    }
    await db.create_listing(test_listing)
    my_listings = await db.get_listings_by_user(test_phone)
    assert any(l["id"] == test_listing_id for l in my_listings)
    print("   [PASS] Listing persistence validated.")

    print("5. Testing Demand Creation & Retrieval...")
    test_demand_id = int(time.time() * 1000) + 1
    test_demand = {
        "id": test_demand_id,
        "user_phone": test_phone,
        "company": "EcoPackaging Ltd",
        "type": "Sugarcane Bagasse",
        "qty": 50,
        "budget": 1800,
        "status": "open"
    }
    await db.create_demand(test_demand)
    my_demands = await db.get_demands_by_user(test_phone)
    assert any(d["id"] == test_demand_id for d in my_demands)
    print("   [PASS] Demand persistence validated.")

    print("6. Testing Deal Creation & Retrieval...")
    test_deal_id = int(time.time() * 1000) + 2
    test_deal = {
        "id": test_deal_id,
        "buyer_phone": test_phone,
        "farmer_phone": "9999888801",
        "farmer_name": "Ramesh",
        "waste": "Paddy Straw",
        "qty": 10,
        "price": 2400,
        "status": "Pending"
    }
    await db.create_deal(test_deal)
    my_deals = await db.get_deals_for_user(test_phone, role="industry")
    assert any(d["id"] == test_deal_id for d in my_deals)
    print("   [PASS] Deal persistence validated.")

    # Clean up isolated test records from MongoDB
    if db.backend_type == "mongodb" and db.mongo_db is not None:
        await db.mongo_db.users.delete_one({"phone": test_phone})
        await db.mongo_db.listings.delete_one({"id": test_listing_id})
        await db.mongo_db.demands.delete_one({"id": test_demand_id})
        await db.mongo_db.deals.delete_one({"id": test_deal_id})

    print("\nALL CORE BACKEND MODULE TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(run_tests())
