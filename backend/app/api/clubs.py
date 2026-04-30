"""
Clubs API 엔드포인트
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.club import (
    Club,
    ClubCreate,
    ClubUpdate,
    ClubListResponse
)
from app.api.dependencies import get_current_user, require_admin, require_club_leader, get_current_user_optional
from app.services.firestore_service import club_service, user_service, subscription_service
import uuid

router = APIRouter(prefix="/api/clubs", tags=["clubs"])


@router.get("", response_model=ClubListResponse)
async def get_clubs(
    categories: Optional[str] = Query(None, description="쉼표로 구분된 카테고리"),
    activity_type: Optional[str] = Query(None, description="활동 유형"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(20, ge=1, le=1000, description="페이지 크기"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    동아리 목록 조회
    
    - 필터링: 카테고리, 활동 유형
    - 페이징 지원
    - 인증 선택적 (로그인하지 않아도 조회 가능)
    """
    try:
        category_list = None
        if categories:
            category_list = [c.strip() for c in categories.split(',')]
        
        offset = (page - 1) * page_size
        
        clubs, total = await club_service.get_clubs(
            categories=category_list,
            activity_type=activity_type,
            limit=page_size,
            offset=offset
        )
        
        club_objects = []
        for club_data in clubs:
            club_objects.append(Club(
                id=club_data['id'],
                name=club_data['name'],
                description=club_data['description'],
                tagline=club_data.get('tagline'),
                categories=club_data['categories'],
                tags=club_data.get('tags', []),
                activity_type=club_data['activity_type'],
                meeting_schedule=club_data.get('meeting_schedule'),
                leaders=club_data.get('leaders', []),
                contact_email=club_data.get('contact_email'),
                website=club_data.get('website'),
                social_media=club_data.get('social_media'),
                stats=club_data.get('stats', {}),
                logo_url=club_data.get('logo_url'),
                banner_url=club_data.get('banner_url'),
                media_urls=club_data.get('media_urls', []),
                created_at=club_data.get('created_at'),
                updated_at=club_data.get('updated_at'),
                is_active=club_data.get('is_active', True)
            ))
        
        return ClubListResponse(
            clubs=club_objects,
            total=total,
            page=page,
            page_size=page_size
        )
    except RuntimeError:
        return ClubListResponse(
            clubs=[],
            total=0,
            page=page,
            page_size=page_size
        )


