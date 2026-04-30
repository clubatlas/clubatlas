"""
Announcement 데이터 모델
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Announcement(BaseModel):
    """공지사항 정보"""
    id: Optional[str] = None
    club_id: str = Field(..., description="소속 동아리 ID")
    title: str = Field(..., description="공지사항 제목")
    content: str = Field(..., description="공지사항 본문")
    status: str = Field(default="active", description="상태: active, archived")
    created_by: str = Field(..., description="생성자 UID")
    sent_to: int = Field(default=0, description="발송된 구독자 수")
    opens: int = Field(default=0, description="열람 수")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AnnouncementCreate(BaseModel):
    """공지사항 생성 요청"""
    club_id: str
    title: str
    content: str


class AnnouncementUpdate(BaseModel):
    """공지사항 업데이트 요청"""
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None


class AnnouncementListResponse(BaseModel):
    """공지사항 목록 응답"""
    announcements: List[Announcement]
    total: int
