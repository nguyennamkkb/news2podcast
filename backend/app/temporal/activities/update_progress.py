from app.api.ws import progress_store


async def update_progress(job_id: str, current_step: str, percent: int, steps: list) -> dict:
    progress_store[job_id] = {
        "status": "processing",
        "percent": percent,
        "current_step": current_step,
        "steps": steps,
    }
    return {"ok": True}


async def mark_job_completed(job_id: str, video_data: dict) -> dict:
    progress_store[job_id] = {
        "status": "completed",
        "percent": 100,
        "current_step": "completed",
        "video": video_data,
        "steps": [],
    }
    return {"ok": True}


async def mark_job_failed(job_id: str, error: str, retryable: bool = True) -> dict:
    progress_store[job_id] = {
        "status": "failed",
        "percent": 0,
        "error": error,
        "retryable": retryable,
        "steps": [],
    }
    return {"ok": True}