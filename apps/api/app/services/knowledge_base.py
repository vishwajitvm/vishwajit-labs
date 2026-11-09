"""Knowledge base for the "Ask my AI" assistant.

The facts live in knowledge.json, generated from the website's own data
(apps/web/scripts/export-knowledge.mjs), so the assistant never says anything
the portfolio doesn't.
"""
import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Optional

KB_PATH = Path(__file__).with_name("knowledge.json")


@lru_cache(maxsize=1)
def load_kb() -> dict:
    return json.loads(KB_PATH.read_text(encoding="utf-8"))


def _lines(title: str, items) -> str:
    items = [i for i in (items or []) if i]
    return f"  {title}:\n" + "".join(f"    - {i}\n" for i in items) if items else ""


@lru_cache(maxsize=1)
def get_kb_context() -> str:
    """The knowledge base as plain text for the model's system instruction."""
    kb = load_kb()
    p = kb["profile"]
    out = ["ABOUT VISHWAJIT"]
    for key in ("name", "title", "location", "experience", "summary", "current_role", "award", "availability", "contact", "resumes"):
        out.append(f"- {key.replace('_', ' ').capitalize()}: {p[key]}")
    out.append("- Links: " + ", ".join(f"{k}: {v}" for k, v in p["links"].items()))

    out.append("\nWORK HISTORY")
    for j in kb["jobs"]:
        out.append(f"- {j['years']}: {j['role']} at {j['org']} ({j['where']})")
        out.extend(f"    - {pt}" for pt in j["points"])

    out.append("\nSKILLS BY AREA")
    for s in kb["skills"]:
        out.append(f"- {s['area']} ({s['detail']}): {', '.join(s['tools'])}")

    out.append("\nPROJECTS")
    for pr in kb["projects"]:
        head = f"\n## {pr['name']}: {pr['tagline']}\n  Type: {pr['kind']} · {pr['org']}"
        if pr.get("when"):
            head += f" · {pr['when']}"
        head += f" · {pr['status']}\n"
        links = ", ".join(f"{k}: {v}" for k, v in (pr.get("links") or {}).items())
        body = head
        body += f"  Links: {links}\n" if links else "  Links: private / not public\n"
        body += f"  Overview: {pr['overview']}\n  Problem: {pr['problem']}\n  Why it matters: {pr['why']}\n  For: {pr['audience']}\n"
        body += _lines("Key numbers", pr.get("stats"))
        body += _lines("What it does", pr.get("capabilities"))
        body += _lines("What Vishwajit built", pr.get("built"))
        body += "  Tech stack: " + "; ".join(f"{g}: {', '.join(t)}" for g, t in (pr.get("stack") or {}).items()) + "\n"
        for c in pr.get("challenges") or []:
            body += f"  Q: {c['q']}\n  A: {c['a']}\n"
        out.append(body.rstrip())
    return "\n".join(out)


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def find_project(message: str) -> Optional[dict]:
    """The project a question names, if any (used by the offline fallback)."""
    text = _norm(message)
    for pr in load_kb()["projects"]:
        if _norm(pr["name"]) in text or _norm(pr["id"]) in text:
            return pr
    return None
