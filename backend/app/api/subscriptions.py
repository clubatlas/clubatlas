"""
Subscriptions API 엔드포인트
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.subscription import (
    SubscriptionCreate,
    SubscriptionResponse,
    SubscriptionListResponse,
    SubscriptionUpdate,
    SubscriberResponse,
    SubscriberListResponse
)
from app.api.dependencies import get_current_user, require_club_leader
from app.services.firestore_service import subscription_service, club_service, user_service

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_to_club(
    subscription_data: SubscriptionCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    동아리 구독
    
    - 인증된 사용자 전용
    - 중복 구독 방지
    - 동아리 통계 자동 업데이트
    """
    user_id = current_user['uid']
    club_id = subscription_data.club_id
    
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        subscription = await subscription_service.subscribe_to_club(user_id, club_id)
        
        return SubscriptionResponse(
            id=subscription['id'],
            user_id=subscription['user_id'],
            club_id=subscription['club_id'],
            subscribed_at=subscription['subscribed_at'],
            is_active=subscription['is_active'],
            notification_enabled=subscription['notification_enabled']
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Subscribe error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to subscribe to club"
        )


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe_from_club(
    club_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    동아리 구독 취소
    
    - 인증된 사용자 전용
    - 동아리 통계 자동 업데이트
    """
    user_id = current_user['uid']
    
    try:
        await subscription_service.unsubscribe_from_club(user_id, club_id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Unsubscribe error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsubscribe from club"
        )


@router.get("/my", response_model=SubscriptionListResponse)
async def get_my_subscriptions(
    current_user: dict = Depends(get_current_user)
):
    """
    내 구독 목록 조회
    
    - 인증된 사용자 전용
    - 활성 구독만 반환
    """
    user_id = current_user['uid']
    
    try:
        subscriptions = await subscription_service.get_user_subscriptions(
            user_id,
            active_only=True
        )
        
        subscription_responses = [
            SubscriptionResponse(
                id=sub['id'],
                user_id=sub['user_id'],
                club_id=sub['club_id'],
                subscribed_at=sub['subscribed_at'],
                is_active=sub['is_active'],
                notification_enabled=sub['notification_enabled']
            )
            for sub in subscriptions
        ]
        
        return SubscriptionListResponse(
            subscriptions=subscription_responses,
            total=len(subscription_responses)
        )
    except Exception as e:
        print(f"Get subscriptions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscriptions"
        )


@router.get("/check/{club_id}")
async def check_subscription(
    club_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    특정 동아리 구독 여부 확인
    
    - 인증된 사용자 전용
    """
    user_id = current_user['uid']
    
    try:
        subscription = await subscription_service.get_user_subscription(user_id, club_id)
        
        is_subscribed = subscription is not None and subscription.get('is_active', False)
        
        return {
            "is_subscribed": is_subscribed,
            "club_id": club_id
        }
    except Exception as e:
        print(f"Check subscription error: {e}")
        return {
            "is_subscribed": False,
            "club_id": club_id
        }


@router.put("/{club_id}/notifications", response_model=SubscriptionResponse)
async def update_notification_settings(
    club_id: str,
    settings: SubscriptionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    알림 설정 업데이트
    
    - 인증된 사용자 전용
    """
    user_id = current_user['uid']
    
    if settings.notification_enabled is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="notification_enabled is required"
        )
    
    try:
        subscription = await subscription_service.update_notification_settings(
            user_id,
            club_id,
            settings.notification_enabled
        )
        
        return SubscriptionResponse(
            id=subscription['id'],
            user_id=subscription['user_id'],
            club_id=subscription['club_id'],
            subscribed_at=subscription['subscribed_at'],
            is_active=subscription['is_active'],
            notification_enabled=subscription['notification_enabled']
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Update notification settings error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification settings"
        )


@router.get("/clubs/{club_id}/subscribers", response_model=SubscriberListResponse)
async def get_club_subscribers(
    club_id: str,
    current_user: dict = Depends(require_club_leader)
):
    """
    동아리 구독자 목록 조회
    
    - 동아리 리더 또는 관리자 전용
    - 사용자 정보(이메일, 이름) 포함
    """
    user_id = current_user['uid']
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view subscribers for clubs you manage"
        )
    
    try:
        subscriptions = await subscription_service.get_club_subscribers(
            club_id,
            active_only=True
        )
        
        subscriber_responses = []
        for sub in subscriptions:
            user_profile_data = await user_service.get_user_profile(sub['user_id'])
            
            subscriber_responses.append(
                SubscriberResponse(
                    id=sub['id'],
                    user_id=sub['user_id'],
                    user_email=user_profile_data.get('email') if user_profile_data else None,
                    user_display_name=user_profile_data.get('display_name') if user_profile_data else None,
                    club_id=sub['club_id'],
                    subscribed_at=sub['subscribed_at'],
                    is_active=sub['is_active'],
                    notification_enabled=sub['notification_enabled']
                )
            )
        
        return SubscriberListResponse(
            subscribers=subscriber_responses,
            total=len(subscriber_responses)
        )
    except Exception as e:
        print(f"Get club subscribers error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get club subscribers"
        )
