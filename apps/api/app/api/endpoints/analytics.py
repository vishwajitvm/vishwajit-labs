from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from app.core.db import get_database

router = APIRouter()

class VisitorLog(BaseModel):
    url: str
    referrer: Optional[str] = None
    screen_resolution: Optional[str] = None
    language: Optional[str] = None

class DownloadLog(BaseModel):
    file_type: str  # e.g., "resume_pdf", "resume_html"
    source: Optional[str] = None  # e.g., "hero_button", "terminal"

@router.post("/log-visit")
async def log_visit(log: VisitorLog, request: Request, db = Depends(get_database)):
    if db is None:
        return {"status": "success", "info": "Local database skipped"}
        
    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    user_agent = request.headers.get("user-agent") or "unknown"
    
    visit_entry = {
        "url": log.url,
        "referrer": log.referrer,
        "screen_resolution": log.screen_resolution,
        "language": log.language,
        "ip_address": client_ip,
        "user_agent": user_agent,
        "visited_at": datetime.utcnow()
    }
    
    await db["visitors"].insert_one(visit_entry)
    return {"status": "success"}

@router.post("/log-download")
async def log_download(log: DownloadLog, request: Request, db = Depends(get_database)):
    if db is None:
        return {"status": "success", "info": "Local database skipped"}
        
    client_ip = request.headers.get("x-forwarded-for") or request.client.host
    
    download_entry = {
        "file_type": log.file_type,
        "source": log.source,
        "ip_address": client_ip,
        "downloaded_at": datetime.utcnow()
    }
    
    await db["downloads"].insert_one(download_entry)
    return {"status": "success"}

@router.get("/dashboard-stats")
async def get_dashboard_stats(db = Depends(get_database)):
    if db is None:
        # Return mock numbers for frontend preview
        return {
            "visitors_count": 842,
            "downloads_count": 126,
            "messages_count": 14,
            "chat_logs_count": 312,
            "recent_messages": [
                {"name": "Alice Recruiter", "email": "alice@hr.com", "message": "Hi, loved TraceNest! Let's talk.", "created_at": datetime.now() - timedelta(days=1)},
                {"name": "Bob Manager", "email": "bob@ai.dev", "message": "Are you open to contract platform roles?", "created_at": datetime.now() - timedelta(days=3)}
            ],
            "recent_visits": [
                {"url": "/", "visited_at": datetime.now() - timedelta(minutes=5), "ip_address": "127.0.0.1"},
                {"url": "/projects/tracenest", "visited_at": datetime.now() - timedelta(minutes=18), "ip_address": "192.168.1.1"}
            ]
        }
        
    try:
        # Real MongoDB aggregates
        visitors_count = await db["visitors"].count_documents({})
        downloads_count = await db["downloads"].count_documents({})
        messages_count = await db["messages"].count_documents({})
        chat_logs_count = await db["chat_logs"].count_documents({})
        
        # Recent contact messages
        recent_messages_cursor = db["messages"].find().sort("created_at", -1).limit(5)
        recent_messages = []
        async for msg in recent_messages_cursor:
            msg["_id"] = str(msg["_id"])
            recent_messages.append(msg)
            
        # Recent visitor log hits
        recent_visits_cursor = db["visitors"].find().sort("visited_at", -1).limit(10)
        recent_visits = []
        async for visit in recent_visits_cursor:
            visit["_id"] = str(visit["_id"])
            recent_visits.append(visit)
            
        return {
            "visitors_count": visitors_count,
            "downloads_count": downloads_count,
            "messages_count": messages_count,
            "chat_logs_count": chat_logs_count,
            "recent_messages": recent_messages,
            "recent_visits": recent_visits
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database aggregation failed: {str(e)}")
