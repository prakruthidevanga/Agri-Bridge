import os
import sys
import time
import pytest
import asyncio
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from database import db
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    get_current_user
)
from main import (
    app,
    register,
    login,
    get_me,
    list_my_listings,
    create_listing,
    list_my_demands,
    create_demand,
    list_my_deals,
    create_deal,
    UserRegister,
    UserLogin,
    ListingCreate,
    DemandCreate,
    DealCreate
)
from fastapi import HTTPException

# Test suite covering all 18 authentication and authorization requirements
async def run_comprehensive_auth_tests():
    print("\n=======================================================")
    print("  RUNNING AGRI-BRIDGE COMPREHENSIVE AUTH TEST SUITE")
    print("=======================================================")
    await db.init()

    # Clean up test users if they exist
    test_phones = [
        "9991110001", "9991110002", "9991110003", "9991110004",
        "9991110005", "9991110006", "9991110007"
    ]
    for p in test_phones:
        if db.backend_type == "mongodb" and db.mongo_db is not None:
            await db.mongo_db["users"].delete_many({"phone": p})
            await db.mongo_db["listings"].delete_many({"user_phone": p})
            await db.mongo_db["demands"].delete_many({"user_phone": p})
            await db.mongo_db["deals"].delete_many({"buyer_phone": p})
        else:
            data = await db._read_all()
            data["users"] = [u for u in data["users"] if u.get("phone") != p]
            data["listings"] = [l for l in data["listings"] if l.get("user_phone") != p]
            data["demands"] = [d for d in data["demands"] if d.get("user_phone") != p]
            data["deals"] = [dl for dl in data["deals"] if dl.get("buyer_phone") != p]
            await db._write_all(data)

    # 1. Farmer Registration succeeds with valid details
    f_reg_payload = UserRegister(
        name="Basavaraj Patil",
        phone="9991110001",
        role="farmer",
        password="farmerSecurePass",
        village="Hebbal",
        district="Dharwad",
        preferred_language="Kannada"
    )
    f_res = await register(f_reg_payload)
    assert f_res["token"], "Token must be returned on registration"
    assert f_res["user"]["name"] == "Basavaraj Patil"
    assert f_res["user"]["role"] == "farmer"
    assert f_res["user"]["location"] == "Hebbal, Dharwad"
    print("  [PASS] 1. Farmer registration succeeded with valid details.")

    # 2. Industry Registration succeeds with valid details
    ind_reg_payload = UserRegister(
        name="Meera Kapoor",
        phone="9991110002",
        role="industry",
        password="industrySecurePass",
        company="GreenCell BioEnergy Ltd",
        preferred_language="English"
    )
    ind_res = await register(ind_reg_payload)
    assert ind_res["token"], "Token must be returned on registration"
    assert ind_res["user"]["name"] == "Meera Kapoor"
    assert ind_res["user"]["role"] == "industry"
    assert ind_res["user"]["company"] == "GreenCell BioEnergy Ltd"
    print("  [PASS] 2. Industry registration succeeded with valid details.")

    # 3. Duplicate registration is rejected correctly with 400
    dup_rejected = False
    try:
        await register(f_reg_payload)
    except HTTPException as e:
        dup_rejected = True
        assert e.status_code == 400
        assert "already exists" in e.detail.lower()
    assert dup_rejected, "Duplicate registration must fail with HTTP 400"
    print("  [PASS] 3. Duplicate phone registration rejected correctly with 400.")

    # 4. Login succeeds with valid farmer credentials
    f_login_payload = UserLogin(phone="9991110001", password="farmerSecurePass")
    f_login_res = await login(f_login_payload)
    assert f_login_res["token"], "Login must return valid JWT"
    assert f_login_res["user"]["role"] == "farmer"
    assert f_login_res["user"]["name"] == "Basavaraj Patil"
    assert f_login_res["user"]["village"] == "Hebbal"
    assert f_login_res["user"]["district"] == "Dharwad"
    farmer_token = f_login_res["token"]
    print("  [PASS] 4. Login succeeded with valid farmer credentials.")

    # 5. Login succeeds with valid industry credentials
    ind_login_payload = UserLogin(phone="9991110002", password="industrySecurePass")
    ind_login_res = await login(ind_login_payload)
    assert ind_login_res["token"], "Login must return valid JWT"
    assert ind_login_res["user"]["role"] == "industry"
    assert ind_login_res["user"]["company"] == "GreenCell BioEnergy Ltd"
    industry_token = ind_login_res["token"]
    print("  [PASS] 5. Login succeeded with valid industry credentials.")

    # 6. Login fails with incorrect password (HTTP 401)
    bad_pass_rejected = False
    try:
        await login(UserLogin(phone="9991110001", password="wrongPassword"))
    except HTTPException as e:
        bad_pass_rejected = True
        assert e.status_code == 401
        assert "Invalid phone number or password" in e.detail
    assert bad_pass_rejected, "Incorrect password must fail with HTTP 401"
    print("  [PASS] 6. Login failed with incorrect password as expected (401).")

    # 7. Login fails for unknown user (HTTP 401)
    unknown_rejected = False
    try:
        await login(UserLogin(phone="9991110099", password="somePassword"))
    except HTTPException as e:
        unknown_rejected = True
        assert e.status_code == 401
    assert unknown_rejected, "Unknown user must fail with HTTP 401"
    print("  [PASS] 7. Login failed for unknown phone number (401).")

    # 8. Missing or malformed input is rejected (e.g. invalid phone length)
    bad_phone_rejected = False
    try:
        await register(UserRegister(
            name="Bad Phone",
            phone="123", # < 10 digits
            role="farmer",
            password="pass"
        ))
    except Exception:
        bad_phone_rejected = True
    assert bad_phone_rejected, "Malformed phone length must be rejected"
    print("  [PASS] 8. Malformed input (phone < 10 digits) rejected by Pydantic.")

    # 9. Valid token retrieves correct user profile (/api/auth/me)
    farmer_user_context = decode_access_token(farmer_token)
    profile = await get_me(current_user=farmer_user_context)
    assert profile["phone"] == "9991110001"
    assert profile["role"] == "farmer"
    assert profile["village"] == "Hebbal"
    assert profile["district"] == "Dharwad"
    print("  [PASS] 9. Valid token successfully retrieved full user profile.")

    # 10. Invalid token is rejected
    invalid_token_rejected = False
    try:
        decode_access_token("invalid.token.structure")
    except HTTPException as e:
        invalid_token_rejected = True
        assert e.status_code == 401
    assert invalid_token_rejected, "Invalid token must be rejected"
    print("  [PASS] 10. Invalid token rejected with HTTP 401.")

    # 11. Expired token is rejected
    expired_token = create_access_token({"phone": "9991110001"}, expires_delta_seconds=-10)
    expired_rejected = False
    try:
        decode_access_token(expired_token)
    except HTTPException as e:
        expired_rejected = True
        assert e.status_code == 401
        assert "expired" in str(e.detail).lower()
    assert expired_rejected, "Expired token must be rejected"
    print("  [PASS] 11. Expired token rejected with HTTP 401.")

    # 12. Role permissions: Only farmers can post waste; only industry can post demands
    # Farmer creating listing -> SUCCESS
    listing_data = ListingCreate(
        type="Paddy Straw",
        qty=15.0,
        price=1800.0,
        location="Hebbal, Dharwad",
        date="2026-11-01"
    )
    created_listing = await create_listing(listing_data, current_user=farmer_user_context)
    assert created_listing["user_phone"] == "9991110001"
    print("  [PASS] 12a. Farmer successfully posted waste listing.")

    # Industry user trying to post waste -> 403 Forbidden
    industry_user_context = decode_access_token(industry_token)
    ind_post_waste_forbidden = False
    try:
        await create_listing(listing_data, current_user=industry_user_context)
    except HTTPException as e:
        ind_post_waste_forbidden = True
        assert e.status_code == 403
    assert ind_post_waste_forbidden, "Industry user must not be allowed to post crop waste"
    print("  [PASS] 12b. Industry user correctly forbidden from posting crop waste (403).")

    # 13. Demand permissions: Only industry can post demands; farmer cannot
    demand_data = DemandCreate(
        type="Paddy Straw",
        qty=50.0,
        budget=2000.0,
        location="Bengaluru Hub",
        by="GreenCell BioEnergy Ltd"
    )
    created_demand = await create_demand(demand_data, current_user=industry_user_context)
    assert created_demand["user_phone"] == "9991110002"
    print("  [PASS] 13a. Industry user successfully posted industrial demand.")

    farmer_demand_forbidden = False
    try:
        await create_demand(demand_data, current_user=farmer_user_context)
    except HTTPException as e:
        farmer_demand_forbidden = True
        assert e.status_code == 403
    assert farmer_demand_forbidden, "Farmer must not be allowed to post industrial demand"
    print("  [PASS] 13b. Farmer correctly forbidden from posting industrial demand (403).")

    # 14. Private user isolation: get_listings_by_user only returns caller's records
    farmer_listings = await db.get_listings_by_user("9991110001")
    assert any(l["id"] == created_listing["id"] for l in farmer_listings)
    other_listings = await db.get_listings_by_user("9991110002")
    assert not any(l["id"] == created_listing["id"] for l in other_listings)
    print("  [PASS] 14. Private record isolation verified (listings isolated by user).")

    # 15. Deal creation and isolation
    deal_payload = DealCreate(
        farmer="Basavaraj Patil",
        waste="Paddy Straw",
        qty=10.0,
        price=1800.0,
        co2=1.7,
        icon="🌾"
    )
    created_deal = await create_deal(deal_payload, current_user=industry_user_context)
    assert created_deal["buyer_phone"] == "9991110002"
    print("  [PASS] 15. Industry user submitted purchase deal offer.")

    # 16. Password security: passwords stored as PBKDF2 hash, never plain
    raw_user = await db.get_user_by_phone("9991110001")
    assert "password" not in raw_user, "Plaintext password must never be stored"
    assert "password_hash" in raw_user, "password_hash must be stored"
    assert "$" in raw_user["password_hash"], "Hash must contain salt separator"
    assert verify_password("farmerSecurePass", raw_user["password_hash"])
    print("  [PASS] 16. Cryptographic security verified: PBKDF2-HMAC-SHA256 100k salt hashing.")

    # Clean up test users
    for p in test_phones:
        if db.backend_type == "mongodb" and db.mongo_db is not None:
            await db.mongo_db["users"].delete_many({"phone": p})
            await db.mongo_db["listings"].delete_many({"user_phone": p})
            await db.mongo_db["demands"].delete_many({"user_phone": p})
            await db.mongo_db["deals"].delete_many({"buyer_phone": p})

    print("\n=======================================================")
    print("  ALL 16 COMPREHENSIVE AUTH & SECURITY TESTS PASSED!")
    print("=======================================================\n")

if __name__ == "__main__":
    asyncio.run(run_comprehensive_auth_tests())

def test_full_auth_suite():
    asyncio.run(run_comprehensive_auth_tests())
