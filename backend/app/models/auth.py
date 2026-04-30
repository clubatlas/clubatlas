"""
인증 관련 데이터 모델
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
import re


class SignupStudentRequest(BaseModel):
    """학생 회원가입 요청"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="비밀번호 (8자 이상)")
    display_name: str = Field(..., min_length=1, description="이름")
    student_id: Optional[str] = Field(None, description="학번")
    department: Optional[str] = Field(None, description="전공/학과")
    
    @validator('password')
    def validate_password(cls, v):
        """비밀번호 정책 검증: 8자 이상, 대문자, 소문자, 숫자 각 1개 이상"""
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        if not re.search(r'[a-z]', v):
            raise ValueError('비밀번호에 소문자가 최소 1개 포함되어야 합니다')
        if not re.search(r'[A-Z]', v):
            raise ValueError('비밀번호에 대문자가 최소 1개 포함되어야 합니다')
        if not re.search(r'\d', v):
            raise ValueError('비밀번호에 숫자가 최소 1개 포함되어야 합니다')
        return v


class SignupStudentResponse(BaseModel):
    """학생 회원가입 응답"""
    uid: str
    email: str
    display_name: str
    role: str
    message: str


class LeaderAccessRequest(BaseModel):
    """동아리 리더 권한 요청"""
    email: Optional[str] = Field(None, description="요청자 이메일 (비로그인 시 사용)")
    requested_club_id: Optional[str] = Field(None, description="기존 동아리 ID (선택 시)")
    requested_club_name: Optional[str] = Field(None, description="신규 동아리 이름 (생성 요청 시)")
    requested_role: str = Field(..., description="요청할 직책 (President, Vice President 등)")
    reason: Optional[str] = Field(default='', description="요청 사유")


class LeaderAccessRequestResponse(BaseModel):
    """리더 권한 요청 응답"""
    id: str
    user_id: str
    email: str
    display_name: str
    requested_club_id: Optional[str]
    requested_club_name: Optional[str]
    requested_role: str
    reason: str
    status: str
    requested_at: datetime
    processed_at: Optional[datetime]
    processed_by: Optional[str]
    admin_notes: Optional[str]


class LeaderAccessRequestApproval(BaseModel):
    """리더 권한 요청 승인"""
    assign_to_club_id: str = Field(..., description="배정할 동아리 ID")
    admin_notes: Optional[str] = Field(None, description="관리자 메모")


class LeaderAccessRequestRejection(BaseModel):
    """리더 권한 요청 거부"""
    admin_notes: str = Field(..., min_length=1, description="거부 사유")


class UserRoleUpdate(BaseModel):
    """사용자 역할 변경"""
    role: str = Field(..., description="변경할 역할: student, club-leader, super-admin")
    
    @validator('role')
    def validate_role(cls, v):
        """역할 유효성 검증"""
        allowed_roles = ['student', 'club-leader', 'admin', 'super-admin']
        if v not in allowed_roles:
            raise ValueError(f'역할은 다음 중 하나여야 합니다: {", ".join(allowed_roles)}')
        return v


class AuthVerifyResponse(BaseModel):
    """토큰 검증 응답"""
    uid: str
    email: str
    display_name: Optional[str]
    role: str
    is_authenticated: bool
    managed_club_ids: Optional[list] = None
    leader_position: Optional[str] = None


class LoginRequest(BaseModel):
    """로그인 요청 (Firebase에서 처리하지만 타입 정의용)"""
    email: EmailStr
    password: str


