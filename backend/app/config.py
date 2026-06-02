from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # LLM
    llm_provider: str = "ollama"  # "ollama" or "openai"
    llm_api_url: str = ""
    llm_api_key: str = ""
    llm_model: str = "qwen3:32b"

    # Ollama (legacy, dùng khi llm_provider="ollama")
    ollama_api_url: str = "https://your-ollama-cloud.com/api/generate"
    ollama_model: str = "qwen3:32b"

    # Database
    database_url: str = "postgresql+asyncpg://news2video:news2video@localhost:5432/news2video"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket: str = "news2video"

    # Temporal
    temporal_host: str = "localhost:7233"
    temporal_namespace: str = "news2video"

    # App
    secret_key: str = "dev-secret-key"
    environment: str = "development"
    log_level: str = "debug"
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()