from temporalio import activity
from sqlalchemy import update as sql_update
from app.database import async_session
from app.models.job import Job as JobModel
import logging

logger = logging.getLogger(__name__)


@activity.defn
async def save_script_data(job_id: str, slides_data: dict) -> dict:
    async with async_session() as session:
        await session.execute(
            sql_update(JobModel)
            .where(JobModel.id == job_id)
            .values(
                status="awaiting_review",
                script_data=slides_data,
            )
        )
        await session.commit()
    logger.info(f"Saved script data for job {job_id}: {len(slides_data.get('slides', []))} slides")
    return {"ok": True}