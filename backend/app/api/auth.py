"""
Authentication API endpoints
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
    Student signup

    - Creates account in Firebase Authentication
    - Creates profile in Firestore (role: student)
    - Immediately approved (no manual approval required)
    """
    try:
        email_lower = signup_data.email.lower()
        if not email_lower.endswith('@concordacademy.org') and not email_lower.endswith('@gmail.com'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only @concordacademy.org email addresses are allowed."
            )

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

        await set_user_role(uid, "student")

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
    Club leader access request

    - Logged in: extracts user info from token
    - Not logged in: looks up user by email in request body
    - Created with pending SuperAdmin approval status
    """
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

    if request_data.requested_club_id:
        club = await firestore_service.get_document('clubs', request_data.requested_club_id)
        if club:
            existing_leaders = club.get('leaders', [])
            if any(leader.get('uid') == uid for leader in existing_leaders):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="You are already a leader of this club"
                )

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
    Get current logged-in user info

    - Token verification
    - Role check
    - Returns profile info
    """
    uid = current_user['uid']

    user_profile = await user_service.get_user_profile(uid)

    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )

    role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

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
    Get my leader access request

    - Check pending request for the current logged-in user
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
