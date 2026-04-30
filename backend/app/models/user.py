"""
User 데이터 모델
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RecommendationPreferences(BaseModel):
    """AI 추천을 위한 사용자 선호도"""
    preferred_categories: List[str] = Field(default_factory=list, description="선호하는 동아리 카테고리")
    preferred_activity_types: List[str] = Field(default_factory=list, description="선호하는 활동 유형")
    available_time_slots: List[str] = Field(default_factory=list, description="활동 가능한 시간대")
    last_updated: Optional[datetime] = None
    source: str = Field(default="profile", description="수집 출처: ai-form 또는 profile")


class UserProfile(BaseModel):
    """사용자 프로필"""
    uid: str = Field(..., description="Firebase UID")
    email: EmailStr
    display_name: Optional[str] = None
    role: str = Field(default="student", description="역할: student, club-leader, admin, super-admin")
    interests: List[str] = Field(default_factory=list, description="관심사 태그")
    recommendation_preferences: Optional[RecommendationPreferences] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProfileCreate(BaseModel):
    """사용자 프로필 생성 요청"""
    display_name: str
    interests: List[str] = Field(default_factory=list)


class UserProfileUpdate(BaseModel):
    """사용자 프로필 업데이트 요청"""
    display_name: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileEditRequest(BaseModel):
    """Edit Profile 모달에서 수정 가능한 필드"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    student_id: Optional[str] = None


class RecommendationPreferencesUpdate(BaseModel):
    """추천 선호도 업데이트 요청"""
    preferred_categories: List[str] = Field(..., description="선호하는 카테고리 (복수 선택)")
    preferred_activity_types: List[str] = Field(..., description="선호하는 활동 유형 (복수 선택)")
    available_time_slots: List[str] = Field(..., description="활동 가능한 시간대 (복수 선택)")


class NotificationPreferencesUpdate(BaseModel):
    """알림 설정 업데이트 요청"""
    email_notifications: bool
    event_reminders: bool


class UserNotificationPreferences(BaseModel):
    """사용자 알림 설정"""
    email_notifications: bool = True
    event_reminders: bool = True


class UserProfileResponse(BaseModel):
    """사용자 프로필 응답"""
    uid: str
    email: str
    display_name: Optional[str]
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    student_id: Optional[str] = None
    interests: List[str]
    recommendation_preferences: Optional[RecommendationPreferences]
    notification_preferences: Optional[UserNotificationPreferences] = None
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


