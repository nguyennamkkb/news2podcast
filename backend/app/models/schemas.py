from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class LLMConfigSchema(BaseModel):
    provider: Literal["ollama", "openai"] = "ollama"
    api_url: str = ""
    api_key: Optional[str] = None
    model: str = "qwen3:32b"


class VideoConfigSchema(BaseModel):
    voice: str = "vi-VN-HoaiMyNeural"
    format: Literal["9x16", "16x9"] = "9x16"
    outputs: list[Literal["9x16", "16x9"]] = ["9x16", "16x9"]
    target_duration_sec: int = 60
    slide_count: int = 5
    background_music: Optional[str] = None
    llm_config: Optional[LLMConfigSchema] = None


class CreateJobRequest(BaseModel):
    content: str = Field(..., min_length=10, max_length=50000)
    config: VideoConfigSchema = VideoConfigSchema()
    llm_config: Optional[LLMConfigSchema] = None


class JobResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    created_at: datetime
    estimated_duration_sec: Optional[int] = None
    model_config = {"from_attributes": True}


class ProgressStepSchema(BaseModel):
    name: str
    status: str
    duration_ms: Optional[int] = None


class ProgressSchema(BaseModel):
    current_step: str
    percent: int
    steps: list[ProgressStepSchema]


class DownloadInfo(BaseModel):
    url: str
    size_bytes: int
    expires_at: datetime


class VideoOutputSchema(BaseModel):
    video_id: uuid.UUID
    title: str
    duration_sec: float
    slide_count: int
    downloads: dict[str, DownloadInfo]


class SlideSchema(BaseModel):
    title: str
    bullets: list[str]
    voiceover: str
    duration_sec: float


class ScriptDataSchema(BaseModel):
    slides: list[SlideSchema]


class JobDetailResponse(BaseModel):
    job_id: uuid.UUID
    status: str
    progress: Optional[ProgressSchema] = None
    video: Optional[VideoOutputSchema] = None
    script_data: Optional[ScriptDataSchema] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class VideoListResponse(BaseModel):
    video_id: uuid.UUID
    title: str
    status: str
    duration_sec: Optional[float] = None
    slide_count: Optional[int] = None
    format: str
    language: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime
    download_9x16: Optional[str] = None
    download_16x9: Optional[str] = None