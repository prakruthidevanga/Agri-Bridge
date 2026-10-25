import os
import re
import time
from typing import List, Dict, Any, Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from gemini_service import call_gemini
from database import db
from auth import hash_password, verify_password, create_access_token, get_current_user

# Load environment variables from backend/.env using explicit absolute path
ENV_FILE_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_FILE_PATH)

app = FastAPI(
    title="AgriBridge AI Backend",
    version="1.1.0",
    description="FastAPI service connecting AgriBridge to Google Gemini, Database & Auth"
)

# Parse allowed CORS origins from environment variable
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://agri-bridge.netlify.app"
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins:
    origins = [orig.strip() for orig in env_origins.split(",") if orig.strip()]
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request size safeguard: max 50KB payload
MAX_CONTENT_LENGTH = 50 * 1024

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_CONTENT_LENGTH:
        return HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Request body too large. Maximum allowed size is 50KB."
        )
    return await call_next(request)

@app.on_event("startup")
async def startup_db():
    await db.init()

# ==========================================
# SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=10)
    role: str = Field(..., pattern="^(farmer|industry)$")
    password: str = Field(..., min_length=4)
    village: Optional[str] = Field(None, max_length=120)
    district: Optional[str] = Field(None, max_length=120)
    location: Optional[str] = Field(None, max_length=240)
    company: Optional[str] = Field(None, max_length=120)
    preferred_language: Optional[str] = Field("English", max_length=50)

class UserLogin(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)
    password: str = Field(..., min_length=4)
    role: Optional[str] = Field("farmer")

class ListingCreate(BaseModel):
    type: str = Field(..., min_length=1)
    qty: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    location: str = Field(..., min_length=1)
    date: str = Field(..., min_length=1)

class DemandCreate(BaseModel):
    type: str = Field(..., min_length=1)
    qty: float = Field(..., gt=0)
    budget: float = Field(..., gt=0)
    location: str = Field(..., min_length=1)
    by: str = Field(..., min_length=1)

class DealCreate(BaseModel):
    farmer: str = Field(..., min_length=1)
    waste: str = Field(..., min_length=1)
    qty: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    co2: Optional[float] = Field(1.0)
    icon: Optional[str] = Field("🌾")

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User's query")
    role: Optional[str] = Field("farmer", description="User role: farmer or industry")
    user_name: Optional[str] = Field("Farmer", description="Name of the user")
    location: Optional[str] = Field("India", description="User location or district")
    language: Optional[str] = Field("English", description="Target language (English, Hindi, etc.)")
    history: Optional[List[Dict[str, Any]]] = Field(default=[], description="Previous conversation turns")

# ==========================================
# HEALTH & CHAT
# ==========================================
@app.get("/api/health")
def health_check():
    api_key_configured = bool(os.getenv("GEMINI_API_KEY", "").strip())
    model_configured = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    return {
        "status": "ok",
        "service": "AgriBridge AI Backend",
        "database_backend": db.backend_type,
        "gemini_api_key_configured": api_key_configured,
        "gemini_model": model_configured
    }

def handle_chat_request(payload: ChatMessage):
    if not os.getenv("GEMINI_API_KEY", "").strip():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini API key is not configured on the backend server. Please set GEMINI_API_KEY in backend/.env"
        )
    try:
        reply = call_gemini(
            message=payload.message,
            role=payload.role or "farmer",
            user_name=payload.user_name or "Farmer",
            location=payload.location or "India",
            language=payload.language or "English",
            history=payload.history
        )
        return {"reply": reply}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(pe))
    except LookupError as le:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(le))
    except ResourceWarning as rw:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(rw))
    except TimeoutError as te:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=str(te))
    except ConnectionError as ce:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(ce))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI service error: {str(exc)}")

@app.post("/api/chat")
def chat_endpoint(payload: ChatMessage):
    return handle_chat_request(payload)

