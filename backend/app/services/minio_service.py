from minio import Minio
from minio.error import S3Error
from app.core.config import settings
import io
from typing import BinaryIO

class MinIOService:
    """MinIO storage service for medical images"""
    
    def __init__(self):
        self.client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
        except S3Error as e:
            print(f"Error creating bucket: {e}")
    
    def upload_file(self, file_data: BinaryIO, object_name: str, content_type: str, file_size: int) -> str:
        """Upload file to MinIO"""
        try:
            self.client.put_object(
                self.bucket_name,
                object_name,
                file_data,
                file_size,
                content_type=content_type
            )
            return f"{self.bucket_name}/{object_name}"
        except S3Error as e:
            raise Exception(f"Failed to upload file: {e}")
    
    def download_file(self, object_name: str) -> bytes:
        """Download file from MinIO"""
        try:
            response = self.client.get_object(self.bucket_name, object_name)
            return response.read()
        except S3Error as e:
            raise Exception(f"Failed to download file: {e}")
        finally:
            response.close()
            response.release_conn()
    
    def delete_file(self, object_name: str):
        """Delete file from MinIO"""
        try:
            self.client.remove_object(self.bucket_name, object_name)
        except S3Error as e:
            raise Exception(f"Failed to delete file: {e}")
    
    def get_file_url(self, object_name: str, expires: int = 3600) -> str:
        """Get presigned URL for file access"""
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                object_name,
                expires=expires
            )
            return url
        except S3Error as e:
            raise Exception(f"Failed to generate URL: {e}")

# Singleton instance
minio_service = MinIOService()
