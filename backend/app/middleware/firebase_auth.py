"""
Firebase token verification middleware
"""
from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import verify_id_token


security = HTTPBearer()


async def get_current_user(request: Request) -> Optional[dict]:
    """
    Extract and verify the Firebase token from the request and return user info.

    Args:
        request: FastAPI Request object

    Returns:
        Verified user info or None
    """
    authorization: str = request.headers.get("Authorization")

    if not authorization:
        return None

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None

        decoded_token = await verify_id_token(token)
        return decoded_token
    except (ValueError, AttributeError):
        return None


async def require_auth(request: Request) -> dict:
    """
    Used on endpoints that require authentication.
    Raises 401 if token is missing or invalid.

    Args:
        request: FastAPI Request object

    Returns:
        Verified user info

    Raises:
        HTTPException: on authentication failure
    """
    user = await get_current_user(request)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def require_role(request: Request, required_role: str) -> dict:
    """
    Used on endpoints that require a specific role.

    Args:
        request: FastAPI Request object
        required_role: Required role (e.g. "admin", "club-leader")

    Returns:
        Verified user info

    Raises:
        HTTPException: on authentication failure or insufficient permissions
    """
    user = await require_auth(request)

    user_role = user.get("role") or user.get("custom_claims", {}).get("role")

    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{required_role}' required",
        )

    return user