@app.post("/api/chat/")
def chat_endpoint_trailing_slash(payload: ChatMessage):
    return handle_chat_request(payload)

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================
@app.post("/api/auth/register")
async def register(payload: UserRegister):
    phone_clean = payload.phone.strip()
    if not re.match(r"^\d{10}$", phone_clean):
        raise HTTPException(status_code=400, detail="Phone must be exactly 10 digits")

    existing = await db.get_user_by_phone(phone_clean)
    if existing:
        raise HTTPException(status_code=400, detail="An account with this phone number already exists")

    village_clean = (payload.village or "").strip()
    district_clean = (payload.district or "").strip()
    location_clean = (payload.location or "").strip()
    company_clean = (payload.company or "").strip()

    if payload.role == "farmer":
        if village_clean and district_clean:
            resolved_location = f"{village_clean}, {district_clean}"
        elif location_clean:
            resolved_location = location_clean
        elif village_clean:
            resolved_location = village_clean
        else:
            resolved_location = ""
        if not resolved_location:
            raise HTTPException(status_code=400, detail="Village/District is required for farmers")
    else:
        resolved_location = company_clean or location_clean
        if not resolved_location:
            raise HTTPException(status_code=400, detail="Company name is required for industry")

    user_doc = {
        "phone": phone_clean,
        "name": payload.name.strip(),
        "role": payload.role,
        "location": resolved_location,
        "village": village_clean or (resolved_location.split(",")[0].strip() if payload.role == "farmer" else None),
        "district": district_clean or (resolved_location.split(",")[1].strip() if payload.role == "farmer" and "," in resolved_location else None),
        "company": company_clean if payload.role == "industry" else None,
        "preferred_language": (payload.preferred_language or "English").strip(),
        "password_hash": hash_password(payload.password),
        "created_at": int(time.time()),
        "earned": "₹0",
        "sold": "0 T",
        "co2": "0 T",
        "deals": "0",
        "sourced": "0 T",
        "saved": "₹0"
    }
    try:
        await db.create_user(user_doc)
    except Exception as exc:
        # Handle MongoDB duplicate key error code 11000 gracefully
        err_str = str(exc).lower()
        if "duplicate key" in err_str or "e11000" in err_str or "11000" in err_str:
            raise HTTPException(status_code=400, detail="An account with this phone number already exists")
        raise HTTPException(status_code=500, detail="Failed to register account")

    token = create_access_token({
        "phone": user_doc["phone"],
        "name": user_doc["name"],
        "role": user_doc["role"],
        "location": user_doc["location"],
        "preferred_language": user_doc.get("preferred_language", "English")
    })
    return {
        "token": token,
        "user": {
            "phone": user_doc["phone"],
            "name": user_doc["name"],
            "role": user_doc["role"],
            "location": user_doc["location"],
            "village": user_doc.get("village"),
            "district": user_doc.get("district"),
            "company": user_doc.get("company"),
            "preferred_language": user_doc.get("preferred_language", "English"),
            "earned": user_doc["earned"],
            "sold": user_doc["sold"],
            "co2": user_doc["co2"],
            "deals": user_doc["deals"],
            "sourced": user_doc["sourced"],
            "saved": user_doc["saved"]
        }
    }

