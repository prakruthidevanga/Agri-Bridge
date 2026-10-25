import pytest
import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Setup path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from main import app
from database import db

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "gemini_model" in data

def test_auth_registration_and_login():
    phone = "9999888801"
    # Registration
    reg_payload = {
        "name": "Ramesh Kumar",
        "phone": phone,
        "role": "farmer",
        "village": "Thanjavur, Tamil Nadu",
        "password": "pass1234farmer"
    }
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code in [200, 400]  # 400 if already created in earlier run

    # Login
    login_payload = {
        "phone": phone,
        "password": "pass1234farmer",
        "role": "farmer"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    token = res_login.json()["token"]
    assert len(token) > 20

    # /api/auth/me
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Ramesh Kumar"

def test_role_authorization_and_listings():
    # 1. Register a farmer
    f_phone = "9999888802"
    client.post("/api/auth/register", json={
        "name": "Murugan",
        "phone": f_phone,
        "role": "farmer",
        "village": "Erode",
        "password": "pass1234farmer"
    })
    res_f = client.post("/api/auth/login", json={"phone": f_phone, "password": "pass1234farmer"})
    f_token = res_f.json()["token"]

    # 2. Register an industry user
    i_phone = "9999888803"
    client.post("/api/auth/register", json={
        "name": "BioGreen Power Ltd",
        "phone": i_phone,
        "role": "industry",
        "company": "Coimbatore",
        "password": "pass1234industry"
    })
    res_i = client.post("/api/auth/login", json={"phone": i_phone, "password": "pass1234industry"})
    i_token = res_i.json()["token"]

    # 3. Farmer creates a listing
    listing_data = {
        "type": "Paddy Straw",
        "qty": 15,
        "price": 2200,
        "location": "Erode, TN",
        "date": "2026-11-01"
    }
    res_l = client.post("/api/listings", json=listing_data, headers={"Authorization": f"Bearer {f_token}"})
    assert res_l.status_code == 200
    created = res_l.json()
    assert created["waste"] == "Paddy Straw"

    # 4. Industry user cannot create listing (403 forbidden)
    res_err = client.post("/api/listings", json=listing_data, headers={"Authorization": f"Bearer {i_token}"})
    assert res_err.status_code == 403

    # 5. Farmer cannot create industry demand (403 forbidden)
    demand_data = {
        "type": "Paddy Straw",
        "qty": 50,
        "budget": 2000,
        "location": "Coimbatore",
        "by": "2026-11-15"
    }
    res_d_err = client.post("/api/demands", json=demand_data, headers={"Authorization": f"Bearer {f_token}"})
    assert res_d_err.status_code == 403

    # 6. Industry user creates demand
    res_d = client.post("/api/demands", json=demand_data, headers={"Authorization": f"Bearer {i_token}"})
    assert res_d.status_code == 200

    # 7. Industry user sends deal
    deal_data = {
        "farmer": "Murugan",
        "waste": "Paddy Straw",
        "qty": 10,
        "price": 2200
    }
    res_deal = client.post("/api/deals", json=deal_data, headers={"Authorization": f"Bearer {i_token}"})
    assert res_deal.status_code == 200
