"""
UserActivity 데이터 모델
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserActivity(BaseModel):
    """사용자 활동 추적"""
    id: Optional[str] = None
    user_id: str = Field(..., description="사용자 UID")
    activity_type: str = Field(..., description="활동 유형: view, click, subscribe, unsubscribe, attend")
    club_id: Optional[str] = Field(None, description="관련 동아리 ID")
    event_id: Optional[str] = Field(None, description="관련 이벤트 ID")
    metadata: Optional[dict] = Field(default_factory=dict, description="추가 메타데이터")
    timestamp: datetime = Field(default_factory=datetime.now)


class ActivityTrackRequest(BaseModel):
    """활동 추적 요청"""
    activity_type: str = Field(..., description="활동 유형")
    club_id: Optional[str] = None
    event_id: Optional[str] = None
    metadata: Optional[dict] = None


class ActivityStatsResponse(BaseModel):
    """사용자 활동 통계 응답"""
    total_views: int
    total_clicks: int
    total_subscriptions: int
    viewed_clubs: list
    clicked_clubs: list


