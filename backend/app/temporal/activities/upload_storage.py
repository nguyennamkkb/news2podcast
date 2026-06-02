import os
from app.services.storage import upload_file


async def upload_storage(video_9x16_path: str, video_16x9_path: str, job_id: str,
                         thumbnail_9x16_path: str = "", thumbnail_16x9_path: str = "") -> dict:
    """Upload both video formats and optional thumbnails to MinIO."""
    url_9x16 = upload_file(video_9x16_path, f"videos/{job_id}_9x16.mp4")
    url_16x9 = upload_file(video_16x9_path, f"videos/{job_id}_16x9.mp4")

    size_9x16 = os.path.getsize(video_9x16_path)
    size_16x9 = os.path.getsize(video_16x9_path)

    thumb_url_9x16 = ""
    thumb_url_16x9 = ""

    if thumbnail_9x16_path and os.path.exists(thumbnail_9x16_path):
        thumb_url_9x16 = upload_file(thumbnail_9x16_path, f"thumbnails/{job_id}_9x16.jpg")
    if thumbnail_16x9_path and os.path.exists(thumbnail_16x9_path):
        thumb_url_16x9 = upload_file(thumbnail_16x9_path, f"thumbnails/{job_id}_16x9.jpg")

    return {
        "url_9x16": url_9x16,
        "url_16x9": url_16x9,
        "size_9x16": size_9x16,
        "size_16x9": size_16x9,
        "thumbnail_url_9x16": thumb_url_9x16,
        "thumbnail_url_16x9": thumb_url_16x9,
    }