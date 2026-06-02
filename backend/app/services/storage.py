from __future__ import annotations

import logging

from minio import Minio
from minio.error import S3Error
from app.config import get_settings
from datetime import timedelta

logger = logging.getLogger(__name__)

settings = get_settings()

_client: Minio | None = None


def get_client() -> Minio:
    """Lazily create and return the MinIO client.

    On first call, creates the client and ensures the bucket exists.
    If MinIO is unavailable, raises the underlying exception so callers
    can handle it appropriately.
    """
    global _client
    if _client is not None:
        return _client

    try:
        client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=False,
        )
        # Ensure bucket exists
        if not client.bucket_exists(settings.minio_bucket):
            client.make_bucket(settings.minio_bucket)
        _client = client
        return _client
    except Exception as e:
        logger.warning("MinIO unavailable at %s: %s", settings.minio_endpoint, e)
        raise


def upload_file(local_path: str, object_name: str) -> str:
    """Upload a file to MinIO and return its public URL."""
    client = get_client()
    client.fput_object(settings.minio_bucket, object_name, local_path)
    url = f"http://{settings.minio_endpoint}/{settings.minio_bucket}/{object_name}"
    return url


def get_download_url(object_name: str, expires_hours: int = 24) -> str:
    """Generate a presigned download URL for an object."""
    client = get_client()
    url = client.presigned_get_object(
        settings.minio_bucket,
        object_name,
        expires=timedelta(hours=expires_hours),
    )
    return url


def delete_file(object_name: str) -> None:
    """Delete an object from MinIO."""
    client = get_client()
    client.remove_object(settings.minio_bucket, object_name)