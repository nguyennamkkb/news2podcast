from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio

router = APIRouter()

progress_store: dict[str, dict] = {}


@router.websocket("/api/v1/ws/jobs/{job_id}")
async def job_progress_ws(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        while True:
            progress = progress_store.get(job_id, {"status": "queued", "percent": 0})
            await websocket.send_json(progress)
            if progress.get("status") in ("completed", "failed"):
                break
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass