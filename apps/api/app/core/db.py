import logging
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
    logger.info("Connecting to MongoDB...")
    db_connection.client = AsyncIOMotorClient(settings.MONGODB_URI)
    db_connection.db = db_connection.client[settings.MONGODB_DB_NAME]
    logger.info("Connected to MongoDB successfully.")

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

def get_redis():
    return db_connection.redis
