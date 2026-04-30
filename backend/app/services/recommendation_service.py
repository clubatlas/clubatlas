"""
AI 추천 서비스 - Hybrid Collaborative Filtering
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


# 가중치 설정
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
    """추천 시스템 서비스"""
    
    def __init__(self):
        self.firestore = FirestoreService()
    
    async def generate_recommendations(
        self,
        user_id: str,
        preferences: RecommendationPreferences,
        limit: int = 10
    ) -> RecommendationResult:
        """
        사용자에게 맞춤형 동아리 추천 생성
        
        Args:
            user_id: 사용자 ID
            preferences: 사용자 선호도
            limit: 추천 개수
            
        Returns:
            RecommendationResult
        """
        # 1. 모든 활성 동아리 가져오기
        all_clubs, _ = await club_service.get_clubs(limit=100)

        if not all_clubs:
            return RecommendationResult(
                user_id=user_id,
                recommendations=[],
                generated_at=datetime.now(),
                algorithm_version="v1.0-hybrid",
                preferences_used=preferences.dict()
            )
        
        # 2. 각 동아리에 대해 점수 계산
        scored_clubs = []
        for club_data in all_clubs:
            club = self._dict_to_club(club_data)
            
            # Content-based 점수 계산
            content_score, content_reasons = self._calculate_content_score(
                preferences, club
            )
            
            # Collaborative 점수 계산
            collaborative_score, collab_reasons = await self._calculate_collaborative_score(
                user_id, club.id
            )
            
            # Hybrid 점수 계산
            total_score = (
                content_score * HYBRID_WEIGHTS['content_based'] +
                collaborative_score * HYBRID_WEIGHTS['collaborative']
            )
            
            # 점수가 0 이상인 경우 모두 추가 (매칭이 약해도 추천)
            all_reasons = content_reasons + collab_reasons
            
            # 이유가 없으면 기본 이유 추가
            if not all_reasons:
                all_reasons.append(RecommendationReason(
                    type="available_club",
                    description="Active club on campus",
                    score_contribution=0.0
                ))
            
            scored_clubs.append((club, total_score, all_reasons))
        
        # 3. 점수순으로 정렬
        scored_clubs.sort(key=lambda x: x[1], reverse=True)
        
        # 4. 상위 N개 선택
        top_clubs = scored_clubs[:limit]
        
        # 5. ClubRecommendation 객체 생성
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
        Content-based 점수 계산 (사용자 선호도 기반)
        
        Returns:
            (점수, 이유 리스트)
        """
        score = 0.0
        reasons = []
        
        # 1. 카테고리 매칭 (Jaccard similarity)
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
        
        # 2. 활동 유형 매칭
        if preferences.preferred_activity_types and club.activity_type:
            user_activity_types = set(preferences.preferred_activity_types)
            # activity_type이 리스트인 경우와 단일 문자열인 경우 모두 처리
            club_activity_types = set(club.activity_type) if isinstance(club.activity_type, list) else {club.activity_type}
            
            matched_types = user_activity_types & club_activity_types
            if matched_types:
                # 매칭된 유형 수에 비례하여 점수 부여
                match_ratio = len(matched_types) / len(user_activity_types)
                activity_score = match_ratio * CONTENT_WEIGHTS['activity_type_match']
                score += activity_score
                
                matched_types_str = ', '.join(matched_types)
                reasons.append(RecommendationReason(
                    type="activity_type_match",
                    description=f"Matches your preferred activity: {matched_types_str}",
                    score_contribution=activity_score
                ))
        
        # 3. 시간대 매칭
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
        Collaborative Filtering 점수 계산 (사용자 행동 기반)
        
        Returns:
            (점수, 이유 리스트)
        """
        score = 0.0
        reasons = []
        
        try:
            # 유사 사용자 찾기
            similar_users = await self._find_similar_users(user_id, top_k=10)
            
            if not similar_users:
                return 0.0, []
            
            # 유사 사용자들의 해당 동아리에 대한 행동 수집
            total_weighted_score = 0.0
            total_similarity = 0.0
            behavior_counts = defaultdict(int)
            
            for similar_user_id, similarity in similar_users:
                # 해당 사용자의 동아리 관련 활동 가져오기
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
            
            # 평균 점수 계산
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
        
        except Exception as e:
            # Collaborative 점수 계산 실패 시 0 반환 (Content-based만 사용)
            pass
        
        return score, reasons
    
    async def _find_similar_users(
        self,
        user_id: str,
        top_k: int = 10
    ) -> List[Tuple[str, float]]:
        """
        코사인 유사도 기반 유사 사용자 찾기
        
        Returns:
            [(user_id, similarity_score), ...]
        """
        try:
            # 현재 사용자의 행동 벡터 생성
            user_vector = await self._get_user_behavior_vector(user_id)
            
            if not user_vector:
                return []
            
            # 모든 사용자 목록 가져오기
            all_users = await self.firestore.query_documents(
                'users',
                limit=100
            )
            
            similarities = []
            for other_user in all_users:
                other_user_id = other_user.get('uid')
                
                if other_user_id == user_id:
                    continue
                
                # 다른 사용자의 행동 벡터
                other_vector = await self._get_user_behavior_vector(other_user_id)
                
                if not other_vector:
                    continue
                
                # 코사인 유사도 계산
                similarity = self._cosine_similarity(user_vector, other_vector)
                
                if similarity > 0:
                    similarities.append((other_user_id, similarity))
            
            # 상위 K명 반환
            similarities.sort(key=lambda x: x[1], reverse=True)
            return similarities[:top_k]
        
        except Exception:
            return []
    
    async def _get_user_behavior_vector(
        self,
        user_id: str
    ) -> Dict[str, float]:
        """
        사용자의 동아리별 행동 벡터 생성
        
        Returns:
            {club_id: weighted_score}
        """
        try:
            # 사용자의 모든 활동 가져오기
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
        """특정 사용자의 특정 동아리에 대한 활동 가져오기"""
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
        두 벡터 간 코사인 유사도 계산
        
        Returns:
            0.0 ~ 1.0
        """
        # 공통 키 찾기
        common_keys = set(vector1.keys()) & set(vector2.keys())
        
        if not common_keys:
            return 0.0
        
        # 내적 계산
        dot_product = sum(vector1[key] * vector2[key] for key in common_keys)
        
        # 벡터 크기 계산
        magnitude1 = math.sqrt(sum(v ** 2 for v in vector1.values()))
        magnitude2 = math.sqrt(sum(v ** 2 for v in vector2.values()))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        
        # 코사인 유사도
        return dot_product / (magnitude1 * magnitude2)
    
    def _extract_club_time_slots(
        self,
        meeting_schedule: Optional[List[MeetingSchedule]]
    ) -> set:
        """
        동아리 미팅 스케줄에서 시간대 추출
        
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
                # "16:00-18:00" 형식에서 시작 시간 추출
                if isinstance(slot, str) and '-' in slot:
                    start_time = slot.split('-')[0].strip()
                    time_slots.add(start_time)
                elif isinstance(slot, str):
                    time_slots.add(slot)
        
        return time_slots
    
    def _dict_to_club(self, club_data: Dict) -> Club:
        """Dictionary를 Club 객체로 변환"""
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


# 전역 서비스 인스턴스
recommendation_service = RecommendationService()


