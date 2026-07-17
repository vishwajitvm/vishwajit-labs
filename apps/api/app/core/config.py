from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vishwajit Labs API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/vishwajit_labs"
    MONGODB_DB_NAME: str = "vishwajit_labs"
    
    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    
    # GitHub
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_USERNAME: str = "vishwajitvm"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Resend Email
    RESEND_API_KEY: Optional[str] = None
    CONTACT_EMAIL_TO: str = "vishwajit@vishwajitvm.dev"
    
    # Sentry DSN
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
