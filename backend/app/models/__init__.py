"""
ClubAtlas 데이터 모델
"""
from app.models.user import (
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileResponse,
    RecommendationPreferences,
    RecommendationPreferencesUpdate,
)
from app.models.club import (
    Club,
    ClubCreate,
    ClubUpdate,
    ClubListResponse,
    MeetingSchedule,
    ClubLeader,
    ClubStats,
)
from app.models.event import (
    Event,
    EventCreate,
    EventUpdate,
    EventListResponse,
)
from app.models.subscription import (
    Subscription,
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SubscriptionListResponse,
)
from app.models.activity import (
    UserActivity,
    ActivityTrackRequest,
    ActivityStatsResponse,
)
from app.models.recommendation import (
    RecommendationResult,
    ClubRecommendation,
    RecommendationReason,
    RecommendationGenerateRequest,
    RecommendationQueryRequest,
    RecommendationResponse,
)

__all__ = [
    "UserProfile",
    "UserProfileCreate",
    "UserProfileUpdate",
    "UserProfileResponse",
    "RecommendationPreferences",
    "RecommendationPreferencesUpdate",
    "Club",
    "ClubCreate",
    "ClubUpdate",
    "ClubListResponse",
    "MeetingSchedule",
    "ClubLeader",
    "ClubStats",
    "Event",
    "EventCreate",
    "EventUpdate",
    "EventListResponse",
    "Subscription",
    "SubscriptionCreate",
    "SubscriptionUpdate",
    "SubscriptionResponse",
    "SubscriptionListResponse",
    "UserActivity",
    "ActivityTrackRequest",
    "ActivityStatsResponse",
    "RecommendationResult",
    "ClubRecommendation",
    "RecommendationReason",
    "RecommendationGenerateRequest",
    "RecommendationQueryRequest",
    "RecommendationResponse",
]
