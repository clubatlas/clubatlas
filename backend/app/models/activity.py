"""
UserActivity data models
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserActivity(BaseModel):
    """User activity tracking"""
    id: Optional[str] = None
    user_id: str = Field(..., description="User UID")
    activity_type: str = Field(..., description="Activity type: view, click, subscribe, unsubscribe, attend")
    club_id: Optional[str] = Field(None, description="Related club ID")
    event_id: Optional[str] = Field(None, description="Related event ID")
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional metadata")
    timestamp: datetime = Field(default_factory=datetime.now)


class ActivityTrackRequest(BaseModel):
    """Activity tracking request"""
    activity_type: str = Field(..., description="Activity type")
    club_id: Optional[str] = None
    event_id: Optional[str] = None
    metadata: Optional[dict] = None


class ActivityStatsResponse(BaseModel):
    """User activity statistics response"""
    total_views: int
    total_clicks: int
    total_subscriptions: int
    viewed_clubs: list
    clicked_clubs: list
