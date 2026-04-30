"""
Firebase 토큰 검증 미들웨어
"""
from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import verify_id_token


security = HTTPBearer()


async def get_current_user(request: Request) -> Optional[dict]:
    """
    요청에서 Firebase 토큰을 추출하고 검증하여 사용자 정보 반환
    
    Args:
        request: FastAPI Request 객체
        
    Returns:
        검증된 사용자 정보 또는 None
    """
    authorization: str = request.headers.get("Authorization")
    
    if not authorization:
        return None
    
    try:
        # "Bearer <token>" 형식에서 토큰 추출
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        # 토큰 검증
        decoded_token = await verify_id_token(token)
        return decoded_token
    except (ValueError, AttributeError):
        return None


async def require_auth(request: Request) -> dict:
    """
    인증이 필수인 엔드포인트에서 사용
    토큰이 없거나 유효하지 않으면 401 에러 발생
    
    Args:
        request: FastAPI Request 객체
        
    Returns:
        검증된 사용자 정보
        
    Raises:
        HTTPException: 인증 실패 시
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
    특정 역할이 필요한 엔드포인트에서 사용
    
    Args:
        request: FastAPI Request 객체
        required_role: 필요한 역할 (예: "admin", "club-leader")
        
    Returns:
        검증된 사용자 정보
        
    Raises:
        HTTPException: 인증 실패 또는 권한 부족 시
    """
    user = await require_auth(request)
    
    # 커스텀 클레임에서 역할 확인
    user_role = user.get("role") or user.get("custom_claims", {}).get("role")
    
    if user_role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{required_role}' required",
        )
    
    return user










