import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import CreateJobRequest, JobResponse, JobDetailResponse
from app.services.job_service import create_job, get_job, list_jobs
from datetime import datetime

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


async def get_db():
    # Placeholder — will connect to Postgres in future tasks
    raise NotImplementedError("DB session not yet wired")


@router.post("/", response_model=JobResponse, status_code=202)
async def create_video_job(req: CreateJobRequest):
    # Placeholder until DB is wired
    job_id = uuid.uuid4()
    return JobResponse(
        job_id=job_id,
        status="queued",
        created_at=datetime.utcnow(),
        estimated_duration_sec=120,
    )


@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job_status(job_id: str):
    raise HTTPException(status_code=501, detail="Not yet implemented — DB connection pending")


@router.get("/")
async def list_jobs_endpoint():
    return {"jobs": [], "pagination": {"page": 1, "page_size": 20, "total": 0}}