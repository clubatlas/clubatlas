"""
서버 사이드 인증 검증 서비스
"""
from typing import Optional
from firebase_admin import auth
from app.services.firebase_admin import get_auth


async def verify_id_token(token: str) -> Optional[dict]:
    """
    Firebase ID 토큰 검증
    
    Args:
        token: Firebase ID 토큰
        
    Returns:
        검증된 토큰의 디코딩된 정보 (uid, email 등) 또는 None
    """
    try:
        auth_client = get_auth()
        decoded_token = auth_client.verify_id_token(token)
        return decoded_token
    except Exception:
        return None


async def get_user_by_uid(uid: str) -> Optional[dict]:
    """
    UID로 사용자 정보 가져오기
    
    Args:
        uid: Firebase 사용자 UID
        
    Returns:
        사용자 정보 또는 None
    """
    try:
        auth_client = get_auth()
        user = auth_client.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "display_name": user.display_name,
            "disabled": user.disabled,
        }
    except Exception:
        return None


async def set_custom_user_claims(uid: str, claims: dict) -> bool:
    """
    사용자 커스텀 클레임 설정 (권한 관리)
    
    Args:
        uid: Firebase 사용자 UID
        claims: 설정할 클레임 (예: {"role": "admin"})
        
    Returns:
        성공 여부
    """
    try:
        auth_client = get_auth()
        auth_client.set_custom_user_claims(uid, claims)
        return True
    except Exception:
        return False


async def set_user_role(uid: str, role: str) -> bool:
    """
    사용자 역할 설정 (Firebase Custom Claims + Firestore 동기화)
    
    Args:
        uid: Firebase 사용자 UID
        role: 역할 (student, club-leader, admin, super-admin)
        
    Returns:
        성공 여부
    """
    try:
        from app.services.firestore_service import user_service
        
        # Firebase Custom Claims 설정
        auth_client = get_auth()
        auth_client.set_custom_user_claims(uid, {"role": role})
        
        # Firestore 프로필 업데이트 (문서가 없으면 생성)
        await user_service.set_document(
            user_service.COLLECTION,
            uid,
            {"role": role},
            merge=True
        )
        
        return True
    except Exception as e:
        print(f"Error setting user role: {e}")
        return False


async def get_user_by_email(email: str) -> Optional[dict]:
    """
    이메일로 Firebase 사용자 조회
    """
    try:
        auth_client = get_auth()
        user = auth_client.get_user_by_email(email)
        return {
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "display_name": user.display_name,
            "disabled": user.disabled,
        }
    except Exception:
        return None


async def set_email_verified(uid: str, verified: bool = True) -> bool:
    """
    사용자 이메일 인증 상태 강제 설정 (SuperAdmin 전용)
    """
    try:
        auth_client = get_auth()
        auth_client.update_user(uid, email_verified=verified)
        return True
    except Exception as e:
        print(f"Error setting email_verified: {e}")
        return False


async def create_firebase_user(email: str, password: str, display_name: str) -> Optional[dict]:
    """
    Firebase Authentication에 사용자 생성
    
    Args:
        email: 이메일
        password: 비밀번호
        display_name: 표시 이름
        
    Returns:
        생성된 사용자 정보 또는 None
    """
    try:
        auth_client = get_auth()
        user = auth_client.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name
        }
    except Exception as e:
        print(f"Error creating Firebase user: {e}")
        return None










