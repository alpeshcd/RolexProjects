import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rolex Admin Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rolex-super-secret-jwt-key-2026-exchange-panel")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days
    
    # Shared OTP accepted for every 2FA account, for local testing only.
    # Set DEMO_OTP_CODE="" in production so only real authenticator codes work.
    DEMO_OTP_CODE: str = os.getenv("DEMO_OTP_CODE", "123456")

    # Market data source for the Mastan master panel. "mock" serves generated
    # fixtures and odds until the client shares the real exchange API.
    EXCHANGE_PROVIDER: str = os.getenv("EXCHANGE_PROVIDER", "mock")

    # Password given to the auto-created top account of each domain portal, for
    # local testing only. Change it from the panel (or set this) before going live.
    EXCHANGE_DEMO_PASSWORD: str = os.getenv("EXCHANGE_DEMO_PASSWORD", "master123")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./rolex.db")

    # Uploaded files (e.g. account QR images), served at /api/uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(Path(__file__).resolve().parents[2] / "uploads"))
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
