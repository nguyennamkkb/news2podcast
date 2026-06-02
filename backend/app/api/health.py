from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()


@router.get("/api/v1/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "0.1.0",
    }