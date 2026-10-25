import os
import sys
import asyncio
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from database import db
from main import app, register, login, get_me, UserRegister, UserLogin
from fastapi import HTTPException

async def run_registration_tests():
    print("\n--- Starting Farmer & Industry Registration & Location Tests ---")
    await db.init()

    # Clean up test phone numbers if they exist
    test_phones = ["9998880001", "9998880002", "9998880003", "9998880004", "9998880005"]
    for p in test_phones:
        if db.backend_type == "mongodb":
            await db.mongo_db["users"].delete_many({"phone": p})
        else:
            data = await db._read_all()
            data["users"] = [u for u in data["users"] if u.get("phone") != p]
            await db._write_all(data)

    # 1. Test farmer registration with user-entered village and district (including spaces and punctuation)
    farmer_payload = UserRegister(
        name="Ramesh Gowda",
        phone="9998880001",
        role="farmer",
        password="secretpassword",
        village="Kittur Channamma Nagar",
        district="Belagavi, North Karnataka",
        preferred_language="Kannada"
    )
    res = await register(farmer_payload)
    assert res["token"], "Farmer registration should return a JWT token"
    assert res["user"]["name"] == "Ramesh Gowda"
    assert res["user"]["location"] == "Kittur Channamma Nagar, Belagavi, North Karnataka"
    assert res["user"]["village"] == "Kittur Channamma Nagar"
    assert res["user"]["district"] == "Belagavi, North Karnataka"
    assert res["user"]["preferred_language"] == "Kannada"
    print("  [PASS] 1. Farmer registered with user-entered village and district with spaces and punctuation.")

    # 2. Test farmer registration with combined location field (backwards compatibility for frontend)
    farmer_payload_loc = UserRegister(
        name="Murugan S",
        phone="9998880002",
        role="farmer",
        password="password123",
        location="Valparai Estate, Coimbatore District",
        preferred_language="Tamil"
    )
    res2 = await register(farmer_payload_loc)
    assert res2["user"]["location"] == "Valparai Estate, Coimbatore District"
    assert res2["user"]["preferred_language"] == "Tamil"
    print("  [PASS] 2. Farmer registered with combined location string.")

    # 3. Test blank/whitespace-only location rejection for farmers
    farmer_empty_payload = UserRegister(
        name="Blank Farmer",
        phone="9998880003",
        role="farmer",
        password="password123",
        village="   ",
        district="   ",
        location="   "
    )
    rejected = False
    try:
        await register(farmer_empty_payload)
    except HTTPException as e:
        rejected = True
        assert e.status_code == 400
        assert "Village/District is required for farmers" in e.detail
    assert rejected, "Blank village/district should be rejected with 400"
    print("  [PASS] 3. Farmer registration with whitespace-only location properly rejected with 400.")

    # 4. Test industry registration (village/district NOT required; company name IS required)
    ind_payload = UserRegister(
        name="Anand Sharma",
        phone="9998880004",
        role="industry",
        password="industrypass",
        company="BioFuel Green Energy Pvt Ltd",
        preferred_language="Hindi"
    )
    res_ind = await register(ind_payload)
    assert res_ind["user"]["company"] == "BioFuel Green Energy Pvt Ltd"
    assert res_ind["user"]["location"] == "BioFuel Green Energy Pvt Ltd"
    assert res_ind["user"]["preferred_language"] == "Hindi"
    print("  [PASS] 4. Industry registered successfully without requiring village or district.")

    # 5. Test industry registration missing company name
    ind_empty_company = UserRegister(
        name="Empty Ind",
        phone="9998880005",
        role="industry",
        password="industrypass",
        company="   "
    )
    ind_rejected = False
    try:
        await register(ind_empty_company)
    except HTTPException as e:
        ind_rejected = True
        assert e.status_code == 400
        assert "Company name is required for industry" in e.detail
    assert ind_rejected, "Empty company name for industry should be rejected"
    print("  [PASS] 5. Industry registration with blank company name rejected with 400.")

    # 6. Verify user profile retrieval preserves village, district, location, and preferred_language
    from auth import get_current_user
    user_me = await get_me(current_user={"phone": "9998880001", "role": "farmer", "name": "Ramesh Gowda"})
    assert user_me["village"] == "Kittur Channamma Nagar"
    assert user_me["district"] == "Belagavi, North Karnataka"
    assert user_me["location"] == "Kittur Channamma Nagar, Belagavi, North Karnataka"
    assert user_me["preferred_language"] == "Kannada"
    print("  [PASS] 6. User profile /api/auth/me returns saved location, village, district, and preferred_language.")

    # Clean up test users
    for p in test_phones:
        if db.backend_type == "mongodb":
            await db.mongo_db["users"].delete_many({"phone": p})
    print("\n--- ALL REGISTRATION & LOCATION TESTS PASSED SUCCESSFULLY! ---\n")

if __name__ == "__main__":
    asyncio.run(run_registration_tests())


def test_registration_flow():
    asyncio.run(run_registration_tests())
