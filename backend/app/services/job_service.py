import hashlib
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.job import Job


def hash_content(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()


async def create_job(db: AsyncSession, content: str, config: dict) -> Job:
    content_hash = hash_content(content)
    existing = await db.execute(
        select(Job).where(Job.content_hash == content_hash, Job.status == "completed").limit(1)
    )
    cached = existing.scalar_one_or_none()
    if cached:
        return cached

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