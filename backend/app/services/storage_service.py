"""
Firebase Storage service
"""
import os
import uuid
from typing import Optional
from firebase_admin import storage
from fastapi import UploadFile, HTTPException, status


class StorageService:
    """Firebase Storage file upload/delete service"""

    def __init__(self):
        self.bucket_name = os.getenv('FIREBASE_STORAGE_BUCKET', 'clubatlas-ecaa4.firebasestorage.app')
        self._bucket = None

    def _get_bucket(self):
        """Get storage bucket (lazy loading)"""
        if self._bucket is None:
            try:
                self._bucket = storage.bucket(self.bucket_name)
            except Exception as e:
                print(f"Failed to initialize storage bucket: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Storage service not available"
                )
        return self._bucket

    async def upload_file(
        self,
        file: UploadFile,
        folder: str,
        club_id: Optional[str] = None,
        allowed_types: list = None
    ) -> str:
        """
        Upload a file to Firebase Storage.

        Args:
            file: File to upload
            folder: Destination folder (e.g. 'club-logos', 'club-banners')
            club_id: Club ID (included in the path)
            allowed_types: Allowed MIME types

        Returns:
            Public URL of the uploaded file
        """
        bucket = self._get_bucket()

        if allowed_types and file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )

        # 5MB file size limit
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5MB limit"
            )

        try:
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ''

            unique_filename = f"{uuid.uuid4()}{file_extension}"

            if club_id:
                blob_path = f"{folder}/{club_id}/{unique_filename}"
            else:
                blob_path = f"{folder}/{unique_filename}"

            blob = bucket.blob(blob_path)
            blob.upload_from_string(
                file_content,
                content_type=file.content_type
            )

            blob.make_public()

            return blob.public_url

        except Exception as e:
            print(f"Upload error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )

    async def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from Firebase Storage.

        Args:
            file_url: Public URL of the file to delete

        Returns:
            Whether deletion succeeded
        """
        try:
            bucket = self._get_bucket()
        except Exception:
            return False

        try:
            blob_path = self._extract_blob_path(file_url)

            if blob_path:
                blob = bucket.blob(blob_path)
                blob.delete()
                return True

            return False

        except Exception as e:
            print(f"Delete error: {e}")
            return False

    def _extract_blob_path(self, file_url: str) -> Optional[str]:
        """Extract blob path from URL"""
        try:
            # Extract path after https://storage.googleapis.com/bucket-name/
            if 'storage.googleapis.com' in file_url:
                parts = file_url.split(f'{self.bucket_name}/')
                if len(parts) > 1:
                    return parts[1]
            return None
        except Exception:
            return None


storage_service = StorageService()
