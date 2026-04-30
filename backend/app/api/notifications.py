"""
Notifications API 엔드포인트
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.models.notification import (
    NotificationResponse,
    NotificationListResponse
)
from app.api.dependencies import get_current_user
from app.services.firestore_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_my_notifications(
    limit: int = Query(50, ge=1, le=100, description="조회할 알림 개수"),
    unread_only: bool = Query(False, description="읽지 않은 알림만 조회"),
    current_user: dict = Depends(get_current_user)
):
    """
    내 알림 목록 조회
    
    - 최신순으로 정렬
    - 읽지 않은 알림만 필터링 가능
    """
    user_id = current_user['uid']
    
    try:
        notifications = await notification_service.get_user_notifications(
            user_id=user_id,
            limit=limit,
            unread_only=unread_only
        )
        
        unread_count = await notification_service.count_unread(user_id)
        
        notification_responses = [
            NotificationResponse(
                id=notif['id'],
                user_id=notif['user_id'],
                type=notif['type'],
                title=notif['title'],
                content=notif['content'],
                club_id=notif.get('club_id'),
                club_name=notif.get('club_name'),
                reference_id=notif.get('reference_id'),
                link=notif.get('link'),
                is_read=notif.get('is_read', False),
                created_at=notif['created_at']
            )
            for notif in notifications
        ]
        
        return NotificationListResponse(
            notifications=notification_responses,
            total=len(notification_responses),
            unread_count=unread_count
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user)
):
    """
    읽지 않은 알림 개수 조회
    """
    user_id = current_user['uid']
    
    try:
        count = await notification_service.count_unread(user_id)
        return {"unread_count": count}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread count: {str(e)}"
        )


@router.put("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    알림을 읽음으로 표시
    """
    user_id = current_user['uid']
    
    try:
        notification = await notification_service.get_document(
            notification_service.COLLECTION,
            notification_id
        )
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        if notification['user_id'] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this notification"
            )
        
        await notification_service.mark_as_read(notification_id)
        
        return {"message": "Notification marked as read"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )


@router.put("/read-all")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user)
):
    """
    모든 알림을 읽음으로 표시
    """
    user_id = current_user['uid']
    
    try:
        count = await notification_service.mark_all_as_read(user_id)
        
        return {
            "message": "All notifications marked as read",
            "count": count
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    알림 삭제
    """
    user_id = current_user['uid']
    
    try:
        notification = await notification_service.get_document(
            notification_service.COLLECTION,
            notification_id
        )
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        if notification['user_id'] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this notification"
            )
        
        await notification_service.delete_notification(notification_id)
        
        return {"message": "Notification deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete notification: {str(e)}"
        )
