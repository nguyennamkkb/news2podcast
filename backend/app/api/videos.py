import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.video_service import get_video, list_videos
from app.models.schemas import VideoListResponse
from app.services.storage import get_download_url

router = APIRouter(prefix="/api/v1/videos", tags=["videos"])


@router.get("/")
async def list_videos_endpoint(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None, description="Filter by format/status"),
    db: AsyncSession = Depends(get_db),
):
    videos, total = await list_videos(db, page=page, page_size=page_size, status=status)
    total_pages = (total + page_size - 1) // page_size
    return {
        "videos": [
            VideoListResponse(
                video_id=v.id,
                title=v.title,
                status="completed",
                duration_sec=v.duration_sec,
                slide_count=v.slide_count,
                format=v.format,
                language=v.language,
                thumbnail_url=v.thumbnail_url,
                created_at=v.created_at,
                download_9x16=get_download_url(f"videos/{v.job_id}_9x16.mp4"),
                download_16x9=get_download_url(f"videos/{v.job_id}_16x9.mp4"),
            ).model_dump()
            for v in videos
        ],
        "pagination": {"page": page, "page_size": page_size, "total": total, "total_pages": total_pages},
    }


@router.get("/{video_id}")
async def get_video_endpoint(video_id: str, db: AsyncSession = Depends(get_db)):
    try:
        vid_uuid = uuid.UUID(video_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video ID")
    video = await get_video(db, vid_uuid)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return {
        "video_id": str(video.id),
        "job_id": str(video.job_id),
        "title": video.title,
        "duration_sec": video.duration_sec,
        "slide_count": video.slide_count,
        "language": video.language,
        "format": video.format,
        "file_9x16_url": video.file_9x16_url,
        "file_16x9_url": video.file_16x9_url,
        "thumbnail_url": video.thumbnail_url,
        "created_at": video.created_at.isoformat(),
    }


@router.get("/{video_id}/download")
async def download_video(
    video_id: str,
    format: str = Query("9x16", regex="^(9x16|16x9)$"),
    db: AsyncSession = Depends(get_db),
):
    try:
        vid_uuid = uuid.UUID(video_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid video ID")
    video = await get_video(db, vid_uuid)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if format == "9x16":
        object_name = f"videos/{video.job_id}_9x16.mp4"
    else:
        object_name = f"videos/{video.job_id}_16x9.mp4"

    url = get_download_url(object_name)
    return RedirectResponse(url=url)