import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.health import router as health_router
from app.api.jobs import router as jobs_router
from app.api.ws import router as ws_router
from app.api.videos import router as videos_router
from app.database import init_db

logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="News2Video API",
    version="0.1.0",
    docs_url="/api/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(jobs_router)
app.include_router(ws_router)
app.include_router(videos_router)


@app.on_event("startup")
async def startup():
    await init_db()
    try:
        from app.temporal.worker import start_worker
        asyncio.create_task(start_worker())
        print("🚀 Temporal worker started as background task (dev mode)")
    except Exception as e:
        logger.warning(f"⚠️ Could not start Temporal worker: {e}")
    print(f"🚀 News2Video API starting in {settings.environment} mode")


@app.on_event("shutdown")
async def shutdown():
    print("👋 News2Video API shutting down")