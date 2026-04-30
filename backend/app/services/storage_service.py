"""
Firebase Storage 서비스
"""
import os
import uuid
from typing import Optional
from firebase_admin import storage
from fastapi import UploadFile, HTTPException, status


class StorageService:
    """Firebase Storage 파일 업로드/삭제 서비스"""
    
    def __init__(self):
        self.bucket_name = os.getenv('FIREBASE_STORAGE_BUCKET', 'clubatlas-ecaa4.firebasestorage.app')
        self._bucket = None

    def _get_bucket(self):
        """Storage 버킷 가져오기 (Lazy 로딩)"""
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
        파일을 Firebase Storage에 업로드
        
        Args:
            file: 업로드할 파일
            folder: 저장할 폴더 (예: 'club-logos', 'club-banners')
            club_id: 동아리 ID (경로에 포함)
            allowed_types: 허용된 MIME 타입 리스트
            
        Returns:
            업로드된 파일의 Public URL
        """
        bucket = self._get_bucket()

        # 파일 타입 검증
        if allowed_types and file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        # 파일 크기 제한 (5MB)
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5MB limit"
            )
        
        try:
            # 파일 확장자 추출
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ''
            
            # 고유한 파일명 생성
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # 저장 경로 생성
            if club_id:
                blob_path = f"{folder}/{club_id}/{unique_filename}"
            else:
                blob_path = f"{folder}/{unique_filename}"
            
            # Storage에 업로드
            blob = bucket.blob(blob_path)
            blob.upload_from_string(
                file_content,
                content_type=file.content_type
            )
            
            # Public 읽기 권한 설정
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
        Firebase Storage에서 파일 삭제
        
        Args:
            file_url: 삭제할 파일의 Public URL
            
        Returns:
            삭제 성공 여부
        """
        try:
            bucket = self._get_bucket()
        except Exception:
            return False

        try:
            # URL에서 blob 경로 추출
            # 예: https://storage.googleapis.com/bucket-name/path/to/file.jpg
            # -> path/to/file.jpg
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
        """URL에서 blob 경로 추출"""
        try:
            # https://storage.googleapis.com/bucket-name/ 이후의 경로 추출
            if 'storage.googleapis.com' in file_url:
                parts = file_url.split(f'{self.bucket_name}/')
                if len(parts) > 1:
                    return parts[1]
            return None
        except Exception:
            return None


# 전역 서비스 인스턴스
storage_service = StorageService()
