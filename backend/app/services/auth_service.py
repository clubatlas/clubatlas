"""
Server-side authentication verification service
"""
from typing import Optional
from firebase_admin import auth
from app.services.firebase_admin import get_auth


async def verify_id_token(token: str) -> Optional[dict]:
    """
    Verify a Firebase ID token.

    Args:
        token: Firebase ID token

    Returns:
        Decoded token payload (uid, email, etc.) or None
    """
    try:
        auth_client = get_auth()
        decoded_token = auth_client.verify_id_token(token)
        return decoded_token
    except Exception:
        return None


async def get_user_by_uid(uid: str) -> Optional[dict]:
    """
    Retrieve user information by UID.

    Args:
        uid: Firebase user UID

    Returns:
        User information or None
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
    Set custom claims for a user (permission management).

    Args:
        uid: Firebase user UID
        claims: Claims to set (e.g. {"role": "admin"})

    Returns:
        Success status
    """
    try:
        auth_client = get_auth()
        auth_client.set_custom_user_claims(uid, claims)
        return True
    except Exception:
        return False


async def set_user_role(uid: str, role: str) -> bool:
    """
    Set user role (Firebase Custom Claims + Firestore sync).

    Args:
        uid: Firebase user UID
        role: Role (student, club-leader, admin, super-admin)

    Returns:
        Success status
    """
    try:
        from app.services.firestore_service import user_service

        auth_client = get_auth()
        auth_client.set_custom_user_claims(uid, {"role": role})

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
    Look up a Firebase user by email.
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
    Force-set a user's email verification status (SuperAdmin only).
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
    Create a user in Firebase Authentication.

    Args:
        email: Email address
        password: Password
        display_name: Display name

    Returns:
        Created user information or None
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
