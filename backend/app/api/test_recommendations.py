"""
Test recommendation API (uses mock data)
Allows testing the recommendation system without Firestore.
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

TEST_DATA_PATH = os.path.join(
    os.path.dirname(__file__),
    '../../scripts/test_data.json'
)

def load_test_data():
    """Load test data"""
    with open(TEST_DATA_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_test_recommendations(
    user_id: str,
    limit: int = Query(10, ge=1, le=50, description="Number of recommendations")
):
    """
    Test recommendation API (uses mock data)

    - Test the recommendation system without Firestore
    - Uses pre-defined test users

    **Test user IDs:**
    - `test_user_tech_lover`: Tech interests
    - `test_user_arts_enthusiast`: Arts interests
    - `test_user_science_geek`: Science interests
    """
    try:
        test_data = load_test_data()
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Failed to load test data: {str(e)}")

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
    Generate recommendations using mock data
    (Uses the same logic as recommendation_service but with mock data)
    """
    from app.models.recommendation import (
        RecommendationResult,
        ClubRecommendation,
        RecommendationReason
    )
    from app.models.club import Club, MeetingSchedule

    scored_clubs = []

    for club_data in all_clubs:
        try:
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
            print(f"Failed to create club {club_data.get('name')}: {e}")
            continue

        content_score, content_reasons = recommendation_service._calculate_content_score(
            preferences, club
        )

        collab_score, collab_reasons = _calculate_mock_collaborative_score(
            user_id, club.id, all_activities
        )

        from app.services.recommendation_service import HYBRID_WEIGHTS
        total_score = (
            content_score * HYBRID_WEIGHTS['content_based'] +
            collab_score * HYBRID_WEIGHTS['collaborative']
        )

        if total_score > 0:
            all_reasons = content_reasons + collab_reasons
            scored_clubs.append((club, total_score, all_reasons))

    scored_clubs.sort(key=lambda x: x[1], reverse=True)

    top_clubs = scored_clubs[:limit]

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
    """Calculate mock collaborative score"""
    from app.models.recommendation import RecommendationReason
    from app.services.recommendation_service import BEHAVIOR_WEIGHTS

    score = 0.0
    reasons = []

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
                description=f"Previous activity records ({len(user_activities)} entries)",
                score_contribution=score
            ))

    return score, reasons


@router.get("")
async def list_test_users():
    """
    Return list of available test users
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