@app.post("/api/auth/login")
async def login(payload: UserLogin):
    phone_clean = payload.phone.strip()
    user_doc = await db.get_user_by_phone(phone_clean)
    if not user_doc or not verify_password(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    token = create_access_token({
        "phone": user_doc["phone"],
        "name": user_doc["name"],
        "role": user_doc["role"],
        "location": user_doc["location"]
    })
    return {
        "token": token,
        "user": {
            "phone": user_doc["phone"],
            "name": user_doc["name"],
            "role": user_doc["role"],
            "location": user_doc["location"],
            "earned": user_doc.get("earned", "₹0"),
            "sold": user_doc.get("sold", "0 T"),
            "co2": user_doc.get("co2", "0 T"),
            "deals": user_doc.get("deals", "0"),
            "sourced": user_doc.get("sourced", "0 T"),
            "saved": user_doc.get("saved", "₹0")
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    user_doc = await db.get_user_by_phone(current_user["phone"])
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "phone": user_doc["phone"],
        "name": user_doc["name"],
        "role": user_doc["role"],
        "location": user_doc["location"],
        "village": user_doc.get("village"),
        "district": user_doc.get("district"),
        "company": user_doc.get("company"),
        "preferred_language": user_doc.get("preferred_language", "English"),
        "earned": user_doc.get("earned", "₹0"),
        "sold": user_doc.get("sold", "0 T"),
        "co2": user_doc.get("co2", "0 T"),
        "deals": user_doc.get("deals", "0"),
        "sourced": user_doc.get("sourced", "0 T"),
        "saved": user_doc.get("saved", "₹0")
    }

# ==========================================
# LISTINGS ENDPOINTS
# ==========================================
@app.get("/api/listings")
async def list_listings():
    return await db.get_all_listings()

@app.get("/api/listings/mine")
async def list_my_listings(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await db.get_listings_by_user(current_user["phone"])

@app.post("/api/listings")
async def create_listing(payload: ListingCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user.get("role") != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers are authorized to create crop waste listings")

    listing_id = int(time.time() * 1000)
    co2_factor = 1.7 if "paddy" in payload.type.lower() else 1.2

    icon_map = {
        "paddy straw": "🌾", "sugarcane bagasse": "🎋", "corn husk": "🌽",
        "cotton stalks": "🌿", "coconut husk": "🥥", "rice bran": "🍚",
        "banana stem/peel": "🍌", "groundnut shells": "🥜"
    }
    icon = icon_map.get(payload.type.lower(), "🌾")

    listing_doc = {
        "id": listing_id,
        "user_phone": current_user["phone"],
        "farmer": current_user["name"],
        "village": payload.location,
        "waste": payload.type,
        "qty": payload.qty,
        "price": payload.price,
        "date": payload.date,
        "icon": icon,
        "distance": 18,
        "rating": 4.8,
        "co2": co2_factor,
        "status": "available",
        "created_at": int(time.time())
    }
    await db.create_listing(listing_doc)
    return listing_doc

# ==========================================
# DEMANDS ENDPOINTS
# ==========================================
@app.get("/api/demands/mine")
async def list_my_demands(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await db.get_demands_by_user(current_user["phone"])

@app.post("/api/demands")
async def create_demand(payload: DemandCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user.get("role") != "industry":
        raise HTTPException(status_code=403, detail="Only industry users are authorized to post demands")

    demand_id = int(time.time() * 1000)
    demand_doc = {
        "id": demand_id,
        "user_phone": current_user["phone"],
        "company": current_user["name"],
        "type": payload.type,
        "qty": payload.qty,
        "budget": payload.budget,
        "location": payload.location,
        "by": payload.by,
        "status": "open",
        "created_at": int(time.time())
    }
    await db.create_demand(demand_doc)
    return demand_doc

# ==========================================
# DEALS ENDPOINTS
# ==========================================
@app.get("/api/deals/mine")
async def list_my_deals(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await db.get_deals_for_user(current_user["phone"], current_user.get("role", "farmer"))

@app.post("/api/deals")
async def create_deal(payload: DealCreate, current_user: Dict[str, Any] = Depends(get_current_user)):
    if current_user.get("role") != "industry":
        raise HTTPException(status_code=403, detail="Only industry users are authorized to submit purchase deal offers")

    deal_id = int(time.time() * 1000)
    deal_doc = {
        "id": deal_id,
        "buyer_phone": current_user["phone"],
        "buyer_company": current_user["name"],
        "farmer_name": payload.farmer,
        "waste": payload.waste,
        "qty": payload.qty,
        "price": payload.price,
        "status": "Pending",
        "co2": payload.co2 or 1.0,
        "icon": payload.icon or "🌾",
        "created_at": int(time.time())
    }
    await db.create_deal(deal_doc)
    return deal_doc


# RELOAD_TEST_NOW
