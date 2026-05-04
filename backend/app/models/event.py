"""
Event data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Event(BaseModel):
    """Event information"""
    id: Optional[str] = None
    club_id: str = Field(..., description="Owning club ID")
    title: str = Field(..., description="Event title")
    description: str = Field(..., description="Event description")
    event_type: str = Field(default="meeting", description="Event type: meeting, workshop, social, recruitment")
    start_datetime: datetime = Field(..., description="Start date/time")
    end_datetime: datetime = Field(..., description="End date/time")
    location: str = Field(..., description="Location")
    max_attendees: Optional[int] = Field(None, description="Maximum attendees")
    attendees: List[str] = Field(default_factory=list, description="Attendee UID list")
    status: str = Field(default="active", description="Status: active, cancelled, completed")
    created_by: str = Field(..., description="Creator UID")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class EventCreate(BaseModel):
    """Event creation request"""
    club_id: str
    title: str
    description: str
    event_type: str = "meeting"
    start_datetime: datetime
    end_datetime: datetime
    location: str
    max_attendees: Optional[int] = None


class EventUpdate(BaseModel):
    """Event update request"""
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None
    status: Optional[str] = None


class EventListResponse(BaseModel):
    """Event list response"""
    events: List[Event]
    total: int


class AttendanceRecord(BaseModel):
    """Attendance record"""
    event: Event
    status: str = Field(..., description="attended or missed")
    club_name: str = Field(..., description="Club name")


class AttendanceStats(BaseModel):
    """Attendance statistics"""
    total_events: int = Field(..., description="Total number of events")
    attended: int = Field(..., description="Number of events attended")
    missed: int = Field(..., description="Number of events missed")
    attendance_rate: float = Field(..., description="Attendance rate (0-100)")


class AttendanceHistoryResponse(BaseModel):
    """Attendance history response"""
    records: List[AttendanceRecord]
    stats: AttendanceStats
