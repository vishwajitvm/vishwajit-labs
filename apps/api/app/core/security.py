"""Admin access: one secret token, sent as `Authorization: Bearer <token>`.

The token can be configured in either (or both) of two places:

1. MongoDB: a document in the `admin_settings` collection
       { "_id": "admin", "token_sha256": "<sha256 hex of the token>" }
   Only the hash is stored, so the database never holds the token itself.
   Make one with:  python scripts/make_admin_token.py
2. The ADMIN_TOKEN environment variable (24+ characters).

If neither is configured, admin endpoints stay locked for everyone.
"""
import asyncio
import hashlib
import hmac
import logging
import re
import time
from typing import Optional

from fastapi import Header, HTTPException

from app.core.config import settings
from app.core.db import get_database

logger = logging.getLogger("uvicorn")

MIN_TOKEN_LENGTH = 24
ADMIN_COLLECTION = "admin_settings"
ADMIN_DOC_ID = "admin"
_HEX64 = re.compile(r"^[0-9a-f]{64}$")

# Cache the stored hash briefly: found -> 60s, not found -> 10s (so a new document is picked up quickly).
_cache = {"until": 0.0, "hash": None}


def sha256_hex(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def stored_token_hash() -> Optional[str]:
    now = time.monotonic()
    if now < _cache["until"]:
        return _cache["hash"]
    db = get_database()
    if db is None:
        return None
    try:
        doc = await asyncio.wait_for(db[ADMIN_COLLECTION].find_one({"_id": ADMIN_DOC_ID}), timeout=8)
    except Exception as e:  # database down: don't cache, try again next request
        logger.warning(f"Could not read the admin token hash from MongoDB: {e.__class__.__name__}")
        return None
    value = str((doc or {}).get("token_sha256", "")).strip().lower()
    found = value if _HEX64.match(value) else None
    if doc and not found:
        logger.error(f"{ADMIN_COLLECTION}/{ADMIN_DOC_ID} exists but token_sha256 is not a 64-character SHA-256 hex string.")
    _cache.update(until=now + (60 if found else 10), hash=found)
    return found


async def require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    supplied = ""
    if authorization and authorization[:7].lower() == "bearer ":
        supplied = authorization[7:].strip()

    env_token = settings.ADMIN_TOKEN or ""
    env_ok = len(env_token) >= MIN_TOKEN_LENGTH
    if env_ok and supplied and hmac.compare_digest(supplied.encode(), env_token.encode()):
        return

    db_hash = await stored_token_hash()
    if db_hash and supplied and hmac.compare_digest(sha256_hex(supplied), db_hash):
        return

    if not env_ok and not db_hash:
        raise HTTPException(
            status_code=503,
            detail=(f"Admin access is not set up. Add the token's SHA-256 to MongoDB "
                    f"({ADMIN_COLLECTION} → _id \"{ADMIN_DOC_ID}\" → token_sha256), or set ADMIN_TOKEN on the server."),
        )
    await asyncio.sleep(0.5)  # slow down guessing
    raise HTTPException(status_code=401, detail="Invalid admin token", headers={"WWW-Authenticate": "Bearer"})
