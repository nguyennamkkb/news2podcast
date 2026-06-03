import logging
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Literal
from app.config import mask_api_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/llm", tags=["llm"])


class LLMTestRequest(BaseModel):
    provider: Literal["ollama", "openai"] = "ollama"
    api_url: str = ""
    api_key: Optional[str] = None
    model: str = "qwen3:32b"


class LLMTestResponse(BaseModel):
    success: bool
    message: str
    latency_ms: int = 0


@router.post("/test", response_model=LLMTestResponse)
async def test_llm_connection(req: LLMTestRequest):
    import time

    if not req.api_url:
        return LLMTestResponse(success=False, message="API URL is required")

    start = time.monotonic()

    try:
        if req.provider == "ollama":
            payload = {
                "model": req.model,
                "prompt": "Say \"ok\" in one word.",
                "stream": False,
                "options": {"num_predict": 5},
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(req.api_url, json=payload)
                response.raise_for_status()
                data = response.json()
                # Ollama returns {"response": "..."} — verify it exists
                if "response" not in data:
                    return LLMTestResponse(
                        success=False,
                        message=f"Unexpected response format. Keys: {list(data.keys())}",
                        latency_ms=int((time.monotonic() - start) * 1000),
                    )
        else:
            headers = {"Content-Type": "application/json"}
            if req.api_key:
                headers["Authorization"] = f"Bearer {req.api_key}"

            payload = {
                "model": req.model,
                "messages": [
                    {"role": "user", "content": "Say \"ok\" in one word."},
                ],
                "max_tokens": 5,
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(req.api_url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                # OpenAI-compatible returns {"choices": [...]}
                if "choices" not in data and "error" in data:
                    err_msg = data["error"].get("message", str(data["error"])) if isinstance(data["error"], dict) else str(data["error"])
                    return LLMTestResponse(
                        success=False,
                        message=f"API error: {err_msg}",
                        latency_ms=int((time.monotonic() - start) * 1000),
                    )
                if "choices" not in data:
                    return LLMTestResponse(
                        success=False,
                        message=f"Unexpected response format. Keys: {list(data.keys())}",
                        latency_ms=int((time.monotonic() - start) * 1000),
                    )

        latency_ms = int((time.monotonic() - start) * 1000)
        logger.info(f"LLM test OK: provider={req.provider} url={req.api_url} model={req.model} key={mask_api_key(req.api_key or '')} latency={latency_ms}ms")
        return LLMTestResponse(
            success=True,
            message=f"Connected successfully ({req.model})",
            latency_ms=latency_ms,
        )

    except httpx.ConnectError:
        latency_ms = int((time.monotonic() - start) * 1000)
        return LLMTestResponse(
            success=False,
            message=f"Cannot connect to {req.api_url}",
            latency_ms=latency_ms,
        )
    except httpx.TimeoutException:
        latency_ms = int((time.monotonic() - start) * 1000)
        return LLMTestResponse(
            success=False,
            message=f"Connection timed out after {latency_ms}ms",
            latency_ms=latency_ms,
        )
    except httpx.HTTPStatusError as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        detail = ""
        try:
            body = e.response.json()
            err = body.get("error", body)
            if isinstance(err, dict):
                detail = err.get("message", str(err))
            else:
                detail = str(err)
        except Exception:
            detail = e.response.text[:200] if e.response.text else f"HTTP {e.response.status_code}"
        return LLMTestResponse(
            success=False,
            message=f"HTTP {e.response.status_code}: {detail}",
            latency_ms=latency_ms,
        )
    except Exception as e:
        latency_ms = int((time.monotonic() - start) * 1000)
        msg = str(e)[:200]
        if "JSONDecodeError" in type(e).__name__ or "json" in msg.lower():
            msg = f"Invalid JSON response from {req.api_url} — verify the API URL is correct"
        return LLMTestResponse(
            success=False,
            message=f"{type(e).__name__}: {msg}",
            latency_ms=latency_ms,
        )