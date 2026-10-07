from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment and .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application Settings
    APP_NAME: str = "Multimodal AI Operations Copilot"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database & Authentication
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/ops_agent.db"
    JWT_SECRET: str = "supersecret-jwt-key-for-ops-copilot-dev-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Multimodal LLM Settings
    LLM_PROVIDER: str = "gemini"  # "gemini" | "mock" | "local"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Storage and Upload Boundaries
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_MB: int = 50
    ALLOWED_IMAGE_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]
    ALLOWED_VIDEO_TYPES: List[str] = [
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo"
    ]
    ALLOWED_DOC_TYPES: List[str] = [
        "application/pdf"
    ]

    # Video Pipeline Tuning
    VIDEO_SAMPLE_FPS: int = 1
    VIDEO_MAX_DURATION_SEC: int = 60
    VIDEO_BLUR_THRESHOLD: float = 100.0

    # Observability
    LOG_LEVEL: str = "INFO"

    @property
    def upload_path(self) -> Path:
        """Returns verified Path object for uploads root."""
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


@lru_cache()
def get_settings() -> Settings:
    """Singleton getter for cached application settings."""
    return Settings()
