"""
Recommendation data models
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class RecommendationReason(BaseModel):
    """Recommendation reason"""
    type: str = Field(..., description="Reason type: category_match, time_match, activity_type_match, etc.")
    description: str = Field(..., description="Reason description")
    score_contribution: float = Field(..., description="Contribution of this reason to the total score")


class ClubRecommendation(BaseModel):
    """Individual club recommendation"""
    club_id: str
    score: float = Field(..., ge=0.0, description="Recommendation score (0.0 to max 13.5)")
    reasons: List[RecommendationReason] = Field(..., description="List of recommendation reasons")
    rank: int = Field(..., description="Recommendation rank")


class RecommendationResult(BaseModel):
    """Recommendation result"""
    id: Optional[str] = None
    user_id: str
    recommendations: List[ClubRecommendation]
    generated_at: datetime = Field(default_factory=datetime.now)
    algorithm_version: str = Field(default="v1.0-rule-based", description="Algorithm version used")
    preferences_used: Optional[dict] = Field(None, description="Preferences used for generation")


class RecommendationGenerateRequest(BaseModel):
    """Recommendation generation request"""
    preferences_override: Optional[dict] = Field(None, description="Temporary preference override")
    limit: int = Field(default=10, ge=1, le=50, description="Number of recommendations")


class RecommendationQueryRequest(BaseModel):
    """Free-text recommendation query request"""
    query: str = Field(..., description="Natural language query")
    limit: int = Field(default=10, ge=1, le=50)


class RecommendationResponse(BaseModel):
    """Recommendation response"""
    recommendations: List[ClubRecommendation]
    total: int
    generated_at: datetime
    algorithm_version: str
