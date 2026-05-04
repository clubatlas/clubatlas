"""
AI Recommendation Service - Hybrid Collaborative Filtering
"""
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import math
from collections import defaultdict

from app.models.user import RecommendationPreferences
from app.models.club import Club, MeetingSchedule
from app.models.recommendation import (
    ClubRecommendation,
    RecommendationReason,
    RecommendationResult
)
from app.services.firestore_service import club_service, FirestoreService


CONTENT_WEIGHTS = {
    'category_match': 5.0,
    'activity_type_match': 4.0,
    'time_slot_match': 4.5,
}

BEHAVIOR_WEIGHTS = {
    'view_club': 0.5,
    'subscribe_club': 2.0,
    'attend_event': 1.5,
    'click_detail': 0.3,
}

HYBRID_WEIGHTS = {
    'content_based': 0.75,
    'collaborative': 0.25,
}


class RecommendationService:
    """Recommendation system service"""

    def __init__(self):
        self.firestore = FirestoreService()

    async def generate_recommendations(
        self,
        user_id: str,
        preferences: RecommendationPreferences,
        limit: int = 10
    ) -> RecommendationResult:
        """
        Generate personalized club recommendations for a user.

        Args:
            user_id: User ID
            preferences: User preferences
            limit: Number of recommendations

        Returns:
            RecommendationResult
        """
        all_clubs, _ = await club_service.get_clubs(limit=100)

        if not all_clubs:
            return RecommendationResult(
                user_id=user_id,
                recommendations=[],
                generated_at=datetime.now(),
                algorithm_version="v1.0-hybrid",
                preferences_used=preferences.dict()
            )

        scored_clubs = []
        for club_data in all_clubs:
            club = self._dict_to_club(club_data)

            content_score, content_reasons = self._calculate_content_score(
                preferences, club
            )

            collaborative_score, collab_reasons = await self._calculate_collaborative_score(
                user_id, club.id
            )

            total_score = (
                content_score * HYBRID_WEIGHTS['content_based'] +
                collaborative_score * HYBRID_WEIGHTS['collaborative']
            )

            all_reasons = content_reasons + collab_reasons

            if not all_reasons:
                all_reasons.append(RecommendationReason(
                    type="available_club",
                    description="Active club on campus",
                    score_contribution=0.0
                ))

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
            algorithm_version="v1.0-hybrid",
            preferences_used=preferences.dict()
        )

    def _calculate_content_score(
        self,
        preferences: RecommendationPreferences,
        club: Club
    ) -> Tuple[float, List[RecommendationReason]]:
        """
        Calculate content-based score (based on user preferences).

        Returns:
            (score, reason list)
        """
        score = 0.0
        reasons = []

        # 1. Category matching (Jaccard similarity)
        if preferences.preferred_categories and club.categories:
            user_cats = set(preferences.preferred_categories)
            club_cats = set(club.categories)
            intersection = len(user_cats & club_cats)
            union = len(user_cats | club_cats)

            if union > 0:
                jaccard = intersection / union
                category_score = jaccard * CONTENT_WEIGHTS['category_match']
                score += category_score

                if jaccard > 0:
                    reasons.append(RecommendationReason(
                        type="category_match",
                        description=f"Category match: {int(jaccard * 100)}%",
                        score_contribution=category_score
                    ))

        # 2. Activity type matching
        if preferences.preferred_activity_types and club.activity_type:
            user_activity_types = set(preferences.preferred_activity_types)
            club_activity_types = set(club.activity_type) if isinstance(club.activity_type, list) else {club.activity_type}

            matched_types = user_activity_types & club_activity_types
            if matched_types:
                match_ratio = len(matched_types) / len(user_activity_types)
                activity_score = match_ratio * CONTENT_WEIGHTS['activity_type_match']
                score += activity_score

                matched_types_str = ', '.join(matched_types)
                reasons.append(RecommendationReason(
                    type="activity_type_match",
                    description=f"Matches your preferred activity: {matched_types_str}",
                    score_contribution=activity_score
                ))

        # 3. Time slot matching
        if preferences.available_time_slots and club.meeting_schedule:
            user_times = set(preferences.available_time_slots)
            club_times = self._extract_club_time_slots(club.meeting_schedule)

            if club_times:
                overlap = len(user_times & club_times)
                total = len(user_times)

                if overlap > 0 and total > 0:
                    overlap_ratio = overlap / total
                    time_score = overlap_ratio * CONTENT_WEIGHTS['time_slot_match']
                    score += time_score
                    reasons.append(RecommendationReason(
                        type="time_match",
                        description=f"Time slot overlap: {overlap} slot(s)",
                        score_contribution=time_score
                    ))

        return score, reasons

    async def _calculate_collaborative_score(
        self,
        user_id: str,
        club_id: str
    ) -> Tuple[float, List[RecommendationReason]]:
        """
        Calculate collaborative filtering score (based on user behavior).

        Returns:
            (score, reason list)
        """
        score = 0.0
        reasons = []

        try:
            similar_users = await self._find_similar_users(user_id, top_k=10)

            if not similar_users:
                return 0.0, []

            total_weighted_score = 0.0
            total_similarity = 0.0
            behavior_counts = defaultdict(int)

            for similar_user_id, similarity in similar_users:
                activities = await self._get_user_club_activities(
                    similar_user_id, club_id
                )

                for activity in activities:
                    activity_type = activity.get('activity_type', '')
                    action_weight = BEHAVIOR_WEIGHTS.get(activity_type, 0.0)

                    if action_weight > 0:
                        total_weighted_score += action_weight * similarity
                        behavior_counts[activity_type] += 1

                total_similarity += similarity

            if total_similarity > 0:
                score = total_weighted_score / len(similar_users)

                if score > 0:
                    _action_labels = {
                        'view_club': 'viewed',
                        'subscribe_club': 'subscribed',
                        'attend_event': 'attended',
                        'click_detail': 'viewed details'
                    }
                    behavior_desc = ", ".join([
                        f"{count} {_action_labels.get(act_type, act_type)}"
                        for act_type, count in behavior_counts.items()
                    ])
                    reasons.append(RecommendationReason(
                        type="user_behavior",
                        description=f"Similar students chose this ({behavior_desc})",
                        score_contribution=score
                    ))

        except Exception:
            pass

        return score, reasons

    async def _find_similar_users(
        self,
        user_id: str,
        top_k: int = 10
    ) -> List[Tuple[str, float]]:
        """
        Find similar users based on cosine similarity.

        Returns:
            [(user_id, similarity_score), ...]
        """
        try:
            user_vector = await self._get_user_behavior_vector(user_id)

            if not user_vector:
                return []

            all_users = await self.firestore.query_documents(
                'users',
                limit=100
            )

            similarities = []
            for other_user in all_users:
                other_user_id = other_user.get('uid')

                if other_user_id == user_id:
                    continue

                other_vector = await self._get_user_behavior_vector(other_user_id)

                if not other_vector:
                    continue

                similarity = self._cosine_similarity(user_vector, other_vector)

                if similarity > 0:
                    similarities.append((other_user_id, similarity))

            similarities.sort(key=lambda x: x[1], reverse=True)
            return similarities[:top_k]

        except Exception:
            return []

    async def _get_user_behavior_vector(
        self,
        user_id: str
    ) -> Dict[str, float]:
        """
        Build a user's behavior vector per club.

        Returns:
            {club_id: weighted_score}
        """
        try:
            activities = await self.firestore.query_documents(
                'user_activities',
                filters=[('user_id', '==', user_id)],
                limit=1000
            )

            vector = defaultdict(float)
            for activity in activities:
                club_id = activity.get('club_id')
                activity_type = activity.get('activity_type', '')

                if club_id and activity_type:
                    weight = BEHAVIOR_WEIGHTS.get(activity_type, 0.0)
                    vector[club_id] += weight

            return dict(vector)

        except Exception:
            return {}

    async def _get_user_club_activities(
        self,
        user_id: str,
        club_id: str
    ) -> List[Dict]:
        """Get activities for a specific user and club"""
        try:
            activities = await self.firestore.query_documents(
                'user_activities',
                filters=[
                    ('user_id', '==', user_id),
                    ('club_id', '==', club_id)
                ],
                limit=100
            )
            return activities
        except Exception:
            return []

    def _cosine_similarity(
        self,
        vector1: Dict[str, float],
        vector2: Dict[str, float]
    ) -> float:
        """
        Calculate cosine similarity between two vectors.

        Returns:
            0.0 ~ 1.0
        """
        common_keys = set(vector1.keys()) & set(vector2.keys())

        if not common_keys:
            return 0.0

        dot_product = sum(vector1[key] * vector2[key] for key in common_keys)

        magnitude1 = math.sqrt(sum(v ** 2 for v in vector1.values()))
        magnitude2 = math.sqrt(sum(v ** 2 for v in vector2.values()))

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

    def _extract_club_time_slots(
        self,
        meeting_schedule: Optional[List[MeetingSchedule]]
    ) -> set:
        """
        Extract time slots from a club's meeting schedule.

        Returns:
            {'09:00', '14:00', ...}
        """
        time_slots = set()

        if not meeting_schedule:
            return time_slots

        for schedule in meeting_schedule:
            if hasattr(schedule, 'time_slots'):
                slots = schedule.time_slots
            elif isinstance(schedule, dict):
                slots = schedule.get('time_slots', [])
            else:
                continue

            for slot in slots:
                # Extract start time from "16:00-18:00" format
                if isinstance(slot, str) and '-' in slot:
                    start_time = slot.split('-')[0].strip()
                    time_slots.add(start_time)
                elif isinstance(slot, str):
                    time_slots.add(slot)

        return time_slots

    def _dict_to_club(self, club_data: Dict) -> Club:
        """Convert a dictionary to a Club object"""
        return Club(
            id=club_data.get('id'),
            name=club_data.get('name', ''),
            description=club_data.get('description', ''),
            tagline=club_data.get('tagline'),
            categories=club_data.get('categories', []),
            tags=club_data.get('tags', []),
            activity_type=club_data.get('activity_type', ''),
            meeting_schedule=club_data.get('meeting_schedule', []),
            leaders=club_data.get('leaders', []),
            contact_email=club_data.get('contact_email'),
            stats=club_data.get('stats', {}),
            logo_url=club_data.get('logo_url'),
            banner_url=club_data.get('banner_url'),
            media_urls=club_data.get('media_urls', []),
            created_at=club_data.get('created_at'),
            updated_at=club_data.get('updated_at'),
            is_active=club_data.get('is_active', True)
        )


recommendation_service = RecommendationService()
