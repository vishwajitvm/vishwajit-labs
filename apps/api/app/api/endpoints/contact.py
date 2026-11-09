import html
import logging
from datetime import datetime
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.core.config import settings
from app.core.db import safe_insert

router = APIRouter()
logger = logging.getLogger("uvicorn")


class ContactForm(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)
    company: Optional[str] = Field(default=None, max_length=160)
    job: Optional[str] = Field(default=None, max_length=160)
    budget: Optional[str] = Field(default=None, max_length=60)
    resume_url: Optional[str] = Field(default=None, max_length=500)


async def send_email_via_resend(form: ContactForm) -> bool:
    if not settings.RESEND_API_KEY:
        return False
    e = lambda v: html.escape(v or "N/A")  # visitor input must never become HTML in the inbox
    body = f"""
    <h3>New message from your portfolio</h3>
    <p><strong>Name:</strong> {e(form.name)}</p>
    <p><strong>Email:</strong> {e(str(form.email))}</p>
    <p><strong>Company:</strong> {e(form.company)}</p>
    <p><strong>Role / job:</strong> {e(form.job)}</p>
    <p><strong>Budget:</strong> {e(form.budget)}</p>
    <p><strong>Résumé link:</strong> {e(form.resume_url)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">{e(form.message)}</p>
    """
    data = {
        "from": settings.CONTACT_EMAIL_FROM,
        "to": [settings.CONTACT_EMAIL_TO],
        "reply_to": str(form.email),  # hitting Reply answers the visitor directly
        "subject": f"Portfolio message from {form.name}",
        "html": body,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                json=data,
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            )
        if r.status_code >= 300:
            logger.error(f"Resend rejected the contact email: {r.status_code} {r.text[:300]}")
        return r.status_code < 300
    except Exception as ex:
        logger.error(f"Resend request failed: {ex}")
        return False


@router.post("")
@router.post("/")
async def create_contact(form: ContactForm):
    """Store the message and email it. Succeeds if either works, so one outage never loses a message."""
    doc = form.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["replied"] = False

    message_id = await safe_insert("messages", doc)
    email_sent = await send_email_via_resend(form)

    if not message_id and not email_sent:
        logger.error("Contact message could not be stored or emailed (database and email both unavailable).")
        raise HTTPException(status_code=503, detail="Message service unavailable. Please email vishwajitmall50@gmail.com directly.")

    return {"status": "success", "stored": bool(message_id), "message_id": message_id, "email_sent": email_sent}
