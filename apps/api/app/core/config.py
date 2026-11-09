from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vishwajit Labs API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    # Admin dashboard: requests must send "Authorization: Bearer <ADMIN_TOKEN>". Unset = admin locked.
    ADMIN_TOKEN: Optional[str] = None
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017/vishwajit_labs"
    MONGODB_DB_NAME: str = "vishwajit_labs"
    
    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379/0"
    
    # Gemini AI ("Ask my AI"). Without a key the chat answers from the knowledge base offline.
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"
    
    # GitHub
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_USERNAME: str = "vishwajitvm"
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None
    
    # Resend Email
    RESEND_API_KEY: Optional[str] = None
    CONTACT_EMAIL_TO: str = "vishwajitmall50@gmail.com"
    # Resend's shared sender only delivers to the Resend account's own address;
    # set this to an address on a domain verified in Resend to email anyone else.
    CONTACT_EMAIL_FROM: str = "Vishwajit Labs <onboarding@resend.dev>"
    
    # Sentry DSN
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
