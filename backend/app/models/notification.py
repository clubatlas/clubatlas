"""
Notification 데이터 모델
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    """알림 생성 요청"""
    user_id: str = Field(..., description="알림 수신자 UID")
    type: str = Field(..., description="알림 타입: event, announcement, subscription, general")
    title: str = Field(..., description="알림 제목")
    content: str = Field(..., description="알림 내용")
    club_id: Optional[str] = Field(None, description="관련 동아리 ID")
    club_name: Optional[str] = Field(None, description="관련 동아리 이름")
    reference_id: Optional[str] = Field(None, description="관련 이벤트/공지 ID")
    link: Optional[str] = Field(None, description="연결 링크")


class Notification(BaseModel):
    """알림"""
    id: Optional[str] = None
    user_id: str
    type: str
    title: str
    content: str
    club_id: Optional[str] = None
    club_name: Optional[str] = None
    reference_id: Optional[str] = None
    link: Optional[str] = None
    is_read: bool = Field(default=False, description="읽음 여부")
    created_at: Optional[datetime] = None


class NotificationResponse(BaseModel):
    """알림 응답"""
    id: str
    user_id: str
    type: str
    title: str
    content: str
    club_id: Optional[str]
    club_name: Optional[str]
    reference_id: Optional[str]
    link: Optional[str]
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    """알림 목록 응답"""
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
