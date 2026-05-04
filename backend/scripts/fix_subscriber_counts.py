"""
total_subscribers count correction script

Overwrites stats.total_subscribers for each club based on
the actual number of active subscriptions in the subscriptions collection.

Usage:
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
        print("Firestore initialization failed. Check environment variables.")
        return

    print("=" * 60)
    print("ClubAtlas - total_subscribers count correction")
    print("=" * 60)

    clubs_ref = db.collection('clubs').where('is_active', '==', True)
    clubs = clubs_ref.stream()
    club_list = [{'id': doc.id, **doc.to_dict()} for doc in clubs]
    print(f"\nNumber of clubs: {len(club_list)}")

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
            print(f"  [{club_name}] {stored_count} → {actual_count} (fixed)")
            fixed += 1
        else:
            print(f"  [{club_name}] {actual_count} (ok)")

    print(f"\nDone: {fixed} clubs fixed, {len(club_list) - fixed} clubs ok")


if __name__ == "__main__":
    asyncio.run(fix_subscriber_counts())
