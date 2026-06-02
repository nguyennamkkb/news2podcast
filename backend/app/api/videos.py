from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/v1/videos", tags=["videos"])


@router.get("/")
async def list_videos(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    return {"videos": [], "pagination": {"page": page, "page_size": page_size, "total": 0, "total_pages": 0}}


@router.get("/{video_id}")
async def get_video(video_id: str):
    raise HTTPException(status_code=501, detail="Not yet implemented")


@router.get("/{video_id}/download")
async def download_video(video_id: str, format: str = Query("9x16", regex="^(9x16|16x9)$")):
    raise HTTPException(status_code=501, detail="Not yet implemented")