from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import os
from typing import List, Optional
import google.generativeai as genai
from app.services.knowledge_base import get_kb_context, VISHWAJIT_KB
from app.core.config import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

SYSTEM_INSTRUCTION = f"""
You are VISH AI, a specialized AI assistant embedded in the engineering portfolio of Vishwajit (Vishwajit Labs).
Your purpose is to answer questions about Vishwajit's experience, technical skills, projects, future ideas, and system architecture.

Adopt a professional, engineering-focused tone. Speak clearly, concisely, and with technical depth. Recruiters and engineering managers are speaking to you.
Do not make up information. Only use the facts provided in the knowledge base below.
If asked about topics outside of Vishwajit or software engineering, politely redirect the conversation back to Vishwajit's portfolio.

Knowledge Base:
{get_kb_context()}
"""

def generate_mock_stream(message: str):
    # Simple rule-based mock matching the knowledge base if Gemini Key is absent
    message_lc = message.lower()
    response_text = ""
    
    if "tracenest" in message_lc:
        response_text = (
            "TraceNest is a distributed tracing SDK and dashboard for FastAPI & Microservices. "
            "It intercepts requests, generates unique trace IDs, and pushes telemetry events "
            "asynchronously to ClickHouse. The main engineering challenge was handling heavy traffic "
            "without clogging the event loops, which Vishwajit solved with a memory-buffered background drain worker."
        )
    elif "tenantmind" in message_lc or "rag" in message_lc:
        response_text = (
            "TenantMind AI is a multi-tenant RAG platform. It uses LangChain, Redis, Pinecone, and Gemini. "
            "It isolates customer records via JWT-scoped namespace partitions in Pinecone and MongoDB. "
            "This setup ensures no tenant's search vectors leak into another tenant's query context."
        )
    elif "policybot" in message_lc or "agent" in message_lc:
        response_text = (
            "PolicyBot is a compliance-checking AI Agent utilizing the Model Context Protocol (MCP). "
            "It accesses file structures directly to review code changes against predefined compliance standards, "
            "utilizing Git diff pre-filtering to optimize token usage."
        )
    elif "tallyko" in message_lc or "golang" in message_lc:
        response_text = (
            "Tallyko is a transaction ledger broker built in Go using gRPC. "
            "It implements thread-safe balance operations, resolved via Redis distributed locks, "
            "preventing double-spend concurrency hazards."
        )
    elif "skills" in message_lc or "tech stack" in message_lc:
        response_text = (
            "Vishwajit's primary stack includes Python, FastAPI, Go, Docker, MongoDB Atlas, Redis, "
            "LangChain, Vector Databases, and MCP (Model Context Protocol). On the frontend, he uses "
            "Next.js 15, React 19, TypeScript, Framer Motion, and Three.js."
        )
    elif "resume" in message_lc:
        response_text = (
            "You can download Vishwajit's resume using the 'Download Resume' button on the homepage, "
            "or type 'resume' inside the system terminal interface to fetch it directly."
        )
    else:
        response_text = (
            "Hi, I'm VISH AI. I can tell you about Vishwajit's background. "
            "He is a Python Backend and AI Engineer specializing in RAG, Agents, and Platform systems. "
            "Try asking me about his projects like 'TraceNest', 'TenantMind AI', 'PolicyBot', or his stack!"
        )
        
    async def event_generator():
        # Yield the response token by token to simulate streaming
        words = response_text.split(" ")
        for i, word in enumerate(words):
            yield f"data: {word + (' ' if i < len(words) - 1 else '')}\n\n"
            await asyncio.sleep(0.04)
        yield "data: [DONE]\n\n"
        
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    if not settings.GEMINI_API_KEY:
        return generate_mock_stream(request.message)
        
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=SYSTEM_INSTRUCTION
        )
        
        # Build history if provided
        contents = []
        if request.history:
            for item in request.history:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [item.get("content", "")]})
        
        contents.append({"role": "user", "parts": [request.message]})
        
        async def event_generator():
            try:
                response = model.generate_content(contents, stream=True)
                for chunk in response:
                    if chunk.text:
                        # Format as SSE
                        yield f"data: {chunk.text}\n\n"
                        await asyncio.sleep(0.01)
                yield "data: [DONE]\n\n"
            except Exception as e:
                yield f"data: Error: {str(e)}\n\n"
                yield "data: [DONE]\n\n"
                
        return StreamingResponse(event_generator(), media_type="text/event-stream")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API failure: {str(e)}")
