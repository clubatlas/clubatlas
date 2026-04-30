"""
SuperAdmin 전용 데이터 모델
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class PlatformStatistics(BaseModel):
    """플랫폼 전체 통계"""
    total_clubs: int = Field(..., description="전체 클럽 수")
    active_clubs: int = Field(..., description="활성 클럽 수")
    inactive_clubs: int = Field(..., description="비활성 클럽 수")
    pending_clubs: int = Field(0, description="승인 대기 클럽 수")
    total_leaders: int = Field(..., description="전체 리더 수")
    active_leaders: int = Field(..., description="활성 리더 수")
    pending_leader_requests: int = Field(0, description="리더 승인 대기 수")
    total_students: int = Field(..., description="전체 학생 수")
    new_students_this_week: int = Field(0, description="이번 주 신규 학생")
    total_events: int = Field(..., description="전체 이벤트 수")
    upcoming_events: int = Field(0, description="예정된 이벤트 수")
    total_subscriptions: int = Field(..., description="전체 구독 수")


class PendingApprovalItem(BaseModel):
    """승인 대기 항목"""
    id: str
    type: str = Field(..., description="유형: club_request, leader_request, club_update")
    title: str
    subtitle: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class PendingApprovalsResponse(BaseModel):
    """승인 대기 목록 응답"""
    approvals: List[PendingApprovalItem]
    total: int


class ActivityLogItem(BaseModel):
    """활동 로그 항목"""
    id: str
    type: str = Field(..., description="유형: club_created, event_posted, profile_updated 등")
    title: str
    subtitle: str
    timestamp: datetime
    is_new: bool = Field(default=False, description="최근 1시간 이내 항목")


class RecentActivityResponse(BaseModel):
    """최근 활동 응답"""
    activities: List[ActivityLogItem]
    total: int


class SystemAlert(BaseModel):
    """시스템 알림"""
    id: str
    message: str
    type: str = Field(..., description="success, warning, error, info")
    timestamp: datetime


class SystemAlertsResponse(BaseModel):
    """시스템 알림 응답"""
    alerts: List[SystemAlert]
    total: int


class ClubStatistics(BaseModel):
    """클럽 통계"""
    active_clubs: int
    pending_approval: int
    total_subscribers: int


class StudentStatistics(BaseModel):
    """학생 사용자 통계"""
    total_users: int
    active_this_month: int
    new_this_week: int
    avg_subscriptions: float


class StudentInfo(BaseModel):
    """학생 사용자 정보"""
    uid: str
    display_name: Optional[str]
    email: str
    subscription_count: int
    created_at: Optional[datetime]


class StudentsListResponse(BaseModel):
    """학생 사용자 목록 응답"""
    students: List[StudentInfo]
    total: int


class ActivityChartData(BaseModel):
    """활동 추이 차트 데이터"""
    labels: List[str] = Field(..., description="날짜 레이블")
    datasets: List[Dict[str, Any]] = Field(..., description="차트 데이터셋")


class AnalyticsOverview(BaseModel):
    """플랫폼 분석 개요"""
    total_page_views: int
    club_profile_views: int
    avg_engagement: float = Field(..., description="평균 참여율 (백분율)")
    avg_session_time: float = Field(..., description="평균 세션 시간 (분)")


class TrafficChartData(BaseModel):
    """트래픽 차트 데이터"""
    labels: List[str]
    datasets: List[Dict[str, Any]]


class PopularClub(BaseModel):
    """인기 클럽"""
    rank: int
    club_id: str
    name: str
    views: int
    subscribers: int
    events: int


class PopularClubsResponse(BaseModel):
    """인기 클럽 목록"""
    clubs: List[PopularClub]
    total: int


class PlatformConfiguration(BaseModel):
    """플랫폼 설정"""
    id: str
    title: str
    description: str
    enabled: bool


class PlatformConfigurationsResponse(BaseModel):
    """플랫폼 설정 목록"""
    configurations: List[PlatformConfiguration]


class ConfigurationUpdateRequest(BaseModel):
    """설정 업데이트 요청"""
    enabled: bool


class SystemInformation(BaseModel):
    """시스템 정보"""
    version: str
    uptime: str
    database_size: str
    storage_used: str
    total_storage: str
    last_backup: Optional[datetime] = None


class BackupResponse(BaseModel):
    """백업 응답"""
    message: str
    backup_id: str
    timestamp: datetime
    size: Optional[str] = None


class CacheResponse(BaseModel):
    """캐시 응답"""
    message: str
    cleared_items: int
    timestamp: datetime


class ClubDetailedInfo(BaseModel):
    """클럽 상세 정보 (SuperAdmin용)"""
    id: str
    name: str
    description: Optional[str]
    categories: List[str]
    activity_type: List[str]
    leader_name: Optional[str] = None
    leader_email: Optional[str] = None
    total_subscribers: int
    total_events: int
    status: str = Field(..., description="active, inactive, pending")
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class ClubListResponseDetailed(BaseModel):
    """클럽 목록 응답 (SuperAdmin용)"""
    clubs: List[ClubDetailedInfo]
    total: int
    page: int
    page_size: int


class ClubCreateBySuperAdmin(BaseModel):
    """클럽 생성 (SuperAdmin용)"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    categories: List[str] = Field(..., min_items=1)
    activity_type: List[str]
    leader_email: Optional[str] = Field(None, description="리더 이메일 (선택사항)")
    contact_email: Optional[str] = None
    tagline: Optional[str] = None


class ClubUpdateBySuperAdmin(BaseModel):
    """클럽 수정 (SuperAdmin용)"""
    name: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    activity_type: Optional[List[str]] = None
    is_active: Optional[bool] = None
    contact_email: Optional[str] = None
    tagline: Optional[str] = None
