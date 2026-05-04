"""
Announcement data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Announcement(BaseModel):
    """Announcement information"""
    id: Optional[str] = None
    club_id: str = Field(..., description="Owning club ID")
    title: str = Field(..., description="Announcement title")
    content: str = Field(..., description="Announcement body")
    status: str = Field(default="active", description="Status: active, archived")
    created_by: str = Field(..., description="Creator UID")
    sent_to: int = Field(default=0, description="Number of subscribers notified")
    opens: int = Field(default=0, description="Number of opens")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AnnouncementCreate(BaseModel):
    """Announcement creation request"""
    club_id: str
    title: str
    content: str


class AnnouncementUpdate(BaseModel):
    """Announcement update request"""
    title: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None


class AnnouncementListResponse(BaseModel):
    """Announcement list response"""
    announcements: List[Announcement]
    total: int
