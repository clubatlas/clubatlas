"""
인증 API 엔드포인트
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.models.auth import (
    SignupStudentRequest,
    SignupStudentResponse,
    LeaderAccessRequest,
    LeaderAccessRequestResponse,
    AuthVerifyResponse
)
from app.services.auth_service import (
    create_firebase_user,
    set_user_role,
    verify_id_token
)
from app.services.firestore_service import user_service, FirestoreService
from app.api.dependencies import get_current_user, get_current_user_optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])
firestore_service = FirestoreService()


@router.post("/signup/student", response_model=SignupStudentResponse, status_code=status.HTTP_201_CREATED)
async def signup_student(signup_data: SignupStudentRequest):
    """
    학생 회원가입
    
    - Firebase Authentication에 계정 생성
    - Firestore에 프로필 생성 (role: student)
    - 즉시 승인 (수동 승인 불필요)
    """
    try:
        # 도메인 검증
        email_lower = signup_data.email.lower()
        if not email_lower.endswith('@concordacademy.org') and not email_lower.endswith('@gmail.com'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only @concordacademy.org email addresses are allowed."
            )

        # 1. Firebase Authentication에 사용자 생성
        firebase_user = await create_firebase_user(
            email=signup_data.email,
            password=signup_data.password,
            display_name=signup_data.display_name
        )
        
        if not firebase_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account. Email may already be in use."
            )
        
        uid = firebase_user['uid']
        
        # 2. Firebase Custom Claims 설정 (role: student)
        await set_user_role(uid, "student")
        
        # 3. Firestore에 프로필 생성
        profile_data = {
            'email': signup_data.email,
            'display_name': signup_data.display_name,
            'role': 'student',
            'student_id': signup_data.student_id,
            'department': signup_data.department,
            'interests': [],
            'recommendation_preferences': None,
            'is_active': True
        }
        
        await user_service.create_document(
            user_service.COLLECTION,
            uid,
            profile_data
        )
        
        return SignupStudentResponse(
            uid=uid,
            email=signup_data.email,
            display_name=signup_data.display_name,
            role="student",
            message="Student account created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during signup"
        )


@router.post("/leader-access/request", response_model=LeaderAccessRequestResponse, status_code=status.HTTP_201_CREATED)
async def request_leader_access(
    request_data: LeaderAccessRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    동아리 리더 권한 요청
    
    - 로그인 상태: 토큰에서 사용자 정보 추출
    - 비로그인 상태: 요청 본문의 email로 사용자 조회
    - SuperAdmin 승인 대기 상태로 생성
    """
    # 사용자 프로필 조회 (로그인 여부에 따라 분기)
    if current_user:
        uid = current_user['uid']
        user_profile = await user_service.get_user_profile(uid)
    else:
        if not request_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required when not logged in"
            )
        users = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('email', '==', request_data.email)],
            limit=1
        )
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No user found with this email"
            )
        user_profile = users[0]
        uid = user_profile['id']

    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # 해당 클럽의 기존 리더 여부 확인
    if request_data.requested_club_id:
        club = await firestore_service.get_document('clubs', request_data.requested_club_id)
        if club:
            existing_leaders = club.get('leaders', [])
            if any(leader.get('uid') == uid for leader in existing_leaders):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You are already a leader of this club"
                )

    # 기존 pending 요청 확인 (동일 클럽)
    existing_requests = await firestore_service.query_documents(
        'leader_access_requests',
        filters=[
            ('user_id', '==', uid),
            ('requested_club_id', '==', request_data.requested_club_id),
            ('status', '==', 'pending')
        ]
    )
    
    if existing_requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending leader access request for this club"
        )
    
    # 요청 생성
    request_id = str(uuid.uuid4())
    request_doc = {
        'user_id': uid,
        'email': user_profile['email'],
        'display_name': user_profile.get('display_name', ''),
        'requested_club_id': request_data.requested_club_id,
        'requested_club_name': request_data.requested_club_name,
        'requested_role': request_data.requested_role,
        'reason': request_data.reason,
        'status': 'pending',
        'requested_at': datetime.now(),
        'processed_at': None,
        'processed_by': None,
        'admin_notes': None,
        'assigned_club_id': None
    }
    
    created = await firestore_service.create_document(
        'leader_access_requests',
        request_id,
        request_doc
    )
    
    return LeaderAccessRequestResponse(
        id=created['id'],
        user_id=created['user_id'],
        email=created['email'],
        display_name=created['display_name'],
        requested_club_id=created.get('requested_club_id'),
        requested_club_name=created.get('requested_club_name'),
        requested_role=created['requested_role'],
        reason=created['reason'],
        status=created['status'],
        requested_at=created['requested_at'],
        processed_at=created.get('processed_at'),
        processed_by=created.get('processed_by'),
        admin_notes=created.get('admin_notes')
    )


@router.get("/me", response_model=AuthVerifyResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    현재 로그인한 사용자 정보 조회
    
    - 토큰 검증
    - 역할 확인
    - 프로필 정보 반환
    """
    uid = current_user['uid']
    
    # Firestore에서 프로필 조회
    user_profile = await user_service.get_user_profile(uid)
    
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Custom Claims에서 역할 가져오기 (우선순위)
    role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    # Firestore 역할과 동기화 확인
    if not role:
        role = user_profile.get('role', 'student')
    
    return AuthVerifyResponse(
        uid=uid,
        email=user_profile['email'],
        display_name=user_profile.get('display_name'),
        role=role,
        is_authenticated=True,
        managed_club_ids=user_profile.get('managed_club_ids'),
        leader_position=user_profile.get('leader_position')
    )


@router.get("/leader-access/my-request", response_model=Optional[LeaderAccessRequestResponse])
async def get_my_leader_request(current_user: dict = Depends(get_current_user)):
    """
    내 리더 권한 요청 조회
    
    - 현재 로그인한 사용자의 pending 요청 확인
    """
    uid = current_user['uid']
    
    requests = await firestore_service.query_documents(
        'leader_access_requests',
        filters=[
            ('user_id', '==', uid),
            ('status', '==', 'pending')
        ],
        limit=1
    )
    
    if not requests:
        return None
    
    request_doc = requests[0]
    return LeaderAccessRequestResponse(
        id=request_doc['id'],
        user_id=request_doc['user_id'],
        email=request_doc['email'],
        display_name=request_doc['display_name'],
        requested_club_id=request_doc.get('requested_club_id'),
        requested_club_name=request_doc.get('requested_club_name'),
        requested_role=request_doc['requested_role'],
        reason=request_doc['reason'],
        status=request_doc['status'],
        requested_at=request_doc['requested_at'],
        processed_at=request_doc.get('processed_at'),
        processed_by=request_doc.get('processed_by'),
        admin_notes=request_doc.get('admin_notes')
    )


