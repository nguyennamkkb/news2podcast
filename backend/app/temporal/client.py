from __future__ import annotations

from temporalio.client import Client
from app.config import get_settings
from app.temporal.workflows import NewsToVideoWorkflow

_client: Client | None = None


async def get_temporal_client() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = await Client.connect(
            settings.temporal_host,
            namespace=settings.temporal_namespace,
        )
    return _client


async def start_news_video_workflow(job_input: dict, workflow_id: str) -> str:
    client = await get_temporal_client()
    handle = await client.start_workflow(
        NewsToVideoWorkflow.run,
        job_input,
        id=workflow_id,
        task_queue="news2video-tasks",
    )
    return handle.id


async def get_workflow_status(workflow_id: str) -> dict:
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    desc = await handle.describe()
    return {
        "id": desc.id,
        "status": desc.status.name,
        "run_id": desc.run_id,
    }


async def cancel_workflow(workflow_id: str) -> None:
    client = await get_temporal_client()
    handle = client.get_workflow_handle(workflow_id)
    await handle.cancel()