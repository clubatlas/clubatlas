"""
User data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class RecommendationPreferences(BaseModel):
    """User preferences for AI recommendations"""
    preferred_categories: List[str] = Field(default_factory=list, description="Preferred club categories")
    preferred_activity_types: List[str] = Field(default_factory=list, description="Preferred activity types")
    available_time_slots: List[str] = Field(default_factory=list, description="Available time slots")
    last_updated: Optional[datetime] = None
    source: str = Field(default="profile", description="Collection source: ai-form or profile")


class UserProfile(BaseModel):
    """User profile"""
    uid: str = Field(..., description="Firebase UID")
    email: EmailStr
    display_name: Optional[str] = None
    role: str = Field(default="student", description="Role: student, club-leader, admin, super-admin")
    interests: List[str] = Field(default_factory=list, description="Interest tags")
    recommendation_preferences: Optional[RecommendationPreferences] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProfileCreate(BaseModel):
    """User profile creation request"""
    display_name: str
    interests: List[str] = Field(default_factory=list)


class UserProfileUpdate(BaseModel):
    """User profile update request"""
    display_name: Optional[str] = None
    interests: Optional[List[str]] = None


class ProfileEditRequest(BaseModel):
    """Fields editable from the Edit Profile modal"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    student_id: Optional[str] = None


class RecommendationPreferencesUpdate(BaseModel):
    """Recommendation preferences update request"""
    preferred_categories: List[str] = Field(..., description="Preferred categories (multi-select)")
    preferred_activity_types: List[str] = Field(..., description="Preferred activity types (multi-select)")
    available_time_slots: List[str] = Field(..., description="Available time slots (multi-select)")


class NotificationPreferencesUpdate(BaseModel):
    """Notification preferences update request"""
    email_notifications: bool
    event_reminders: bool


class UserNotificationPreferences(BaseModel):
    """User notification preferences"""
    email_notifications: bool = True
    event_reminders: bool = True


class UserProfileResponse(BaseModel):
    """User profile response"""
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
