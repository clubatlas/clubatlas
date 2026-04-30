"""
테스트용 추천 API (Mock 데이터 사용)
Firestore 없이 추천 시스템을 테스트할 수 있습니다.
"""
import json
import os
from typing import List
from fastapi import APIRouter, Query
from datetime import datetime

from app.models.recommendation import RecommendationResponse
from app.models.user import RecommendationPreferences
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/api/test/recommendations", tags=["test-recommendations"])

# 테스트 데이터 로드
TEST_DATA_PATH = os.path.join(
    os.path.dirname(__file__), 
    '../../scripts/test_data.json'
)

def load_test_data():
    """테스트 데이터 로드"""
    with open(TEST_DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_test_recommendations(
    user_id: str,
    limit: int = Query(10, ge=1, le=50, description="추천 개수")
):
    """
    테스트용 추천 API (Mock 데이터 사용)
    
    - Firestore 없이 추천 시스템 테스트 가능
    - 미리 정의된 테스트 사용자 사용
    
    **테스트 사용자 ID:**
    - `test_user_tech_lover`: 기술 관심
    - `test_user_arts_enthusiast`: 예술 관심
    - `test_user_science_geek`: 과학 관심
    """
    try:
        # 테스트 데이터 로드
        test_data = load_test_data()
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to load test data: {str(e)}")
    
    # 사용자 찾기
    user = None
    for u in test_data['users']:
        if u['uid'] == user_id:
            user = u
            break
    
    if not user:
        return RecommendationResponse(
            recommendations=[],
            total=0,
            generated_at=datetime.now(),
            algorithm_version="v1.0-hybrid-mock"
        )
    
    # 사용자 선호도 추출
    try:
        prefs_data = user.get('recommendation_preferences', {})
        preferences = RecommendationPreferences(
            preferred_categories=prefs_data.get('preferred_categories', []),
            preferred_activity_types=prefs_data.get('preferred_activity_types', []),
            available_time_slots=prefs_data.get('available_time_slots', []),
            source=prefs_data.get('source', 'profile')
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to create preferences: {str(e)}")
    
    # Mock 추천 서비스 실행
    try:
        result = await _generate_mock_recommendations(
            user_id=user_id,
            preferences=preferences,
            all_clubs=test_data['clubs'],
            all_activities=test_data['activities'],
            limit=limit
        )
    except Exception as e:
        from fastapi import HTTPException
        import traceback
        error_detail = f"Recommendation generation failed: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)
    
    return RecommendationResponse(
        recommendations=result.recommendations,
        total=len(result.recommendations),
        generated_at=result.generated_at,
        algorithm_version=result.algorithm_version
    )


async def _generate_mock_recommendations(
    user_id: str,
    preferences: RecommendationPreferences,
    all_clubs: List[dict],
    all_activities: List[dict],
    limit: int
):
    """
    Mock 데이터를 사용한 추천 생성
    (recommendation_service의 로직을 그대로 사용하되 Mock 데이터 사용)
    """
    from app.models.recommendation import (
        RecommendationResult,
        ClubRecommendation,
        RecommendationReason
    )
    from app.models.club import Club, MeetingSchedule
    
    # 각 동아리에 대해 점수 계산
    scored_clubs = []
    
    for club_data in all_clubs:
        try:
            # Club 객체 생성 (meeting_schedule은 dict로 전달)
            club = Club(
                id=club_data['id'],
                name=club_data['name'],
                description=club_data['description'],
                tagline=club_data.get('tagline'),
                categories=club_data['categories'],
                tags=club_data.get('tags', []),
                activity_type=club_data['activity_type'],
                meeting_schedule=club_data.get('meeting_schedule', []),
                leaders=club_data.get('leaders', []),
                contact_email=club_data.get('contact_email'),
                is_active=club_data.get('is_active', True)
            )
        except Exception as e:
            # 동아리 객체 생성 실패 시 건너뛰기
            print(f"Failed to create club {club_data.get('name')}: {e}")
            continue
        
        # Content-based 점수 계산
        content_score, content_reasons = recommendation_service._calculate_content_score(
            preferences, club
        )
        
        # Collaborative 점수 계산 (Mock)
        collab_score, collab_reasons = _calculate_mock_collaborative_score(
            user_id, club.id, all_activities
        )
        
        # Hybrid 점수
        from app.services.recommendation_service import HYBRID_WEIGHTS
        total_score = (
            content_score * HYBRID_WEIGHTS['content_based'] +
            collab_score * HYBRID_WEIGHTS['collaborative']
        )
        
        if total_score > 0:
            all_reasons = content_reasons + collab_reasons
            scored_clubs.append((club, total_score, all_reasons))
    
    # 점수순 정렬
    scored_clubs.sort(key=lambda x: x[1], reverse=True)
    
    # 상위 N개 선택
    top_clubs = scored_clubs[:limit]
    
    # ClubRecommendation 객체 생성
    recommendations = []
    for rank, (club, score, reasons) in enumerate(top_clubs, start=1):
        recommendations.append(ClubRecommendation(
            club_id=club.id,
            score=score,
            rank=rank,
            reasons=reasons
        ))
    
    return RecommendationResult(
        user_id=user_id,
        recommendations=recommendations,
        generated_at=datetime.now(),
        algorithm_version="v1.0-hybrid-mock",
        preferences_used=preferences.dict()
    )


def _calculate_mock_collaborative_score(
    user_id: str,
    club_id: str,
    all_activities: List[dict]
):
    """Mock Collaborative 점수 계산"""
    from app.models.recommendation import RecommendationReason
    from app.services.recommendation_service import BEHAVIOR_WEIGHTS
    
    score = 0.0
    reasons = []
    
    # 해당 사용자의 해당 동아리에 대한 활동 찾기
    user_activities = [
        act for act in all_activities
        if act['user_id'] == user_id and act['club_id'] == club_id
    ]
    
    if user_activities:
        for activity in user_activities:
            activity_type = activity.get('activity_type', '')
            weight = BEHAVIOR_WEIGHTS.get(activity_type, 0.0)
            score += weight
        
        if score > 0:
            reasons.append(RecommendationReason(
                type="user_behavior",
                description=f"이전 활동 기록 ({len(user_activities)}개)",
                score_contribution=score
            ))
    
    return score, reasons


@router.get("")
async def list_test_users():
    """
    테스트 가능한 사용자 목록 반환
    """
    test_data = load_test_data()
    
    users_info = []
    for user in test_data['users']:
        prefs = user.get('recommendation_preferences', {})
        users_info.append({
            "uid": user['uid'],
            "display_name": user['display_name'],
            "email": user['email'],
            "preferred_categories": prefs.get('preferred_categories', []),
            "preferred_activity_types": prefs.get('preferred_activity_types', []),
            "available_time_slots": prefs.get('available_time_slots', [])
        })
    
    return {
        "total_users": len(users_info),
        "users": users_info,
        "total_clubs": len(test_data['clubs']),
        "total_activities": len(test_data['activities'])
    }

