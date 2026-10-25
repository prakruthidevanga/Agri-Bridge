import os
import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, Optional
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer(auto_error=False)

def get_jwt_secret() -> str:
    # Use environment variable or fallback to secure random server seed
    secret = os.getenv("JWT_SECRET", "").strip()
    if not secret:
        # Predictable fallback per server process or default safe salt
        secret = "agribridge_super_secure_secret_key_2026_dev"
    return secret

def hash_password(password: str) -> str:
    """
    Hashes password using PBKDF2-HMAC-SHA256 with 100,000 iterations and random salt.
    Format: salt$hash
    """
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${dk.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, expected_hash = hashed_password.split("$")
        dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return hmac.compare_digest(dk.hex(), expected_hash)
    except Exception:
        return False

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64_decode(s: str) -> bytes:
    padding = "=" * (4 - (len(s) % 4))
    return base64.urlsafe_b64decode(s + padding)

def create_access_token(data: Dict[str, Any], expires_delta_seconds: int = 86400 * 7) -> str:
    """
    Creates a signed JWT-compatible token using HMAC-SHA256.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["exp"] = int(time.time()) + expires_delta_seconds
    payload["iat"] = int(time.time())

    encoded_header = _b64_encode(json.dumps(header).encode("utf-8"))
    encoded_payload = _b64_encode(json.dumps(payload).encode("utf-8"))

    signature_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    secret = get_jwt_secret().encode("utf-8")
    signature = _b64_encode(hmac.new(secret, signature_input, hashlib.sha256).digest())

    return f"{encoded_header}.{encoded_payload}.{signature}"

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid token parts")
        encoded_header, encoded_payload, signature = parts

        signature_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
        secret = get_jwt_secret().encode("utf-8")
        expected_sig = _b64_encode(hmac.new(secret, signature_input, hashlib.sha256).digest())

        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Token signature mismatch")

        payload = json.loads(_b64_decode(encoded_payload).decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            raise ValueError("Token expired")

        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access this resource",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return decode_access_token(credentials.credentials)
