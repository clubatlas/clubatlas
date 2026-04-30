"""
Recommendations API 엔드포인트
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime

from app.models.recommendation import (
    RecommendationResult,
    RecommendationResponse,
    ClubRecommendation
)
from app.models.user import RecommendationPreferences
from app.api.dependencies import get_current_user
from app.services.recommendation_service import recommendation_service
from app.services.firestore_service import FirestoreService

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])
firestore_service = FirestoreService()


@router.get("", response_model=RecommendationResponse)
async def get_recommendations(
    limit: int = Query(10, ge=1, le=50, description="추천 개수"),
    current_user: dict = Depends(get_current_user)
):
    """
    사용자 맞춤형 동아리 추천
    
    - 사용자의 선호도 정보 기반
    - Hybrid Collaborative Filtering 알고리즘 사용
    - Content-based (75%) + Collaborative (25%)
    """
    user_id = current_user['uid']
    
    # 사용자 프로필에서 추천 선호도 가져오기
    user_profile = await firestore_service.get_document('users', user_id)
    
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # 추천 선호도 확인
    rec_prefs_data = user_profile.get('recommendation_preferences')
    
    if not rec_prefs_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recommendation preferences are not set. Please set your preferences on the AI Recommendations page first."
        )
    
    # RecommendationPreferences 객체 생성
    preferences = RecommendationPreferences(
        preferred_categories=rec_prefs_data.get('preferred_categories', []),
        preferred_activity_types=rec_prefs_data.get('preferred_activity_types', []),
        available_time_slots=rec_prefs_data.get('available_time_slots', []),
        last_updated=rec_prefs_data.get('last_updated'),
        source=rec_prefs_data.get('source', 'profile')
    )
    
    # 추천 생성
    result = await recommendation_service.generate_recommendations(
        user_id=user_id,
        preferences=preferences,
        limit=limit
    )
    
    return RecommendationResponse(
        recommendations=result.recommendations,
        total=len(result.recommendations),
        generated_at=result.generated_at,
        algorithm_version=result.algorithm_version
    )


@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_recommendation_result(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    추천 결과를 Firestore에 저장
    
    - 추천 히스토리 기록
    - 나중에 분석 용도
    """
    user_id = current_user['uid']
    
    # 사용자 프로필에서 추천 선호도 가져오기
    user_profile = await firestore_service.get_document('users', user_id)
    
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    rec_prefs_data = user_profile.get('recommendation_preferences')
    
    if not rec_prefs_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recommendation preferences are not set"
        )
    
    preferences = RecommendationPreferences(
        preferred_categories=rec_prefs_data.get('preferred_categories', []),
        preferred_activity_types=rec_prefs_data.get('preferred_activity_types', []),
        available_time_slots=rec_prefs_data.get('available_time_slots', []),
        last_updated=rec_prefs_data.get('last_updated'),
        source=rec_prefs_data.get('source', 'profile')
    )
    
    # 추천 생성
    result = await recommendation_service.generate_recommendations(
        user_id=user_id,
        preferences=preferences,
        limit=limit
    )
    
    # Firestore에 저장
    recommendation_id = f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    recommendation_data = {
        'user_id': result.user_id,
        'recommendations': [rec.dict() for rec in result.recommendations],
        'generated_at': result.generated_at,
        'algorithm_version': result.algorithm_version,
        'preferences_used': result.preferences_used
    }
    
    await firestore_service.create_document(
        'recommendations',
        recommendation_id,
        recommendation_data
    )
    
    return {
        "message": "Recommendation result saved",
        "recommendation_id": recommendation_id,
        "total_recommendations": len(result.recommendations)
    }


@router.get("/history")
async def get_recommendation_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """
    사용자의 추천 히스토리 조회
    """
    user_id = current_user['uid']
    
    try:
        history = await firestore_service.query_documents(
            'recommendations',
            filters=[('user_id', '==', user_id)],
            order_by='generated_at',
            limit=limit
        )
        
        return {
            "user_id": user_id,
            "total": len(history),
            "history": history
        }
    
    except RuntimeError:
        # Firestore가 초기화되지 않은 경우
        return {
            "user_id": user_id,
            "total": 0,
            "history": []
        }


