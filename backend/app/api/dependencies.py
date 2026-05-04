"""
API dependency functions
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from app.services.auth_service import verify_id_token


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    Get current authenticated user info.

    Args:
        authorization: Authorization header (Bearer token)

    Returns:
        Verified user info (uid, email, etc.)

    Raises:
        HTTPException: on authentication failure
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await verify_id_token(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_user_optional(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Get current user info (optional).
    Returns None if not authenticated.
    """
    if not authorization:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None

        user = await verify_id_token(token)
        return user
    except (ValueError, AttributeError):
        return None


async def require_role(
    required_role: str,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Require a specific role (dependency factory).

    Args:
        required_role: Required role
        current_user: Current user

    Returns:
        Verified user info

    Raises:
        HTTPException: on insufficient permissions
    """
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{required_role}' required"
        )

    return current_user


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Require admin role"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

    if user_role not in ['admin', 'super-admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )

    return current_user


def require_club_leader(current_user: dict = Depends(get_current_user)) -> dict:
    """Require club leader role"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

    if user_role not in ['club-leader', 'admin', 'super-admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Club leader role required"
        )

    return current_user


def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Require super admin role"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

    if user_role != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin role required"
        )

    return current_user
