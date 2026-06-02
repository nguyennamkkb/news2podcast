import os
from app.services.storage import upload_file


async def upload_storage(video_9x16_path: str, video_16x9_path: str, job_id: str) -> dict:
    """Upload both video formats to MinIO and return URLs."""
    url_9x16 = upload_file(video_9x16_path, f"videos/{job_id}_9x16.mp4")
    url_16x9 = upload_file(video_16x9_path, f"videos/{job_id}_16x9.mp4")

    size_9x16 = os.path.getsize(video_9x16_path)
    size_16x9 = os.path.getsize(video_16x9_path)

    return {
        "url_9x16": url_9x16,
        "url_16x9": url_16x9,
        "size_9x16": size_9x16,
        "size_16x9": size_16x9,
    }