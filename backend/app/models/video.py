import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Float, BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Video(Base):
    __tablename__ = "videos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    duration_sec: Mapped[float] = mapped_column(Float, nullable=False)
    slide_count: Mapped[int] = mapped_column(Integer, nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    format: Mapped[str] = mapped_column(String(10), nullable=False)
    file_9x16_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_9x16_size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    file_16x9_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    file_16x9_size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    slides_json: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )