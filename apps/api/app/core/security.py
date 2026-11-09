"""Admin access: a single secret token set on the server as ADMIN_TOKEN.

Admin endpoints take `Depends(require_admin)`. Requests must send
`Authorization: Bearer <ADMIN_TOKEN>`. If ADMIN_TOKEN isn't set (or is too short),
admin endpoints stay locked for everyone.
"""
import asyncio
import hmac
from typing import Optional

from fastapi import Header, HTTPException

from app.core.config import settings

MIN_TOKEN_LENGTH = 24


async def require_admin(authorization: Optional[str] = Header(default=None)) -> None:
    expected = settings.ADMIN_TOKEN or ""
    if len(expected) < MIN_TOKEN_LENGTH:
        raise HTTPException(
            status_code=503,
            detail=f"Admin access is not set up. Set ADMIN_TOKEN ({MIN_TOKEN_LENGTH}+ random characters) on the server.",
        )
    supplied = ""
    if authorization and authorization[:7].lower() == "bearer ":
        supplied = authorization[7:].strip()
    if not hmac.compare_digest(supplied.encode(), expected.encode()):
        await asyncio.sleep(0.5)  # slow down guessing
        raise HTTPException(status_code=401, detail="Invalid admin token", headers={"WWW-Authenticate": "Bearer"})
