from typing import Optional

from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel, Field

from app.core import security

router = APIRouter()


class LoginBody(BaseModel):
    email: str = Field(min_length=3, max_length=200)
    password: str = Field(min_length=1, max_length=200)


@router.post("/login")
async def login(body: LoginBody, request: Request):
    ip = security._client_ip(request.headers.get("x-forwarded-for"), request.client.host if request.client else "")
    return await security.login(body.email, body.password, ip)


@router.post("/logout")
async def logout(authorization: Optional[str] = Header(default=None)):
    await security.logout(security.bearer(authorization))
    return {"ok": True}


@router.post("/verify", dependencies=[Depends(security.require_admin)])
async def verify():
    return {"admin": True}
