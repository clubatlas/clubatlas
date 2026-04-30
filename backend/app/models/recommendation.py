"""
Recommendation 데이터 모델
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class RecommendationReason(BaseModel):
    """추천 이유"""
    type: str = Field(..., description="이유 타입: category_match, time_match, activity_type_match, etc.")
    description: str = Field(..., description="이유 설명")
    score_contribution: float = Field(..., description="이 이유가 총 점수에 기여한 비율")


class ClubRecommendation(BaseModel):
    """개별 동아리 추천"""
    club_id: str
    score: float = Field(..., ge=0.0, description="추천 점수 (0.0 ~ 최대 13.5)")
    reasons: List[RecommendationReason] = Field(..., description="추천 이유 목록")
    rank: int = Field(..., description="추천 순위")


class RecommendationResult(BaseModel):
    """추천 결과"""
    id: Optional[str] = None
    user_id: str
    recommendations: List[ClubRecommendation]
    generated_at: datetime = Field(default_factory=datetime.now)
    algorithm_version: str = Field(default="v1.0-rule-based", description="사용된 알고리즘 버전")
    preferences_used: Optional[dict] = Field(None, description="사용된 선호도 정보")


class RecommendationGenerateRequest(BaseModel):
    """추천 생성 요청"""
    preferences_override: Optional[dict] = Field(None, description="임시 선호도 오버라이드")
    limit: int = Field(default=10, ge=1, le=50, description="추천 개수")


class RecommendationQueryRequest(BaseModel):
    """자유 텍스트 추천 쿼리 요청"""
    query: str = Field(..., description="자연어 쿼리")
    limit: int = Field(default=10, ge=1, le=50)


class RecommendationResponse(BaseModel):
    """추천 응답"""
    recommendations: List[ClubRecommendation]
    total: int
    generated_at: datetime
    algorithm_version: str

