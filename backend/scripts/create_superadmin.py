"""
SuperAdmin 계정 생성 스크립트

실행 방법:
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
    """SuperAdmin 계정 생성"""
    print("=" * 60)
    print("🔐 ClubAtlas SuperAdmin 계정 생성")
    print("=" * 60)
    print()
    print(f"이메일: {SUPERADMIN_EMAIL}")
    print(f"비밀번호: {SUPERADMIN_PASSWORD}")
    print(f"이름: {SUPERADMIN_NAME}")
    print()
    
    try:
        from app.services.auth_service import get_auth
        
        # 0. 기존 계정이 있는지 확인하고 재사용
        print("0️⃣  기존 계정 확인 중...")
        try:
            auth_client = get_auth()
            existing_user = auth_client.get_user_by_email(SUPERADMIN_EMAIL)
            uid = existing_user.uid
            print(f"✅ 기존 계정 발견 (UID: {uid})")
            print("   → 기존 계정을 SuperAdmin으로 설정합니다.")
        except Exception:
            # 계정이 없으면 새로 생성
            print("1️⃣  Firebase Authentication에 계정 생성 중...")
            firebase_user = await create_firebase_user(
                email=SUPERADMIN_EMAIL,
                password=SUPERADMIN_PASSWORD,
                display_name=SUPERADMIN_NAME
            )
            
            if not firebase_user:
                print("❌ Firebase 계정 생성 실패")
                return
            
            uid = firebase_user['uid']
            print(f"✅ Firebase 계정 생성 완료 (UID: {uid})")
        
        # 2. Firestore에 프로필 생성/업데이트
        print("\n2️⃣  Firestore 프로필 생성/업데이트 중...")
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
        
        print("✅ Firestore 프로필 생성 완료")
        
        # 3. Firebase Custom Claims 설정
        print("\n3️⃣  Firebase Custom Claims 설정 중 (role: super-admin)...")
        try:
            auth_client = get_auth()
            auth_client.set_custom_user_claims(uid, {"role": "super-admin"})
            print("✅ Custom Claims 설정 완료")
        except Exception as e:
            print(f"⚠️  Custom Claims 설정 실패: {e}")
            print("   (하지만 Firestore role은 설정됨)")
        
        # 완료 메시지
        print("\n" + "=" * 60)
        print("✅ SuperAdmin 계정 생성 완료!")
        print("=" * 60)
        print()
        print("📝 로그인 정보:")
        print(f"   이메일: {SUPERADMIN_EMAIL}")
        print(f"   비밀번호: {SUPERADMIN_PASSWORD}")
        print()
        print("🔗 로그인 URL:")
        print("   http://localhost:3000/admin/login")
        print("   (Super Admin 탭 선택)")
        print()
        print("⚠️  보안 경고:")
        print("   프로덕션 환경에서는 반드시 비밀번호를 변경하세요!")
        print()
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(create_superadmin())


