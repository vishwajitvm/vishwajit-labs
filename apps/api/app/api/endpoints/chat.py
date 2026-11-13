import asyncio
import json
import logging
from typing import AsyncIterator, List, Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.config import settings
from app.services.knowledge_base import find_project, get_kb_context, load_kb

router = APIRouter()
logger = logging.getLogger("uvicorn")

MAX_MESSAGE = 2000   # characters per message
MAX_HISTORY = 12     # earlier turns sent to the model


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None


SYSTEM_INSTRUCTION = f"""You are the AI assistant on the portfolio website of Vishwajit VM, a backend & AI engineer.
Visitors are recruiters, hiring managers, founders and engineers. Answer questions about his experience,
projects, skills and availability.

Rules:
- Use only the facts in the knowledge base below. Never invent employers, numbers, dates, clients or links.
- If something isn't covered (salary, education, personal life, anything else), say you don't have that detail
  and suggest emailing him at vishwajitmall50@gmail.com.
- Talk about him in the third person ("Vishwajit built…"). Be warm, direct and specific.
- Keep answers short: 2–5 sentences, or a few short lines for lists. Plain text only: no markdown,
  no asterisks, no headings, no tables.
- When it helps, point to the project's link or suggest opening the project card on the page.
- For hiring or freelance questions, mention he is open to freelance, contract and full-time work and how to reach him.
- If asked about something unrelated to Vishwajit or software, politely steer back.

KNOWLEDGE BASE
{get_kb_context()}
"""


def sse(text: str) -> str:
    """One Server-Sent Event. JSON-encoding keeps spaces and newlines intact."""
    return f"data: {json.dumps(text, ensure_ascii=False)}\n\n"


DONE = "data: [DONE]\n\n"


def offline_answer(message: str) -> str:
    """Answer from the knowledge base without a model (no GEMINI_API_KEY, or the model is down)."""
    kb = load_kb()
    p = kb["profile"]
    pr = find_project(message)
    if pr:
        link = next(iter((pr.get("links") or {}).values()), None)
        return pr["overview"] + (f" More: {link}" if link else " Open its card in the projects section for the full case study.")
    m = message.lower()
    if p.get("open_source") and any(w in m for w in ("npm", "open source", "open-source", "package", "library", "organisation", "organization")):
        return f"{p['open_source']} npm: {p['links'].get('npm', '')} · GitHub: {p['links'].get('open_source_org', '')}"
    if any(w in m for w in ("hire", "freelance", "contract", "available", "availability", "rate", "job")):
        return f"{p['availability']} {p['contact']}"
    if any(w in m for w in ("stack", "skill", "tech", "tools", "language")):
        top = [f"{s['area']}: {', '.join(s['tools'][:6])}" for s in kb["skills"]]
        return "Vishwajit's toolbox, by area. " + " · ".join(top)
    if any(w in m for w in ("resume", "résumé", "cv")):
        return p["resumes"]
    if any(w in m for w in ("experience", "work", "job", "company", "career", "where")):
        jobs = "; ".join(f"{j['role']} at {j['org']} ({j['years']})" for j in kb["jobs"])
        return f"{p['summary']} Career so far: {jobs}."
    names = ", ".join(x["name"] for x in kb["projects"][:6])
    return (f"{p['name']} is a {p['title']} in New Delhi with {p['experience']} of experience. {p['summary']} "
            f"Ask me about projects like {names}, his stack, or his availability.")


async def stream_offline(message: str) -> AsyncIterator[str]:
    words = offline_answer(message).split(" ")
    for i, word in enumerate(words):
        yield sse(word + (" " if i < len(words) - 1 else ""))
        await asyncio.sleep(0.025)
    yield DONE


def build_contents(req: ChatRequest) -> list:
    contents = []
    for item in (req.history or [])[-MAX_HISTORY:]:
        text = str(item.get("content", ""))[:MAX_MESSAGE].strip()
        if not text:
            continue
        role = "user" if item.get("role") == "user" else "model"
        contents.append({"role": role, "parts": [{"text": text}]})
    # The conversation must start with a user turn: drop a leading greeting from the assistant.
    while contents and contents[0]["role"] == "model":
        contents.pop(0)
    contents.append({"role": "user", "parts": [{"text": req.message[:MAX_MESSAGE]}]})
    return contents


async def stream_gemini(req: ChatRequest) -> AsyncIterator[str]:
    from google import genai
    from google.genai import types

    sent_any = False
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        stream = await client.aio.models.generate_content_stream(
            model=settings.GEMINI_MODEL,
            contents=build_contents(req),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_output_tokens=600,
            ),
        )
        async for chunk in stream:
            if chunk.text:
                sent_any = True
                yield sse(chunk.text)
    except Exception as e:  # never show raw provider errors to visitors
        logger.error(f"Gemini chat failed ({settings.GEMINI_MODEL}): {e}")
        if not sent_any:
            async for part in stream_offline(req.message):
                yield part
            return
    yield DONE


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    headers = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    if not request.message.strip():
        return StreamingResponse(stream_offline("hello"), media_type="text/event-stream", headers=headers)
    source = stream_gemini(request) if settings.GEMINI_API_KEY else stream_offline(request.message)
    return StreamingResponse(source, media_type="text/event-stream", headers=headers)
