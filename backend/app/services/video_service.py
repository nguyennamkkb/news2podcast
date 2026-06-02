from __future__ import annotations

import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.video import Video


async def create_video(
    db: AsyncSession,
    job_id: uuid.UUID,
    title: str,
    duration_sec: float,
    slide_count: int,
    language: str,
    format: str,
    file_9x16_url: str,
    file_9x16_size: int,
    file_16x9_url: str,
    file_16x9_size: int,
    thumbnail_url: str,
    slides_json: dict,
) -> Video:
    video = Video(
        job_id=job_id,
        title=title,
        duration_sec=duration_sec,
        slide_count=slide_count,
        language=language,
        format=format,
        file_9x16_url=file_9x16_url,
        file_9x16_size=file_9x16_size,
        file_16x9_url=file_16x9_url,
        file_16x9_size=file_16x9_size,
        thumbnail_url=thumbnail_url,
        slides_json=slides_json,
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return video


async def get_video(db: AsyncSession, video_id: uuid.UUID) -> Video | None:
    result = await db.execute(select(Video).where(Video.id == video_id))
    return result.scalar_one_or_none()


async def list_videos(
    db: AsyncSession, page: int = 1, page_size: int = 20
) -> tuple[list[Video], int]:
    offset = (page - 1) * page_size
    query = select(Video)
    count_query = select(func.count()).select_from(Video)

    total_result = await db.execute(count_query)
    total = total_result.scalar()

    result = await db.execute(
        query.order_by(Video.created_at.desc()).offset(offset).limit(page_size)
    )
    videos = list(result.scalars().all())
    return videos, total


async def get_video_by_job(db: AsyncSession, job_id: uuid.UUID) -> Video | None:
    result = await db.execute(select(Video).where(Video.job_id == job_id))
    return result.scalar_one_or_none()