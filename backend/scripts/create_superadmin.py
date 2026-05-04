"""
SuperAdmin account creation script

Usage:
    cd backend
    python scripts/create_superadmin.py
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import asyncio
from app.services.auth_service import create_firebase_user, set_user_role
from app.services.firestore_service import FirestoreService

firestore_service = FirestoreService()


SUPERADMIN_EMAIL = "superadmin@gmail.com"
SUPERADMIN_PASSWORD = "Super123"
SUPERADMIN_NAME = "superadmin"


async def create_superadmin():
    """Create SuperAdmin account"""
    print("=" * 60)
    print("🔐 ClubAtlas SuperAdmin Account Creation")
    print("=" * 60)
    print()
    print(f"Email: {SUPERADMIN_EMAIL}")
    print(f"Password: {SUPERADMIN_PASSWORD}")
    print(f"Name: {SUPERADMIN_NAME}")
    print()

    try:
        from app.services.auth_service import get_auth

        print("0️⃣  Checking for existing account...")
        try:
            auth_client = get_auth()
            existing_user = auth_client.get_user_by_email(SUPERADMIN_EMAIL)
            uid = existing_user.uid
            print(f"✅ Existing account found (UID: {uid})")
            print("   → Setting existing account as SuperAdmin.")
        except Exception:
            print("1️⃣  Creating account in Firebase Authentication...")
            firebase_user = await create_firebase_user(
                email=SUPERADMIN_EMAIL,
                password=SUPERADMIN_PASSWORD,
                display_name=SUPERADMIN_NAME
            )

            if not firebase_user:
                print("❌ Firebase account creation failed")
                return

            uid = firebase_user['uid']
            print(f"✅ Firebase account created (UID: {uid})")

        print("\n2️⃣  Creating/updating Firestore profile...")
        profile_data = {
            'email': SUPERADMIN_EMAIL,
            'display_name': SUPERADMIN_NAME,
            'role': 'super-admin',
            'is_active': True
        }

        await firestore_service.set_document(
            'users',
            uid,
            profile_data,
            merge=True
        )

        print("✅ Firestore profile created")

        print("\n3️⃣  Setting Firebase Custom Claims (role: super-admin)...")
        try:
            auth_client = get_auth()
            auth_client.set_custom_user_claims(uid, {"role": "super-admin"})
            print("✅ Custom Claims set successfully")
        except Exception as e:
            print(f"⚠️  Failed to set Custom Claims: {e}")
            print("   (Firestore role has been set)")

        print("\n" + "=" * 60)
        print("✅ SuperAdmin account creation complete!")
        print("=" * 60)
        print()
        print("📝 Login credentials:")
        print(f"   Email: {SUPERADMIN_EMAIL}")
        print(f"   Password: {SUPERADMIN_PASSWORD}")
        print()
        print("🔗 Login URL:")
        print("   http://localhost:3000/admin/login")
        print("   (Select Super Admin tab)")
        print()
        print("⚠️  Security warning:")
        print("   Change the password in production environments!")
        print()

    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(create_superadmin())
