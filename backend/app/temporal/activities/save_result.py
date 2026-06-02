import uuid
from datetime import datetime
from sqlalchemy import select
from app.database import async_session
from app.models.job import Job
from app.models.video import Video


async def save_result(
    job_id: str,
    title: str,
    duration_sec: float,
    slide_count: int,
    language: str,
    url_9x16: str,
    size_9x16: int,
    url_16x9: str,
    size_16x9: int,
    slides_json: dict,
) -> dict:
    async with async_session() as db:
        job_uuid = uuid.UUID(job_id)

        video = Video(
            job_id=job_uuid,
            title=title,
            duration_sec=duration_sec,
            slide_count=slide_count,
            language=language,
            format="9x16",
            file_9x16_url=url_9x16,
            file_9x16_size=size_9x16,
            file_16x9_url=url_16x9,
            file_16x9_size=size_16x9,
            slides_json=slides_json,
        )
        db.add(video)

        result = await db.execute(select(Job).where(Job.id == job_uuid))
        job = result.scalar_one_or_none()
        if job:
            job.status = "completed"
            job.completed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(video)

        return {
            "video_id": str(video.id),
            "title": title,
            "duration_sec": duration_sec,
        }