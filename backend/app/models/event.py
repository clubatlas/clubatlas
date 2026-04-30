"""
Event 데이터 모델
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class Event(BaseModel):
    """이벤트 정보"""
    id: Optional[str] = None
    club_id: str = Field(..., description="소속 동아리 ID")
    title: str = Field(..., description="이벤트 제목")
    description: str = Field(..., description="이벤트 설명")
    event_type: str = Field(default="meeting", description="이벤트 유형: meeting, workshop, social, recruitment")
    start_datetime: datetime = Field(..., description="시작 일시")
    end_datetime: datetime = Field(..., description="종료 일시")
    location: str = Field(..., description="장소")
    max_attendees: Optional[int] = Field(None, description="최대 참석 인원")
    attendees: List[str] = Field(default_factory=list, description="참석자 UID 목록")
    status: str = Field(default="active", description="상태: active, cancelled, completed")
    created_by: str = Field(..., description="생성자 UID")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class EventCreate(BaseModel):
    """이벤트 생성 요청"""
    club_id: str
    title: str
    description: str
    event_type: str = "meeting"
    start_datetime: datetime
    end_datetime: datetime
    location: str
    max_attendees: Optional[int] = None


class EventUpdate(BaseModel):
    """이벤트 업데이트 요청"""
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    location: Optional[str] = None
    max_attendees: Optional[int] = None
    status: Optional[str] = None


class EventListResponse(BaseModel):
    """이벤트 목록 응답"""
    events: List[Event]
    total: int


class AttendanceRecord(BaseModel):
    """출석 기록"""
    event: Event
    status: str = Field(..., description="attended or missed")
    club_name: str = Field(..., description="동아리 이름")


class AttendanceStats(BaseModel):
    """출석 통계"""
    total_events: int = Field(..., description="전체 이벤트 수")
    attended: int = Field(..., description="참석한 이벤트 수")
    missed: int = Field(..., description="불참한 이벤트 수")
    attendance_rate: float = Field(..., description="출석률 (0-100)")


class AttendanceHistoryResponse(BaseModel):
    """출석 이력 응답"""
    records: List[AttendanceRecord]
    stats: AttendanceStats


