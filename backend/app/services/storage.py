from minio import Minio
from minio.error import S3Error
from app.config import get_settings
from datetime import timedelta

settings = get_settings()

_client = Minio(
    settings.minio_endpoint,
    access_key=settings.minio_access_key,
    secret_key=settings.minio_secret_key,
    secure=False,
)

# Ensure bucket exists
if not _client.bucket_exists(settings.minio_bucket):
    _client.make_bucket(settings.minio_bucket)


def upload_file(local_path: str, object_name: str) -> str:
    """Upload a file to MinIO and return its public URL."""
    _client.fput_object(settings.minio_bucket, object_name, local_path)
    url = f"http://{settings.minio_endpoint}/{settings.minio_bucket}/{object_name}"
    return url


def get_download_url(object_name: str, expires_hours: int = 24) -> str:
    """Generate a presigned download URL for an object."""
    url = _client.presigned_get_object(
        settings.minio_bucket,
        object_name,
        expires=timedelta(hours=expires_hours),
    )
    return url


def delete_file(object_name: str) -> None:
    """Delete an object from MinIO."""
    _client.remove_object(settings.minio_bucket, object_name)