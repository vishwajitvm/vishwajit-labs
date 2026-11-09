"""Admin access for the /admin dashboard.

Sign-in is email + password. The account lives in MongoDB:

    admin_users     { _id: "<email>", password_hash: "pbkdf2_sha256$...", created_at, updated_at }
    admin_sessions  { _id: "<sha256 of session token>", email, created_at, expires_at }

The account is created (or its password updated) on startup from two server settings:
ADMIN_EMAIL (default: the public portfolio address) and ADMIN_PASSWORD. Only a salted
PBKDF2 hash is stored; once the account exists you can remove ADMIN_PASSWORD.

A successful login returns a random session token (valid 12 hours) that the dashboard
sends as `Authorization: Bearer <token>`. Two older options also still work:
an ADMIN_TOKEN setting, or a token hash in admin_settings {_id: "admin", token_sha256}.
"""
import asyncio
import base64
import hashlib
import hmac
import logging
import os
import re
import secrets
import time
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Header, HTTPException

from app.core.config import settings
from app.core.db import get_database

logger = logging.getLogger("uvicorn")

MIN_TOKEN_LENGTH = 24
MIN_PASSWORD_LENGTH = 12
PBKDF2_ITER = 600_000
SESSION_HOURS = 12
USERS, SESSIONS, SETTINGS = "admin_users", "admin_sessions", "admin_settings"
_HEX64 = re.compile(r"^[0-9a-f]{64}$")
_cache = {"until": 0.0, "hash": None}       # admin_settings token hash
_users_cache = {"until": 0.0, "any": False}  # does any admin account exist?
_attempts: dict = {}                          # login attempts per IP


# ---------------------------------------------------------------- hashing
def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITER)
    return f"pbkdf2_sha256${PBKDF2_ITER}${base64.b64encode(salt).decode()}${base64.b64encode(dk).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iterations, salt_b64, dk_b64 = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), base64.b64decode(salt_b64), int(iterations))
        return hmac.compare_digest(dk, base64.b64decode(dk_b64))
    except Exception:
        return False


# ---------------------------------------------------------------- account seeding
async def seed_admin_from_env() -> None:
    """Create or update the admin account from ADMIN_EMAIL / ADMIN_PASSWORD."""
    password = settings.ADMIN_PASSWORD or ""
    if not password:
        return
    if len(password) < MIN_PASSWORD_LENGTH:
        logger.error(f"ADMIN_PASSWORD is shorter than {MIN_PASSWORD_LENGTH} characters; admin account not created.")
        return
    db = get_database()
    if db is None:
        return
    email = settings.ADMIN_EMAIL.strip().lower()
    try:
        doc = await db[USERS].find_one({"_id": email})
        if doc and await asyncio.to_thread(verify_password, password, doc.get("password_hash", "")):
            return
        now = datetime.utcnow()
        await db[USERS].update_one(
            {"_id": email},
            {"$set": {"password_hash": await asyncio.to_thread(hash_password, password), "updated_at": now},
             "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        await db[SESSIONS].delete_many({"email": email})  # a new password signs out old sessions
        _users_cache.update(until=0.0)
        logger.info(f"Admin account ready for {email}")
    except Exception as e:
        logger.error(f"Could not create the admin account: {e.__class__.__name__}: {e}")


async def any_admin_user() -> bool:
    now = time.monotonic()
    if now < _users_cache["until"]:
        return _users_cache["any"]
    db = get_database()
    if db is None:
        return False
    try:
        found = await db[USERS].count_documents({}, limit=1) > 0
    except Exception:
        return False
    _users_cache.update(until=now + (60 if found else 10), any=found)
    return found


# ---------------------------------------------------------------- login / sessions
def _client_ip(forwarded: Optional[str], fallback: str) -> str:
    return (forwarded or fallback or "?").split(",")[0].strip()


def _too_many_attempts(ip: str) -> bool:
    now = time.monotonic()
    recent = [t for t in _attempts.get(ip, []) if now - t < 900]
    _attempts[ip] = recent
    return len(recent) >= 10


async def login(email: str, password: str, ip: str) -> dict:
    if _too_many_attempts(ip):
        raise HTTPException(status_code=429, detail="Too many sign-in attempts. Try again in 15 minutes.")
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="The database isn't connected.")
    email = email.strip().lower()
    try:
        user = await db[USERS].find_one({"_id": email})
        if user is None and settings.ADMIN_PASSWORD:
            await seed_admin_from_env()  # e.g. the database was asleep when the server started
            user = await db[USERS].find_one({"_id": email})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Database unavailable: {e.__class__.__name__}")

    ok = bool(user) and await asyncio.to_thread(verify_password, password, user.get("password_hash", ""))
    if not ok:
        _attempts.setdefault(ip, []).append(time.monotonic())
        if user is None and not await any_admin_user():
            raise HTTPException(status_code=503, detail="No admin account yet: set ADMIN_PASSWORD on the server.")
        await asyncio.sleep(0.6)
        raise HTTPException(status_code=401, detail="Wrong email or password.")

    _attempts.pop(ip, None)
    token = secrets.token_urlsafe(32)
    now = datetime.utcnow()
    await db[SESSIONS].delete_many({"expires_at": {"$lt": now}})
    await db[SESSIONS].insert_one({"_id": sha256_hex(token), "email": email, "created_at": now,
                                   "expires_at": now + timedelta(hours=SESSION_HOURS)})
    return {"token": token, "email": email, "expires_in": SESSION_HOURS * 3600}


async def logout(token: str) -> None:
    db = get_database()
    if db is not None and token:
        try:
            await db[SESSIONS].delete_one({"_id": sha256_hex(token)})
        except Exception:
            pass


# ---------------------------------------------------------------- the guard
async def stored_token_hash() -> Optional[str]:
    now = time.monotonic()
    if now < _cache["until"]:
        return _cache["hash"]
    db = get_database()
    if db is None:
        return None
    try:
        doc = await asyncio.wait_for(db[SETTINGS].find_one({"_id": "admin"}), timeout=8)
    except Exception as e:
        logger.warning(f"Could not read the admin token hash from MongoDB: {e.__class__.__name__}")
        return None
    value = str((doc or {}).get("token_sha256", "")).strip().lower()
    found = value if _HEX64.match(value) else None
    _cache.update(until=now + (60 if found else 10), hash=found)
    return found


def bearer(authorization: Optional[str]) -> str:
    if authorization and authorization[:7].lower() == "bearer ":
        return authorization[7:].strip()
    return ""


async def require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    supplied = bearer(authorization)

    env_token = settings.ADMIN_TOKEN or ""
    env_ok = len(env_token) >= MIN_TOKEN_LENGTH
    if env_ok and supplied and hmac.compare_digest(supplied.encode(), env_token.encode()):
        return

    if supplied:
        db = get_database()
        if db is not None:
            try:
                session = await db[SESSIONS].find_one({"_id": sha256_hex(supplied), "expires_at": {"$gt": datetime.utcnow()}})
                if session:
                    return
            except Exception:
                pass

    db_hash = await stored_token_hash()
    if db_hash and supplied and hmac.compare_digest(sha256_hex(supplied), db_hash):
        return

    if not (env_ok or db_hash or await any_admin_user()):
        raise HTTPException(status_code=503, detail="Admin access is not set up: set ADMIN_PASSWORD on the server.")
    await asyncio.sleep(0.5)
    raise HTTPException(status_code=401, detail="Not signed in", headers={"WWW-Authenticate": "Bearer"})
