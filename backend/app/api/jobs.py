import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.schemas import CreateJobRequest, JobResponse, JobDetailResponse, ProgressSchema, ProgressStepSchema
from app.services.job_service import create_job, get_job, list_jobs, get_cached_job
from app.services.video_service import get_video_by_job
from app.temporal.client import start_news_video_workflow, cancel_workflow

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


@router.post("/", response_model=JobResponse, status_code=202)
async def create_video_job(req: CreateJobRequest, db: AsyncSession = Depends(get_db)):
    job = await create_job(db, content=req.content, config=req.config.model_dump())
    config_dict = req.config.model_dump()
    config_dict["voice"] = config_dict.get("voice", "vi-VN-HoaiMyNeural")

    cached_job = await get_cached_job(db, req.content, config_dict)
    if cached_job:
        video_record = await get_video_by_job(db, cached_job.id)
        if video_record:
            from app.models.schemas import VideoOutputSchema, DownloadInfo
            from app.services.storage import get_download_url
            from datetime import datetime, timedelta
            video = VideoOutputSchema(
                video_id=video_record.id,
                title=video_record.title,
                duration_sec=video_record.duration_sec,
                slide_count=video_record.slide_count,
                downloads={
                    "9x16": DownloadInfo(
                        url=get_download_url(f"videos/{cached_job.id}_9x16.mp4"),
                        size_bytes=video_record.file_9x16_size or 0,
                        expires_at=datetime.utcnow() + timedelta(hours=24),
                    ),
                    "16x9": DownloadInfo(
                        url=get_download_url(f"videos/{cached_job.id}_16x9.mp4"),
                        size_bytes=video_record.file_16x9_size or 0,
                        expires_at=datetime.utcnow() + timedelta(hours=24),
                    ),
                },
            )
            return JobDetailResponse(
                job_id=cached_job.id,
                status="completed",
                progress=ProgressSchema(
                    current_step="cached",
                    percent=100,
                    steps=[ProgressStepSchema(name="cached", status="completed", duration_ms=0)],
                ),
                video=video,
                error_message=None,
                created_at=cached_job.created_at,
                updated_at=cached_job.updated_at,
                completed_at=cached_job.completed_at,
            )

    job_input = {
        "job_id": str(job.id),
        "content": req.content,
        "config": config_dict,
    }
    workflow_id = f"news2video-{job.id}"

    try:
        await start_news_video_workflow(job_input, workflow_id)
        from sqlalchemy import update as sql_update
        from app.models.job import Job as JobModel
        await db.execute(
            sql_update(JobModel).where(JobModel.id == job.id).values(status="processing", workflow_id=workflow_id)
        )
        await db.commit()
        await db.refresh(job)
    except Exception:
        from sqlalchemy import update as sql_update
        from app.models.job import Job as JobModel
        await db.execute(
            sql_update(JobModel).where(JobModel.id == job.id).values(status="queued", workflow_id=workflow_id)
        )
        await db.commit()
        await db.refresh(job)

    return JobResponse(
        job_id=job.id,
        status=job.status,
        created_at=job.created_at,
        estimated_duration_sec=120,
    )


@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job_status(job_id: str, db: AsyncSession = Depends(get_db)):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    progress = None
    if job.progress_json:
        progress = ProgressSchema(
            current_step=job.progress_json.get("current_step", ""),
            percent=job.progress_json.get("percent", 0),
            steps=[
                ProgressStepSchema(
                    name=s.get("name", ""),
                    status=s.get("status", ""),
                    duration_ms=s.get("duration_ms"),
                )
                for s in job.progress_json.get("steps", [])
            ],
        )

    video = None
    if job.status == "completed":
        video_record = await get_video_by_job(db, job.id)
        if video_record:
            from app.models.schemas import VideoOutputSchema, DownloadInfo
            from app.services.storage import get_download_url
            from datetime import datetime, timedelta
            video = VideoOutputSchema(
                video_id=video_record.id,
                title=video_record.title,
                duration_sec=video_record.duration_sec,
                slide_count=video_record.slide_count,
                downloads={
                    "9x16": DownloadInfo(
                        url=get_download_url(f"videos/{job_id}_9x16.mp4"),
                        size_bytes=video_record.file_9x16_size or 0,
                        expires_at=datetime.utcnow() + timedelta(hours=24),
                    ),
                    "16x9": DownloadInfo(
                        url=get_download_url(f"videos/{job_id}_16x9.mp4"),
                        size_bytes=video_record.file_16x9_size or 0,
                        expires_at=datetime.utcnow() + timedelta(hours=24),
                    ),
                },
            )

    return JobDetailResponse(
        job_id=job.id,
        status=job.status,
        progress=progress,
        video=video,
        error_message=job.error_message,
        created_at=job.created_at,
        updated_at=job.updated_at,
        completed_at=job.completed_at,
    )


@router.get("/")
async def list_jobs_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    jobs = await list_jobs(db, page=page, page_size=page_size)
    return {
        "jobs": [
            {"job_id": str(j.id), "status": j.status, "created_at": j.created_at.isoformat()}
            for j in jobs
        ],
        "pagination": {"page": page, "page_size": page_size, "total": len(jobs)},
    }


@router.delete("/{job_id}", status_code=200)
async def cancel_job(job_id: str, db: AsyncSession = Depends(get_db)):
    job = await get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status not in ("queued", "processing"):
        raise HTTPException(status_code=400, detail="Job cannot be cancelled in current state")
    if job.workflow_id:
        try:
            await cancel_workflow(job.workflow_id)
        except Exception:
            pass

    from sqlalchemy import update as sql_update
    from app.models.job import Job as JobModel
    await db.execute(
        sql_update(JobModel).where(JobModel.id == job.id).values(status="cancelled")
    )
    await db.commit()
    return {"job_id": str(job.id), "status": "cancelled"}