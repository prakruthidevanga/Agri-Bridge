import os
import json
import time
import asyncio
from pathlib import Path
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

# Ensure backend/.env is loaded before database initialization
ENV_FILE_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_FILE_PATH)

# Path for reliable document persistence
DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_FILE = DATA_DIR / "storage.json"

_lock = asyncio.Lock()

def _get_empty_store() -> Dict[str, Any]:
    return {
        "users": {},      # phone -> user_dict
        "listings": {},   # id -> listing_dict
        "demands": {},    # id -> demand_dict
        "deals": {}       # id -> deal_dict
    }

def _load_sync() -> Dict[str, Any]:
    if not DB_FILE.exists():
        initial = _get_empty_store()
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(initial, f, indent=2)
        return initial
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return _get_empty_store()

def _save_sync(data: Dict[str, Any]):
    # Unique temp filename to prevent OneDrive / Windows lock collisions across rapid writes
    temp_file = DATA_DIR / f"storage_{int(time.time() * 1000000)}.tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Retry loop for Windows / OneDrive transient access locks
    for attempt in range(5):
        try:
            temp_file.replace(DB_FILE)
            return
        except (PermissionError, OSError):
            if attempt == 4:
                # Direct write fallback if atomic replace is locked by OneDrive sync
                try:
                    with open(DB_FILE, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    if temp_file.exists():
                        temp_file.unlink(missing_ok=True)
                    return
                except Exception:
                    pass
            time.sleep(0.05)

def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Safely sanitizes MongoDB document dictionary:
    - Removes internal MongoDB '_id' (or converts to string if needed)
    - Preserves stable application-level 'id', 'phone', etc.
    """
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        # Keep MongoDB string representation if application id is missing, otherwise drop _id
        if "id" not in d:
            d["id"] = str(d["_id"])
        d.pop("_id", None)
    return d

def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_doc(d) for d in docs if d is not None]

class Database:
    """
    Asynchronous document repository supporting atomic file persistence
    with seamless integration ready for MongoDB / Motor when MONGODB_URI is provided.
    """
    def __init__(self):
        self.backend_type = "json"  # "json" or "mongodb"
        self.mongo_client = None
        self.mongo_db = None
        self._memory = _load_sync()

    async def init(self):
        mongo_uri = os.getenv("MONGODB_URI", "").strip()
        if not mongo_uri:
            # Explicit intentional development mode
            self.backend_type = "json"
            print("[Database] MONGODB_URI is not set. Operating in intentional local JSON storage mode.")
            return

        # When MONGODB_URI is configured, MongoDB connection is mandatory (no silent fallback)
        try:
            import motor.motor_asyncio
        except ImportError as e:
            self.backend_type = "error"
            err_msg = (
                "[Database] Critical Error: MONGODB_URI is set, but 'motor' driver is not installed. "
                "Please run 'pip install motor pymongo dnspython' to enable MongoDB Atlas support."
            )
            print(err_msg)
            raise RuntimeError(err_msg) from e

        try:
            # Mask credentials safely for logging
            masked_uri = mongo_uri
            if "@" in mongo_uri and "://" in mongo_uri:
                prefix = mongo_uri.split("://")[0]
                rest = mongo_uri.split("@", 1)[1]
                masked_uri = f"{prefix}://<credentials-hidden>@{rest}"
            print(f"[Database] Connecting to MongoDB ({masked_uri})...")

            self.mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
                mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            self.mongo_db = self.mongo_client.get_default_database("agribridge")

            # Observable ping check
            await self.mongo_db.command("ping")

            # Setup indexes
            await self._ensure_indexes()

            self.backend_type = "mongodb"
            print("[Database] Connected to MongoDB successfully.")
        except Exception as e:
            self.backend_type = "error"
            self.mongo_client = None
            self.mongo_db = None
            sanitized_err = str(e)
            if "@" in sanitized_err:
                sanitized_err = sanitized_err.split("@")[-1]
            err_msg = f"[Database] Failed to connect to configured MongoDB: {sanitized_err}"
            print(err_msg)
            # Do NOT silently fall back when URI was explicitly configured
            raise RuntimeError(err_msg) from e

    async def _ensure_indexes(self):
        if self.mongo_db is None:
            return
        # Unique normalized phone number index for users
        await self.mongo_db.users.create_index("phone", unique=True)
        # Application ID indexes
        await self.mongo_db.listings.create_index("id", unique=True)
        await self.mongo_db.listings.create_index("user_phone")
        await self.mongo_db.listings.create_index("status")
        await self.mongo_db.demands.create_index("id", unique=True)
        await self.mongo_db.demands.create_index("user_phone")
        await self.mongo_db.deals.create_index("id", unique=True)
        await self.mongo_db.deals.create_index("buyer_phone")
        await self.mongo_db.deals.create_index("farmer_phone")

    # --- USER OPERATIONS ---
    async def get_user_by_phone(self, phone: str) -> Optional[Dict[str, Any]]:
        norm_phone = phone.strip()
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            doc = await self.mongo_db.users.find_one({"phone": norm_phone})
            return serialize_doc(doc)
        async with _lock:
            return serialize_doc(self._memory["users"].get(norm_phone))

    async def create_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        norm_phone = user_dict["phone"].strip()
        doc = dict(user_dict)
        doc["phone"] = norm_phone
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            # Clean duplicate _id if present in incoming dict
            doc.pop("_id", None)
            await self.mongo_db.users.insert_one(doc)
            return serialize_doc(doc)
        async with _lock:
            self._memory["users"][norm_phone] = doc
            _save_sync(self._memory)
            return serialize_doc(doc)

    # --- LISTING OPERATIONS ---
    async def create_listing(self, listing: Dict[str, Any]) -> Dict[str, Any]:
        doc = dict(listing)
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            doc.pop("_id", None)
            await self.mongo_db.listings.insert_one(doc)
            return serialize_doc(doc)
        async with _lock:
            self._memory["listings"][str(doc["id"])] = doc
            _save_sync(self._memory)
            return serialize_doc(doc)

    async def get_all_listings(self) -> List[Dict[str, Any]]:
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            cursor = self.mongo_db.listings.find({"status": "available"})
            docs = await cursor.to_list(length=500)
            return serialize_docs(docs)
        async with _lock:
            return serialize_docs(list(self._memory["listings"].values()))

    async def get_listings_by_user(self, user_phone: str) -> List[Dict[str, Any]]:
        norm_phone = user_phone.strip()
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            cursor = self.mongo_db.listings.find({"user_phone": norm_phone})
            docs = await cursor.to_list(length=500)
            return serialize_docs(docs)
        async with _lock:
            return serialize_docs([l for l in self._memory["listings"].values() if l.get("user_phone") == norm_phone])

    async def get_listing_by_id(self, listing_id: Any) -> Optional[Dict[str, Any]]:
        str_id = str(listing_id)
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            doc = await self.mongo_db.listings.find_one({"$or": [{"id": listing_id}, {"id": str_id}, {"id": int(listing_id) if str_id.isdigit() else -1}]})
            return serialize_doc(doc)
        async with _lock:
            return serialize_doc(self._memory["listings"].get(str_id))

    # --- DEMAND OPERATIONS ---
    async def create_demand(self, demand: Dict[str, Any]) -> Dict[str, Any]:
        doc = dict(demand)
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            doc.pop("_id", None)
            await self.mongo_db.demands.insert_one(doc)
            return serialize_doc(doc)
        async with _lock:
            self._memory["demands"][str(doc["id"])] = doc
            _save_sync(self._memory)
            return serialize_doc(doc)

    async def get_demands_by_user(self, user_phone: str) -> List[Dict[str, Any]]:
        norm_phone = user_phone.strip()
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            cursor = self.mongo_db.demands.find({"user_phone": norm_phone})
            docs = await cursor.to_list(length=500)
            return serialize_docs(docs)
        async with _lock:
            return serialize_docs([d for d in self._memory["demands"].values() if d.get("user_phone") == norm_phone])

    # --- DEAL OPERATIONS ---
    async def create_deal(self, deal: Dict[str, Any]) -> Dict[str, Any]:
        doc = dict(deal)
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            doc.pop("_id", None)
            await self.mongo_db.deals.insert_one(doc)
            return serialize_doc(doc)
        async with _lock:
            self._memory["deals"][str(doc["id"])] = doc
            _save_sync(self._memory)
            return serialize_doc(doc)

    async def get_deals_for_user(self, user_phone: str, role: str) -> List[Dict[str, Any]]:
        norm_phone = user_phone.strip()
        if self.backend_type == "mongodb" and self.mongo_db is not None:
            query = {"buyer_phone": norm_phone} if role == "industry" else {"farmer_phone": norm_phone}
            cursor = self.mongo_db.deals.find(query)
            docs = await cursor.to_list(length=500)
            return serialize_docs(docs)
        async with _lock:
            if role == "industry":
                return serialize_docs([d for d in self._memory["deals"].values() if d.get("buyer_phone") == norm_phone])
            else:
                return serialize_docs([d for d in self._memory["deals"].values() if d.get("farmer_phone") == norm_phone])

db = Database()
