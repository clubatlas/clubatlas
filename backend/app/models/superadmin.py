"""
SuperAdmin-only data models
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class PlatformStatistics(BaseModel):
    """Platform-wide statistics"""
    total_clubs: int = Field(..., description="Total number of clubs")
    active_clubs: int = Field(..., description="Number of active clubs")
    inactive_clubs: int = Field(..., description="Number of inactive clubs")
    pending_clubs: int = Field(0, description="Number of clubs pending approval")
    total_leaders: int = Field(..., description="Total number of leaders")
    active_leaders: int = Field(..., description="Number of active leaders")
    pending_leader_requests: int = Field(0, description="Number of pending leader requests")
    total_students: int = Field(..., description="Total number of students")
    new_students_this_week: int = Field(0, description="New students this week")
    total_events: int = Field(..., description="Total number of events")
    upcoming_events: int = Field(0, description="Number of upcoming events")
    total_subscriptions: int = Field(..., description="Total number of subscriptions")


class PendingApprovalItem(BaseModel):
    """Pending approval item"""
    id: str
    type: str = Field(..., description="Type: club_request, leader_request, club_update")
    title: str
    subtitle: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


class PendingApprovalsResponse(BaseModel):
    """Pending approvals list response"""
    approvals: List[PendingApprovalItem]
    total: int


class ActivityLogItem(BaseModel):
    """Activity log item"""
    id: str
    type: str = Field(..., description="Type: club_created, event_posted, profile_updated, etc.")
    title: str
    subtitle: str
    timestamp: datetime
    is_new: bool = Field(default=False, description="Created within the last hour")


class RecentActivityResponse(BaseModel):
    """Recent activity response"""
    activities: List[ActivityLogItem]
    total: int


class SystemAlert(BaseModel):
    """System alert"""
    id: str
    message: str
    type: str = Field(..., description="success, warning, error, info")
    timestamp: datetime


class SystemAlertsResponse(BaseModel):
    """System alerts response"""
    alerts: List[SystemAlert]
    total: int


class ClubStatistics(BaseModel):
    """Club statistics"""
    active_clubs: int
    pending_approval: int
    total_subscribers: int


class StudentStatistics(BaseModel):
    """Student user statistics"""
    total_users: int
    active_this_month: int
    new_this_week: int
    avg_subscriptions: float


class StudentInfo(BaseModel):
    """Student user information"""
    uid: str
    display_name: Optional[str]
    email: str
    subscription_count: int
    created_at: Optional[datetime]


class StudentsListResponse(BaseModel):
    """Student user list response"""
    students: List[StudentInfo]
    total: int


class ActivityChartData(BaseModel):
    """Activity trend chart data"""
    labels: List[str] = Field(..., description="Date labels")
    datasets: List[Dict[str, Any]] = Field(..., description="Chart datasets")


class AnalyticsOverview(BaseModel):
    """Platform analytics overview"""
    total_page_views: int
    club_profile_views: int
    avg_engagement: float = Field(..., description="Average engagement rate (percentage)")
    avg_session_time: float = Field(..., description="Average session time (minutes)")


class TrafficChartData(BaseModel):
    """Traffic chart data"""
    labels: List[str]
    datasets: List[Dict[str, Any]]


class PopularClub(BaseModel):
    """Popular club"""
    rank: int
    club_id: str
    name: str
    views: int
    subscribers: int
    events: int


class PopularClubsResponse(BaseModel):
    """Popular clubs list"""
    clubs: List[PopularClub]
    total: int


class PlatformConfiguration(BaseModel):
    """Platform configuration"""
    id: str
    title: str
    description: str
    enabled: bool


class PlatformConfigurationsResponse(BaseModel):
    """Platform configurations list"""
    configurations: List[PlatformConfiguration]


class ConfigurationUpdateRequest(BaseModel):
    """Configuration update request"""
    enabled: bool


class SystemInformation(BaseModel):
    """System information"""
    version: str
    uptime: str
    database_size: str
    storage_used: str
    total_storage: str
    last_backup: Optional[datetime] = None


class BackupResponse(BaseModel):
    """Backup response"""
    message: str
    backup_id: str
    timestamp: datetime
    size: Optional[str] = None


class CacheResponse(BaseModel):
    """Cache response"""
    message: str
    cleared_items: int
    timestamp: datetime


class ClubDetailedInfo(BaseModel):
    """Club detailed information (SuperAdmin use)"""
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
    """Club list response (SuperAdmin use)"""
    clubs: List[ClubDetailedInfo]
    total: int
    page: int
    page_size: int


class ClubCreateBySuperAdmin(BaseModel):
    """Club creation (SuperAdmin use)"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    categories: List[str] = Field(..., min_items=1)
    activity_type: List[str]
    leader_email: Optional[str] = Field(None, description="Leader email (optional)")
    contact_email: Optional[str] = None
    tagline: Optional[str] = None


class ClubUpdateBySuperAdmin(BaseModel):
    """Club update (SuperAdmin use)"""
    name: Optional[str] = None
    description: Optional[str] = None
    categories: Optional[List[str]] = None
    activity_type: Optional[List[str]] = None
    is_active: Optional[bool] = None
    contact_email: Optional[str] = None
    tagline: Optional[str] = None
