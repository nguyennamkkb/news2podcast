import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, Text, DateTime, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="queued"
    )
    content_text: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    detected_lang: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    config_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    progress_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    workflow_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')",
            name="valid_status",
        ),
        CheckConstraint("word_count > 0", name="positive_word_count"),
    )