"""
Club 데이터 모델
"""
from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class MeetingSchedule(BaseModel):
    """동아리 정기 모임 일정"""
    day: str = Field(..., description="요일: Monday, Tuesday, etc.")
    time_slots: List[str] = Field(..., description="시간대: ['16:00-18:00']")
    location: Optional[str] = None


class ClubLeader(BaseModel):
    """동아리 리더 정보"""
    uid: str
    name: str
    role: str = Field(..., description="President, Vice President, etc.")
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ClubStats(BaseModel):
    """동아리 통계"""
    total_members: int = 0
    total_subscribers: int = 0
    total_events: int = 0
    view_count: int = 0
    established_date: Optional[str] = None


class Club(BaseModel):
    """동아리 정보"""
    id: Optional[str] = None
    name: str = Field(..., description="동아리 이름")
    description: str = Field(..., description="동아리 설명")
    tagline: Optional[str] = Field(None, description="한 줄 소개")
    categories: List[str] = Field(..., description="동아리 카테고리 (복수)")
    tags: List[str] = Field(default_factory=list, description="태그")
    activity_type: List[str] = Field(..., description="활동 유형: Online, On-Campus, Off-Campus, Hybrid (복수 선택 가능)")
    meeting_schedule: Optional[List[MeetingSchedule]] = Field(default_factory=list)
    leaders: List[ClubLeader] = Field(default_factory=list)
    contact_email: Optional[str] = None
    website: Optional[str] = None
    social_media: Optional[str] = None
    stats: ClubStats = Field(default_factory=ClubStats)
    logo_url: Optional[HttpUrl] = None
    banner_url: Optional[HttpUrl] = None
    media_urls: List[HttpUrl] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = True


class ClubCreate(BaseModel):
    """동아리 생성 요청"""
    name: str
    description: str
    tagline: Optional[str] = None
    categories: List[str]
    tags: List[str] = Field(default_factory=list)
    activity_type: List[str]
    meeting_schedule: Optional[List[MeetingSchedule]] = Field(default_factory=list)
    contact_email: Optional[str] = None


class ClubUpdate(BaseModel):
    """동아리 업데이트 요청"""
    name: Optional[str] = None
    description: Optional[str] = None
    tagline: Optional[str] = None
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    activity_type: Optional[List[str]] = None
    meeting_schedule: Optional[List[MeetingSchedule]] = None
    leaders: Optional[List[ClubLeader]] = None
    contact_email: Optional[str] = None
    website: Optional[str] = None
    social_media: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None


class ClubListResponse(BaseModel):
    """동아리 목록 응답"""
    clubs: List[Club]
    total: int
    page: int
    page_size: int

