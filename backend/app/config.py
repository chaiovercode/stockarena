"""Configuration settings for InsightFlow backend."""

import json
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Keys
    google_api_key: str = ""
    openai_api_key: str = ""

    # CORS
    cors_origins: str = '["http://localhost:5173","http://localhost:5174","http://localhost:3000"]'

    # Debug
    debug: bool = True
    log_level: str = "INFO"

    # App settings
    app_name: str = "InsightFlow"
    app_version: str = "1.0.0"

    # Debate settings
    default_max_rounds: int = 1
    max_allowed_rounds: int = 3

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from JSON string."""
        try:
            return json.loads(self.cors_origins)
        except json.JSONDecodeError:
            return ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = "backend/.env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
