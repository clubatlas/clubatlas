"""
File Upload API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.api.dependencies import require_club_leader
from app.services.storage_service import storage_service
from app.services.firestore_service import user_service, club_service

router = APIRouter(prefix="/api/upload", tags=["upload"])

# 허용된 이미지 타입
ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
]


@router.post("/club-logo")
async def upload_club_logo(
    club_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 로고 업로드
    
    - 동아리 리더 전용
    - 자신이 관리하는 동아리만 가능
    - 이미지 파일만 허용 (jpg, png, gif, webp)
    - 최대 5MB
    """
    user_id = current_user['uid']
    
    # 권한 확인
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload logos for clubs you manage"
        )
    
    # 동아리 존재 확인
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        # 기존 로고가 있으면 삭제
        old_logo_url = club.get('logo_url')
        if old_logo_url:
            await storage_service.delete_file(old_logo_url)
        
        # 새 로고 업로드
        file_url = await storage_service.upload_file(
            file=file,
            folder='club-logos',
            club_id=club_id,
            allowed_types=ALLOWED_IMAGE_TYPES
        )
        
        # Firestore 업데이트
        await club_service.update_club(club_id, {'logo_url': file_url})
        
        return {
            "message": "Logo uploaded successfully",
            "file_url": file_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload logo error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload logo"
        )


@router.post("/club-banner")
async def upload_club_banner(
    club_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 배너 업로드
    
    - 동아리 리더 전용
    - 자신이 관리하는 동아리만 가능
    - 이미지 파일만 허용
    - 최대 5MB
    """
    user_id = current_user['uid']
    
    # 권한 확인
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload banners for clubs you manage"
        )
    
    # 동아리 존재 확인
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        # 기존 배너가 있으면 삭제
        old_banner_url = club.get('banner_url')
        if old_banner_url:
            await storage_service.delete_file(old_banner_url)
        
        # 새 배너 업로드
        file_url = await storage_service.upload_file(
            file=file,
            folder='club-banners',
            club_id=club_id,
            allowed_types=ALLOWED_IMAGE_TYPES
        )
        
        # Firestore 업데이트
        await club_service.update_club(club_id, {'banner_url': file_url})
        
        return {
            "message": "Banner uploaded successfully",
            "file_url": file_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload banner error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload banner"
        )


@router.post("/club-media")
async def upload_club_media(
    club_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 미디어(갤러리) 업로드
    
    - 동아리 리더 전용
    - 자신이 관리하는 동아리만 가능
    - 이미지 파일만 허용
    - 최대 5MB
    """
    user_id = current_user['uid']
    
    # 권한 확인
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload media for clubs you manage"
        )
    
    # 동아리 존재 확인
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        # 미디어 업로드
        file_url = await storage_service.upload_file(
            file=file,
            folder='club-media',
            club_id=club_id,
            allowed_types=ALLOWED_IMAGE_TYPES
        )
        
        # Firestore 업데이트 (media_urls 배열에 추가)
        media_urls = club.get('media_urls', [])
        media_urls.append(file_url)
        await club_service.update_club(club_id, {'media_urls': media_urls})
        
        return {
            "message": "Media uploaded successfully",
            "file_url": file_url
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload media error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media"
        )


@router.post("/leader-avatar")
async def upload_leader_avatar(
    club_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_club_leader)
):
    user_id = current_user['uid']

    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])

    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only upload avatars for clubs you manage"
        )

    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    try:
        file_url = await storage_service.upload_file(
            file=file,
            folder='leader-avatars',
            club_id=club_id,
            allowed_types=ALLOWED_IMAGE_TYPES
        )

        return {
            "message": "Leader avatar uploaded successfully",
            "file_url": file_url
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload leader avatar error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload leader avatar"
        )


@router.delete("/club-media")
async def delete_club_media(
    club_id: str,
    file_url: str,
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 미디어 삭제
    
    - 동아리 리더 전용
    - 자신이 관리하는 동아리만 가능
    """
    user_id = current_user['uid']
    
    # 권한 확인
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete media for clubs you manage"
        )
    
    # 동아리 존재 확인
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        # Storage에서 삭제
        await storage_service.delete_file(file_url)
        
        # Firestore 업데이트 (media_urls 배열에서 제거)
        media_urls = club.get('media_urls', [])
        if file_url in media_urls:
            media_urls.remove(file_url)
            await club_service.update_club(club_id, {'media_urls': media_urls})
        
        return {
            "message": "Media deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Delete media error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete media"
        )
