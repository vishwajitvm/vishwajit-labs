import asyncio
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None
    db = None
    redis = None

db_connection = Database()

async def connect_to_mongo():
    # The client connects lazily; short timeouts mean a missing or sleeping database
    # fails a request in seconds instead of hanging it for 30.
    logger.info("Connecting to MongoDB...")
    try:
        db_connection.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=4000,
            connectTimeoutMS=4000,
            socketTimeoutMS=8000,
        )
        db_connection.db = db_connection.client[settings.MONGODB_DB_NAME]
        logger.info("MongoDB client ready.")
    except Exception as e:
        logger.error(f"MongoDB is not configured correctly, continuing without it: {e}")
        db_connection.client = None
        db_connection.db = None

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_connection.client:
        db_connection.client.close()
    logger.info("MongoDB connection closed.")

async def connect_to_redis():
    if settings.REDIS_URL:
        logger.info("Connecting to Redis...")
        try:
            db_connection.redis = aioredis.from_url(
                settings.REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True
            )
            await db_connection.redis.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            db_connection.redis = None

async def close_redis_connection():
    if db_connection.redis:
        logger.info("Closing Redis connection...")
        await db_connection.redis.close()
        logger.info("Redis connection closed.")

def get_database():
    return db_connection.db

async def safe_insert(collection: str, doc: dict) -> Optional[str]:
    """Insert a document if the database is reachable. Returns the new id, or None on any failure."""
    db = db_connection.db
    if db is None:
        return None
    try:
        result = await asyncio.wait_for(db[collection].insert_one(doc), timeout=10)
        return str(result.inserted_id)
    except Exception as e:
        logger.warning(f"MongoDB insert into '{collection}' skipped: {e.__class__.__name__}: {e}")
        return None

def get_redis():
    return db_connection.redis
