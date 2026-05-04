"""
Notification data models
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class NotificationCreate(BaseModel):
    """Notification creation request"""
    user_id: str = Field(..., description="Recipient UID")
    type: str = Field(..., description="Notification type: event, announcement, subscription, general")
    title: str = Field(..., description="Notification title")
    content: str = Field(..., description="Notification content")
    club_id: Optional[str] = Field(None, description="Related club ID")
    club_name: Optional[str] = Field(None, description="Related club name")
    reference_id: Optional[str] = Field(None, description="Related event/announcement ID")
    link: Optional[str] = Field(None, description="Link URL")


class Notification(BaseModel):
    """Notification"""
    id: Optional[str] = None
    user_id: str
    type: str
    title: str
    content: str
    club_id: Optional[str] = None
    club_name: Optional[str] = None
    reference_id: Optional[str] = None
    link: Optional[str] = None
    is_read: bool = Field(default=False, description="Read status")
    created_at: Optional[datetime] = None


class NotificationResponse(BaseModel):
    """Notification response"""
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
    """Notification list response"""
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
