"""
Bookmark data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Bookmark(BaseModel):
    """Bookmark information"""
    id: Optional[str] = None
    user_id: str = Field(..., description="User UID")
    club_id: str = Field(..., description="Club ID")
    created_at: Optional[datetime] = None


class BookmarkCreate(BaseModel):
    """Bookmark creation request"""
    club_id: str


class BookmarkedClub(BaseModel):
    """Bookmarked club information (includes club details)"""
    bookmark_id: str
    club_id: str
    club_name: str
    club_tagline: Optional[str] = None
    club_description: str
    categories: List[str]
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    match_score: Optional[float] = None
    match_reason: Optional[str] = None
    bookmarked_at: datetime


class BookmarkListResponse(BaseModel):
    """Bookmark list response"""
    bookmarks: List[BookmarkedClub]
    total: int
