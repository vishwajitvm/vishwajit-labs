from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import logging

from app.core.config import settings
from app.core.db import connect_to_mongo, close_mongo_connection, connect_to_redis, close_redis_connection
from app.api.endpoints import contact, github, chat, playground, analytics

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
    )
    logger.info("Sentry monitoring initialized.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://vishwajitvm.dev",
    "https://www.vishwajitvm.dev",
    "https://vishwajit-labs.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup & Shutdown hooks
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await connect_to_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    await close_redis_connection()

# Include routers
api_router = APIRouter()
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(github.router, prefix="/github", tags=["github"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(playground.router, prefix="/playground", tags=["playground"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Basic Auth Mock router for simple login verify
@api_router.post("/auth/verify")
async def verify_auth_token():
    # Helper endpoint confirming admin access state
    return {"admin": True, "user": "vishwajit"}

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"status": "online", "service": settings.PROJECT_NAME}
