from __future__ import annotations

import hashlib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.job import Job


def hash_content(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


async def create_job(db: AsyncSession, content: str, config: dict) -> Job:
    content_hash = hash_content(content)
    # Cache lookup disabled temporarily — get_cached_job computes config_hash
    # but never uses it in the query, so the cache is ineffective.
    # Re-enable once a config_hash column is added to the Job model.
    # existing = await db.execute(
    #     select(Job).where(Job.content_hash == content_hash, Job.status == "completed").limit(1)
    # )
    # cached = existing.scalar_one_or_none()
    # if cached:
    #     return cached

    job = Job(
        content_text=content,
        content_hash=content_hash,
        word_count=len(content.split()),
        detected_lang="vi",
        config_json=config,
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def get_job(db: AsyncSession, job_id: str) -> Job | None:
    result = await db.execute(select(Job).where(Job.id == job_id))
    return result.scalar_one_or_none()


async def list_jobs(db: AsyncSession, page: int = 1, page_size: int = 20) -> list[Job]:
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Job).order_by(Job.created_at.desc()).offset(offset).limit(page_size)
    )
    return list(result.scalars().all())


# TODO: Re-enable and fix get_cached_job once a config_hash column is added
# to the Job model. Currently config_hash is computed but never used in the
# query, so the cache is ineffective and this function is unused.
async def get_cached_job(db: AsyncSession, content: str, config: dict) -> Job | None:
    """Check if an identical job was already completed."""
    content_hash = hash_content(content)
    config_hash = hashlib.sha256(str(sorted(config.items())).encode()).hexdigest()
    result = await db.execute(
        select(Job).where(
            Job.content_hash == content_hash,
            Job.status == "completed",
        ).order_by(Job.completed_at.desc()).limit(1)
    )
    return result.scalar_one_or_none()