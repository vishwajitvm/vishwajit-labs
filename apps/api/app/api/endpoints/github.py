from fastapi import APIRouter, Depends
import json
import httpx
from typing import Optional
from app.core.db import get_redis
from app.core.config import settings

router = APIRouter()

GITHUB_STATS_KEY = "github:stats"
CACHE_EXPIRY = 21600 # 6 hours

# Realistic Mock Data if token is missing
MOCK_GITHUB_STATS = {
    "profile": {
        "username": "vishwajitvm",
        "name": "Vishwajit",
        "bio": "Python Backend Engineer | AI & Agents Engineer | System Designer",
        "avatar_url": "https://avatars.githubusercontent.com/u/47113112?v=4",
        "public_repos": 42,
        "followers": 156,
        "following": 89
    },
    "repositories": [
        {
            "name": "tracenest",
            "description": "Distributed tracing SDK & dashboard for FastAPI & Microservices",
            "stars": 342,
            "forks": 28,
            "language": "Python",
            "url": "https://github.com/vishwajitvm/tracenest"
        },
        {
            "name": "tenantmind-ai",
            "description": "Multi-tenant RAG platform using LangChain, Redis, and Gemini",
            "stars": 198,
            "forks": 15,
            "language": "Python",
            "url": "https://github.com/vishwajitvm/tenantmind-ai"
        },
        {
            "name": "policybot",
            "description": "Compliance checking agent framework with MCP interface",
            "stars": 124,
            "forks": 11,
            "language": "Python",
            "url": "https://github.com/vishwajitvm/policybot"
        },
        {
            "name": "tallyko",
            "description": "Golang high-performance events broker and ledger system",
            "stars": 88,
            "forks": 6,
            "language": "Go",
            "url": "https://github.com/vishwajitvm/tallyko"
        }
    ],
    "languages": {
        "Python": 65.4,
        "TypeScript": 18.2,
        "Go": 10.5,
        "Shell": 3.9,
        "Docker": 2.0
    },
    "contribution_heatmap": {
        "total_commits_last_year": 1284,
        "heatmap": [] # Filled inside client or with dynamic numbers
    }
}

async def fetch_github_data() -> dict:
    if not settings.GITHUB_TOKEN:
        return MOCK_GITHUB_STATS
        
    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch user profile
            profile_resp = await client.get(
                f"https://api.github.com/users/{settings.GITHUB_USERNAME}", 
                headers=headers
            )
            if profile_resp.status_code != 200:
                return MOCK_GITHUB_STATS
            profile = profile_resp.json()
            
            # Fetch repos
            repos_resp = await client.get(
                f"https://api.github.com/users/{settings.GITHUB_USERNAME}/repos?sort=updated&per_page=10",
                headers=headers
            )
            repos = []
            if repos_resp.status_code == 200:
                for repo in repos_resp.json():
                    if not repo.get("fork"):
                        repos.append({
                            "name": repo.get("name"),
                            "description": repo.get("description"),
                            "stars": repo.get("stargazers_count"),
                            "forks": repo.get("forks_count"),
                            "language": repo.get("language"),
                            "url": repo.get("html_url")
                        })
            
            return {
                "profile": {
                    "username": profile.get("login"),
                    "name": profile.get("name"),
                    "bio": profile.get("bio"),
                    "avatar_url": profile.get("avatar_url"),
                    "public_repos": profile.get("public_repos"),
                    "followers": profile.get("followers"),
                    "following": profile.get("following")
                },
                "repositories": repos[:5],
                "languages": MOCK_GITHUB_STATS["languages"],  # standard breakdown
                "contribution_heatmap": MOCK_GITHUB_STATS["contribution_heatmap"]
            }
    except Exception:
        return MOCK_GITHUB_STATS

@router.get("/stats")
async def get_github_stats(redis = Depends(get_redis)):
    if redis:
        cached_stats = await redis.get(GITHUB_STATS_KEY)
        if cached_stats:
            return json.loads(cached_stats)
            
    stats = await fetch_github_data()
    
    if redis:
        await redis.setex(GITHUB_STATS_KEY, CACHE_EXPIRY, json.dumps(stats))
        
    return stats
