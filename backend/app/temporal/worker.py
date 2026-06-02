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
from app.temporal.activities.update_progress import update_progress, mark_job_completed, mark_job_failed
from app.temporal.activities.upload_storage import upload_storage
from app.temporal.activities.save_result import save_result
from app.temporal.activities.align_words import align_words
from app.temporal.activities.mix_audio import mix_audio
from app.temporal.activities.generate_thumbnail import generate_thumbnail


async def start_worker():
    settings = get_settings()
    client = await Client.connect(settings.temporal_host, namespace=settings.temporal_namespace)
    worker = Worker(
        client,
        task_queue="news2video-tasks",
        workflows=[NewsToVideoWorkflow],
        activities=[
            parse_content,
            generate_script,
            generate_tts,
            render_video,
            convert_9x16_to_16x9,
            update_progress,
            mark_job_completed,
            mark_job_failed,
            upload_storage,
            save_result,
            align_words,
            mix_audio,
            generate_thumbnail,
        ],
    )
    print("🚀 Temporal worker starting...")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(start_worker())