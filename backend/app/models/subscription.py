"""
Subscription data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Subscription(BaseModel):
    """Subscription information"""
    id: Optional[str] = None
    user_id: str = Field(..., description="Subscriber UID")
    club_id: str = Field(..., description="Club ID")
    subscribed_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = True
    notification_enabled: bool = True


class SubscriptionCreate(BaseModel):
    """Subscription creation request"""
    club_id: str


class SubscriptionUpdate(BaseModel):
    """Subscription update request"""
    notification_enabled: Optional[bool] = None


class SubscriptionResponse(BaseModel):
    """Subscription response"""
    id: str
    user_id: str
    club_id: str
    subscribed_at: datetime
    is_active: bool
    notification_enabled: bool


class SubscriptionListResponse(BaseModel):
    """Subscription list response"""
    subscriptions: List[SubscriptionResponse]
    total: int


class SubscriberResponse(BaseModel):
    """Subscriber response (admin use - includes user info)"""
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_display_name: Optional[str] = None
    club_id: str
    subscribed_at: datetime
    is_active: bool
    notification_enabled: bool


class SubscriberListResponse(BaseModel):
    """Subscriber list response (admin use)"""
    subscribers: List[SubscriberResponse]
    total: int
