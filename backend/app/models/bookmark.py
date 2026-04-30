"""
Bookmark 데이터 모델
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Bookmark(BaseModel):
    """북마크 정보"""
    id: Optional[str] = None
    user_id: str = Field(..., description="사용자 UID")
    club_id: str = Field(..., description="동아리 ID")
    created_at: Optional[datetime] = None


class BookmarkCreate(BaseModel):
    """북마크 생성 요청"""
    club_id: str


class BookmarkedClub(BaseModel):
    """북마크된 클럽 정보 (클럽 상세 포함)"""
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
    """북마크 목록 응답"""
    bookmarks: List[BookmarkedClub]
    total: int
