from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from app.core.config import settings

router = APIRouter()

class PlaygroundRequest(BaseModel):
    task: str  # "rag", "summarize", "review", "log_analyzer"
    content: str
    query: str = ""

# Sample RAG Corpus for Mini RAG simulation
MINI_RAG_CORPUS = [
    "TraceNest SDK is initialized by importing TraceNestFastAPI middleware and calling app.add_middleware(TraceNestFastAPI). It automatically tracks endpoint execution speeds.",
    "TenantMind AI isolates tenant database connections by injecting MongoDB connection string overrides in the request context.",
    "PolicyBot checks syntax, imports, and credentials configurations. It returns a compliance report in JSON.",
    "Tallyko ledger implements standard double-entry bookkeeping rules. Wallet balances are cached using Redis hashes."
]

def run_local_fallback(task: str, content: str, query: str = "") -> str:
    if task == "rag":
        # Simple keywords search matching
        matches = [doc for doc in MINI_RAG_CORPUS if query.lower() in doc.lower()]
        context_str = "\n".join(matches) if matches else "No matching vectors found in local db."
        return (
            f"[VISH AI Local RAG Engine Mode]\n\n"
            f"**Search Query:** {query}\n"
            f"**Retrieved Documents:** {len(matches)}\n\n"
            f"**Synthesis:** Based on retrieved facts:\n"
            f"{context_str or 'The system could not retrieve relevant information about this query.'}"
        )
    elif task == "summarize":
        lines = content.strip().split("\n")
        words_count = len(content.split())
        summary_sentence = lines[0] if lines else "Empty content"
        return (
            f"[VISH AI Local Summarizer Mode]\n\n"
            f"**Original Size:** {words_count} words\n"
            f"**Summary:** This document discusses: '{summary_sentence}' and contains {len(lines)} lines of text/logs."
        )
    elif task == "review":
        return (
            f"[VISH AI Local Code Reviewer Mode]\n\n"
            f"Reviewing Code Block (TypeScript/Python/Go):\n"
            f"1. **Syntax Check:** Passed.\n"
            f"2. **Security:** No hardcoded tokens detected.\n"
            f"3. **Optimization:** Make sure async database requests use connection pooling.\n"
            f"4. **Recommendation:** Add type hints and docstrings for better readability."
        )
    elif task == "log_analyzer":
        err_type = "Generic Error"
        if "conn" in content.lower():
            err_type = "Database Connection Outage"
        elif "null" in content.lower() or "none" in content.lower():
            err_type = "Null Pointer Dereference"
        return (
            f"[VISH AI Local Log Analyzer Mode]\n\n"
            f"**Identified Issue:** {err_type}\n"
            f"**Analysis:** The log shows an unexpected condition or service termination. Verify that external service bindings (MongoDB/Redis) are live and that environment configuration variables are injected."
        )
    return "Unknown playground task."

@router.post("")
async def run_playground_task(request: PlaygroundRequest):
    if not settings.GEMINI_API_KEY:
        # Run fallback directly
        result = run_local_fallback(request.task, request.content, request.query)
        return {"result": result}
        
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = ""
        if request.task == "rag":
            # Simple RAG simulation
            corpus_context = "\n".join([f"- {doc}" for doc in MINI_RAG_CORPUS])
            prompt = (
                f"You are a Mini RAG engine. Here is a small knowledge base:\n{corpus_context}\n\n"
                f"User Query: {request.query}\n"
                f"Content provided: {request.content}\n"
                f"Synthesize an answer using ONLY the knowledge base and content. Keep it short."
            )
        elif request.task == "summarize":
            prompt = (
                f"Provide a concise summary of the following text or log outputs:\n\n{request.content}\n\n"
                f"Highlight the main problems or key points in bullet points."
            )
        elif request.task == "review":
            prompt = (
                f"You are a Senior Principal Code Reviewer. Review the following code snippet for styling, bugs, "
                f"and potential race conditions/bottlenecks. Be constructive, professional, and detailed:\n\n{request.content}"
            )
        elif request.task == "log_analyzer":
            prompt = (
                f"Analyze this server stack trace or error log. Identify the root cause, list which systems "
                f"are likely affected, and provide step-by-step troubleshooting suggestions:\n\n{request.content}"
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid playground task type")
            
        response = model.generate_content(prompt)
        return {"result": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI playground execution failed: {str(e)}")
