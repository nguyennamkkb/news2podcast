import asyncio
from temporalio.client import Client
from temporalio.worker import Worker
from app.config import get_settings
from app.temporal.workflows import NewsToVideoWorkflow
from app.temporal.activities.parse_content import parse_content
from app.temporal.activities.generate_script import generate_script
from app.temporal.activities.generate_tts import generate_tts
from app.temporal.activities.render_video import render_video
from app.temporal.activities.convert_format import convert_9x16_to_16x9


async def start_worker():
    settings = get_settings()
    client = await Client.connect(settings.temporal_host, namespace=settings.temporal_namespace)
    worker = Worker(
        client,
        task_queue="news2video-tasks",
        workflows=[NewsToVideoWorkflow],
        activities=[parse_content, generate_script, generate_tts, render_video, convert_9x16_to_16x9],
    )
    print("🚀 Temporal worker starting...")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(start_worker())