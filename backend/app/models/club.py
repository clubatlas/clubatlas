"""
Club data models
"""
from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl


class MeetingSchedule(BaseModel):
    """Club regular meeting schedule"""
    day: str = Field(..., description="Day of week: Monday, Tuesday, etc.")
    time_slots: List[str] = Field(..., description="Time slots: ['16:00-18:00']")
    location: Optional[str] = None


class ClubLeader(BaseModel):
    """Club leader information"""
    uid: str
    name: str
    role: str = Field(..., description="President, Vice President, etc.")
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class ClubStats(BaseModel):
    """Club statistics"""
    total_members: int = 0
    total_subscribers: int = 0
    total_events: int = 0
    view_count: int = 0
    established_date: Optional[str] = None


class Club(BaseModel):
    """Club information"""
    id: Optional[str] = None
    name: str = Field(..., description="Club name")
    description: str = Field(..., description="Club description")
    tagline: Optional[str] = Field(None, description="One-line tagline")
    categories: List[str] = Field(..., description="Club categories (multiple allowed)")
    tags: List[str] = Field(default_factory=list, description="Tags")
    activity_type: List[str] = Field(..., description="Activity types: Online, On-Campus, Off-Campus, Hybrid (multiple allowed)")
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
    """Club creation request"""
    name: str
    description: str
    tagline: Optional[str] = None
    categories: List[str]
    tags: List[str] = Field(default_factory=list)
    activity_type: List[str]
    meeting_schedule: Optional[List[MeetingSchedule]] = Field(default_factory=list)
    contact_email: Optional[str] = None


class ClubUpdate(BaseModel):
    """Club update request"""
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
    """Club list response"""
    clubs: List[Club]
    total: int
    page: int
    page_size: int