@router.get("/{club_id}", response_model=Club)
async def get_club(
    club_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    동아리 상세 조회
    
    - 조회 시 view_count 증가
    """
    club_data = await club_service.get_club(club_id)
    
    if not club_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    await club_service.increment_view_count(club_id)

    try:
        active_subscribers = await subscription_service.get_club_subscribers(club_id, active_only=True)
        live_subscriber_count = len(active_subscribers)
    except Exception:
        live_subscriber_count = None

    raw_stats = club_data.get('stats', {}) or {}
    if live_subscriber_count is not None:
        raw_stats = dict(raw_stats)
        raw_stats['total_subscribers'] = live_subscriber_count

    return Club(
        id=club_data['id'],
        name=club_data['name'],
        description=club_data['description'],
        tagline=club_data.get('tagline'),
        categories=club_data['categories'],
        tags=club_data.get('tags', []),
        activity_type=club_data['activity_type'],
        meeting_schedule=club_data.get('meeting_schedule'),
        leaders=club_data.get('leaders', []),
        contact_email=club_data.get('contact_email'),
        website=club_data.get('website'),
        social_media=club_data.get('social_media'),
        stats=raw_stats,
        logo_url=club_data.get('logo_url'),
        banner_url=club_data.get('banner_url'),
        media_urls=club_data.get('media_urls', []),
        created_at=club_data.get('created_at'),
        updated_at=club_data.get('updated_at'),
        is_active=club_data.get('is_active', True)
    )


@router.post("", response_model=Club, status_code=status.HTTP_201_CREATED)
async def create_club(
    club_data: ClubCreate,
    current_user: dict = Depends(require_admin)
):
    """
    동아리 생성
    
    - 관리자 전용
    """
    club_id = str(uuid.uuid4())
    
    created_club = await club_service.create_club(
        club_id=club_id,
        name=club_data.name,
        description=club_data.description,
        categories=club_data.categories,
        activity_type=club_data.activity_type,
        tagline=club_data.tagline,
        tags=club_data.tags,
        meeting_schedule=club_data.meeting_schedule.dict() if club_data.meeting_schedule else None,
        contact_email=club_data.contact_email
    )
    
    return Club(
        id=created_club['id'],
        name=created_club['name'],
        description=created_club['description'],
        tagline=created_club.get('tagline'),
        categories=created_club['categories'],
        tags=created_club.get('tags', []),
        activity_type=created_club['activity_type'],
        meeting_schedule=created_club.get('meeting_schedule'),
        leaders=created_club.get('leaders', []),
        contact_email=created_club.get('contact_email'),
        website=created_club.get('website'),
        social_media=created_club.get('social_media'),
        stats=created_club.get('stats', {}),
        logo_url=created_club.get('logo_url'),
        banner_url=created_club.get('banner_url'),
        media_urls=created_club.get('media_urls', []),
        created_at=created_club.get('created_at'),
        updated_at=created_club.get('updated_at'),
        is_active=created_club.get('is_active', True)
    )


@router.put("/{club_id}", response_model=Club)
async def update_club(
    club_id: str,
    club_update: ClubUpdate,
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 정보 수정
    
    - 동아리 리더 전용
    - 자신이 관리하는 동아리만 수정 가능
    """
    user_id = current_user['uid']
    
    existing_club = await club_service.get_club(club_id)
    
    if not existing_club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    # 권한 확인
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update clubs you manage"
        )
    
    update_data = club_update.dict(exclude_unset=True)
    
    if 'meeting_schedule' in update_data and update_data['meeting_schedule']:
        update_data['meeting_schedule'] = update_data['meeting_schedule']
    
    updated_club = await club_service.update_club(club_id, update_data)
    
    return Club(
        id=updated_club['id'],
        name=updated_club['name'],
        description=updated_club['description'],
        tagline=updated_club.get('tagline'),
        categories=updated_club['categories'],
        tags=updated_club.get('tags', []),
        activity_type=updated_club['activity_type'],
        meeting_schedule=updated_club.get('meeting_schedule'),
        leaders=updated_club.get('leaders', []),
        contact_email=updated_club.get('contact_email'),
        website=updated_club.get('website'),
        social_media=updated_club.get('social_media'),
        stats=updated_club.get('stats', {}),
        logo_url=updated_club.get('logo_url'),
        banner_url=updated_club.get('banner_url'),
        media_urls=updated_club.get('media_urls', []),
        created_at=updated_club.get('created_at'),
        updated_at=updated_club.get('updated_at'),
        is_active=updated_club.get('is_active', True)
    )


@router.get("/my/managed", response_model=Club)
async def get_my_managed_club(
    current_user: dict = Depends(require_club_leader)
):
    """
    내가 관리하는 동아리 조회
    
    - 동아리 리더 전용
    - 자신이 관리하는 첫 번째 동아리 반환
    """
    user_id = current_user['uid']
    
    try:
        user_profile = await user_service.get_user_profile(user_id)
        managed_clubs = user_profile.get('managed_club_ids', [])
        
        if not managed_clubs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No managed clubs found"
            )
        
        club_id = managed_clubs[0]
        club_data = await club_service.get_club(club_id)
        
        if not club_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )
        
        return Club(
            id=club_data['id'],
            name=club_data['name'],
            description=club_data['description'],
            tagline=club_data.get('tagline'),
            categories=club_data['categories'],
            tags=club_data.get('tags', []),
            activity_type=club_data['activity_type'],
            meeting_schedule=club_data.get('meeting_schedule'),
            leaders=club_data.get('leaders', []),
            contact_email=club_data.get('contact_email'),
            website=club_data.get('website'),
            social_media=club_data.get('social_media'),
            stats=club_data.get('stats', {}),
            logo_url=club_data.get('logo_url'),
            banner_url=club_data.get('banner_url'),
            media_urls=club_data.get('media_urls', []),
            created_at=club_data.get('created_at'),
            updated_at=club_data.get('updated_at'),
            is_active=club_data.get('is_active', True)
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Get managed club error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get managed club"
        )


@router.get("/{club_id}/stats")
async def get_club_stats(
    club_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    동아리 통계 조회
    
    - 리더가 자신의 동아리 통계 확인
    """
    club_data = await club_service.get_club(club_id)
    
    if not club_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    return {
        "club_id": club_id,
        "stats": club_data.get('stats', {})
    }

