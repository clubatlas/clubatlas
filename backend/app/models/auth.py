"""
Authentication-related data models
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
import re


class SignupStudentRequest(BaseModel):
    """Student signup request"""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    display_name: str = Field(..., min_length=1, description="Display name")
    student_id: Optional[str] = Field(None, description="Student ID")
    department: Optional[str] = Field(None, description="Major / Department")

    @validator('password')
    def validate_password(cls, v):
        """Password policy: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class SignupStudentResponse(BaseModel):
    """Student signup response"""
    uid: str
    email: str
    display_name: str
    role: str
    message: str


class LeaderAccessRequest(BaseModel):
    """Club leader access request"""
    email: Optional[str] = Field(None, description="Requester email (used when not logged in)")
    requested_club_id: Optional[str] = Field(None, description="Existing club ID (if selecting an existing club)")
    requested_club_name: Optional[str] = Field(None, description="New club name (if requesting club creation)")
    requested_role: str = Field(..., description="Requested position (President, Vice President, etc.)")
    reason: Optional[str] = Field(default='', description="Request reason")


class LeaderAccessRequestResponse(BaseModel):
    """Leader access request response"""
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
    """Leader access request approval"""
    assign_to_club_id: str = Field(..., description="Club ID to assign the leader to")
    admin_notes: Optional[str] = Field(None, description="Admin notes")


class LeaderAccessRequestRejection(BaseModel):
    """Leader access request rejection"""
    admin_notes: str = Field(..., min_length=1, description="Rejection reason")


class UserRoleUpdate(BaseModel):
    """User role change"""
    role: str = Field(..., description="New role: student, club-leader, super-admin")

    @validator('role')
    def validate_role(cls, v):
        """Role validation"""
        allowed_roles = ['student', 'club-leader', 'admin', 'super-admin']
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v


class AuthVerifyResponse(BaseModel):
    """Token verification response"""
    uid: str
    email: str
    display_name: Optional[str]
    role: str
    is_authenticated: bool
    managed_club_ids: Optional[list] = None
    leader_position: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request (type definition; actual auth handled by Firebase)"""
    email: EmailStr
    password: str
