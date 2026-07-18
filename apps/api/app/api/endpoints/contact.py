from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import httpx
from app.core.db import get_database
from app.core.config import settings

router = APIRouter()

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str
    company: Optional[str] = None
    job: Optional[str] = None
    budget: Optional[str] = None
    resume_url: Optional[str] = None

async def send_email_via_resend(form: ContactForm):
    if not settings.RESEND_API_KEY:
        return False
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    email_content = f"""
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> {form.name}</p>
    <p><strong>Email:</strong> {form.email}</p>
    <p><strong>Company:</strong> {form.company or 'N/A'}</p>
    <p><strong>Job Interest:</strong> {form.job or 'N/A'}</p>
    <p><strong>Budget:</strong> {form.budget or 'N/A'}</p>
    <p><strong>Resume Link:</strong> {form.resume_url or 'None Uploaded'}</p>
    <br/>
    <p><strong>Message:</strong></p>
    <p>{form.message}</p>
    """
    
    data = {
        "from": "Vishwajit Labs <onboarding@resend.dev>",
        "to": settings.CONTACT_EMAIL_TO,
        "subject": f"New Portfolio Message from {form.name}",
        "html": email_content
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data, headers=headers)
        return response.status_code == 200

@router.post("")
@router.post("/")
async def create_contact(form: ContactForm, db = Depends(get_database)):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    
    # Store message in Mongo
    message_data = form.dict()
    message_data["created_at"] = datetime.utcnow()
    message_data["replied"] = False
    
    result = await db["messages"].insert_one(message_data)
    
    # Send email notification
    email_sent = await send_email_via_resend(form)
    
    return {
        "status": "success",
        "message_id": str(result.inserted_id),
        "email_sent": email_sent
    }
