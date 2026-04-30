"""
total_subscribers 카운트 보정 스크립트

subscriptions 컬렉션의 실제 활성 구독 수를 기준으로
각 동아리의 stats.total_subscribers 를 덮어씁니다.

실행 방법:
    cd backend
    python scripts/fix_subscriber_counts.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from app.services.firebase_admin import get_firestore


async def fix_subscriber_counts():
    db = get_firestore()
    if db is None:
        print("Firestore 초기화 실패. 환경 변수를 확인하세요.")
        return

    print("=" * 60)
    print("ClubAtlas - total_subscribers 카운트 보정")
    print("=" * 60)

    # 1. 모든 활성 동아리 조회
    clubs_ref = db.collection('clubs').where('is_active', '==', True)
    clubs = clubs_ref.stream()
    club_list = [{'id': doc.id, **doc.to_dict()} for doc in clubs]
    print(f"\n동아리 수: {len(club_list)}")

    # 2. 각 동아리별 실제 활성 구독자 수 집계
    fixed = 0
    for club in club_list:
        club_id = club['id']
        club_name = club.get('name', club_id)

        subs_ref = (
            db.collection('subscriptions')
            .where('club_id', '==', club_id)
            .where('is_active', '==', True)
        )
        actual_count = len(list(subs_ref.stream()))

        stored_count = (club.get('stats') or {}).get('total_subscribers', 0)

        if actual_count != stored_count:
            db.collection('clubs').document(club_id).update(
                {'stats.total_subscribers': actual_count}
            )
            print(f"  [{club_name}] {stored_count} → {actual_count} (수정)")
            fixed += 1
        else:
            print(f"  [{club_name}] {actual_count} (정상)")

    print(f"\n완료: {fixed}개 동아리 수정, {len(club_list) - fixed}개 정상")


if __name__ == "__main__":
    asyncio.run(fix_subscriber_counts())
