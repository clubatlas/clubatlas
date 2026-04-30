"""
API 의존성 함수들
"""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from app.services.auth_service import verify_id_token


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    현재 인증된 사용자 정보 가져오기
    
    Args:
        authorization: Authorization 헤더 (Bearer 토큰)
    
    Returns:
        검증된 사용자 정보 (uid, email 등)
    
    Raises:
        HTTPException: 인증 실패 시
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
    현재 사용자 정보 가져오기 (선택적)
    인증되지 않은 경우 None 반환
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
    특정 역할 필요 (의존성 팩토리)
    
    Args:
        required_role: 필요한 역할
        current_user: 현재 사용자
    
    Returns:
        검증된 사용자 정보
    
    Raises:
        HTTPException: 권한 부족 시
    """
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{required_role}' required"
        )
    
    return current_user


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """관리자 권한 필요"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    if user_role not in ['admin', 'super-admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    return current_user


def require_club_leader(current_user: dict = Depends(get_current_user)) -> dict:
    """동아리 리더 권한 필요"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    if user_role not in ['club-leader', 'admin', 'super-admin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Club leader role required"
        )
    
    return current_user


def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """슈퍼 관리자 권한 필요"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    if user_role != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin role required"
        )
    
    return current_user


