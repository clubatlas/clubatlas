"""
리더 권한 요청 관리 API (SuperAdmin 전용)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from app.models.auth import (
    LeaderAccessRequestResponse,
    LeaderAccessRequestApproval,
    LeaderAccessRequestRejection,
    UserRoleUpdate
)
from app.services.auth_service import set_user_role
from app.services.firestore_service import FirestoreService, club_service
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/api/admin/leader-requests", tags=["admin-leader-requests"])
firestore_service = FirestoreService()


def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """SuperAdmin 권한 확인"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    
    if user_role != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin role required"
        )
    
    return current_user


@router.get("", response_model=List[LeaderAccessRequestResponse])
async def get_all_leader_requests(
    status_filter: Optional[str] = Query(None, description="필터: pending, approved, rejected"),
    current_user: dict = Depends(require_super_admin)
):
    """
    모든 리더 권한 요청 조회 (SuperAdmin 전용)
    
    - status 필터링 가능
    - 최신순 정렬
    """
    filters = []
    
    if status_filter:
        filters.append(('status', '==', status_filter))
    
    requests = await firestore_service.query_documents(
        'leader_access_requests',
        filters=filters if filters else None,
        order_by='requested_at',
        limit=100
    )
    
    return [
        LeaderAccessRequestResponse(
            id=req['id'],
            user_id=req['user_id'],
            email=req['email'],
            display_name=req['display_name'],
            requested_club_id=req.get('requested_club_id'),
            requested_club_name=req.get('requested_club_name'),
            requested_role=req['requested_role'],
            reason=req['reason'],
            status=req['status'],
            requested_at=req['requested_at'],
            processed_at=req.get('processed_at'),
            processed_by=req.get('processed_by'),
            admin_notes=req.get('admin_notes')
        )
        for req in requests
    ]


@router.get("/{request_id}", response_model=LeaderAccessRequestResponse)
async def get_leader_request(
    request_id: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    특정 리더 권한 요청 상세 조회
    """
    request_doc = await firestore_service.get_document('leader_access_requests', request_id)
    
    if not request_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leader access request not found"
        )
    
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


@router.post("/{request_id}/approve", response_model=LeaderAccessRequestResponse)
async def approve_leader_request(
    request_id: str,
    approval_data: LeaderAccessRequestApproval,
    current_user: dict = Depends(require_super_admin)
):
    """
    리더 권한 요청 승인 (SuperAdmin 전용)
    
    - 사용자 역할을 club-leader로 변경
    - 동아리 leaders 배열에 추가
    - 요청 상태를 approved로 변경
    """
    # 요청 문서 조회
    request_doc = await firestore_service.get_document('leader_access_requests', request_id)
    
    if not request_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leader access request not found"
        )
    
    if request_doc['status'] != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request_doc['status']}"
        )
    
    user_id = request_doc['user_id']
    club_id = approval_data.assign_to_club_id
    
    # 동아리 존재 확인
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    try:
        # 1. 사용자 역할을 club-leader로 변경
        success = await set_user_role(user_id, "club-leader")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user role"
            )
        
        # 2. 동아리 leaders 배열에 추가
        leaders = club.get('leaders', [])
        leader_info = {
            'uid': user_id,
            'name': request_doc['display_name'],
            'role': request_doc['requested_role'],
            'email': request_doc['email']
        }
        
        # 중복 확인
        if not any(l.get('uid') == user_id for l in leaders):
            leaders.append(leader_info)
            await club_service.update_club(club_id, {'leaders': leaders})
        
        # 3. 사용자 프로필에 managed_club_ids 추가
        from app.services.firestore_service import user_service
        user_profile = await user_service.get_user_profile(user_id)
        managed_clubs = user_profile.get('managed_club_ids', [])
        if club_id not in managed_clubs:
            managed_clubs.append(club_id)
            await user_service.update_document(
                user_service.COLLECTION,
                user_id,
                {'managed_club_ids': managed_clubs, 'leader_position': request_doc['requested_role']}
            )
        
        # 4. 요청 상태 업데이트
        updated_request = await firestore_service.update_document(
            'leader_access_requests',
            request_id,
            {
                'status': 'approved',
                'processed_at': datetime.now(),
                'processed_by': current_user['uid'],
                'admin_notes': approval_data.admin_notes,
                'assigned_club_id': club_id
            }
        )
        
        return LeaderAccessRequestResponse(
            id=updated_request['id'],
            user_id=updated_request['user_id'],
            email=updated_request['email'],
            display_name=updated_request['display_name'],
            requested_club_id=updated_request.get('requested_club_id'),
            requested_club_name=updated_request.get('requested_club_name'),
            requested_role=updated_request['requested_role'],
            reason=updated_request['reason'],
            status=updated_request['status'],
            requested_at=updated_request['requested_at'],
            processed_at=updated_request.get('processed_at'),
            processed_by=updated_request.get('processed_by'),
            admin_notes=updated_request.get('admin_notes')
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error approving request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve request"
        )


@router.post("/{request_id}/reject", response_model=LeaderAccessRequestResponse)
async def reject_leader_request(
    request_id: str,
    rejection_data: LeaderAccessRequestRejection,
    current_user: dict = Depends(require_super_admin)
):
    """
    리더 권한 요청 거부 (SuperAdmin 전용)
    
    - 요청 상태를 rejected로 변경
    - 거부 사유 기록
    """
    request_doc = await firestore_service.get_document('leader_access_requests', request_id)
    
    if not request_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leader access request not found"
        )
    
    if request_doc['status'] != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {request_doc['status']}"
        )
    
    updated_request = await firestore_service.update_document(
        'leader_access_requests',
        request_id,
        {
            'status': 'rejected',
            'processed_at': datetime.now(),
            'processed_by': current_user['uid'],
            'admin_notes': rejection_data.admin_notes
        }
    )
    
    return LeaderAccessRequestResponse(
        id=updated_request['id'],
        user_id=updated_request['user_id'],
        email=updated_request['email'],
        display_name=updated_request['display_name'],
        requested_club_id=updated_request.get('requested_club_id'),
        requested_club_name=updated_request.get('requested_club_name'),
        requested_role=updated_request['requested_role'],
        reason=updated_request['reason'],
        status=updated_request['status'],
        requested_at=updated_request['requested_at'],
        processed_at=updated_request.get('processed_at'),
        processed_by=updated_request.get('processed_by'),
        admin_notes=updated_request.get('admin_notes')
    )


@router.put("/users/{uid}/role", response_model=dict)
async def update_user_role(
    uid: str,
    role_update: UserRoleUpdate,
    current_user: dict = Depends(require_super_admin)
):
    """
    사용자 역할 직접 변경 (SuperAdmin 전용)
    
    - 긴급 상황이나 직접 역할 변경 시 사용
    - club-leader → student 또는 그 반대
    """
    from app.services.firestore_service import user_service
    
    # 사용자 존재 확인
    user_profile = await user_service.get_user_profile(uid)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 역할 변경
    success = await set_user_role(uid, role_update.role)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )
    
    return {
        "message": "User role updated successfully",
        "uid": uid,
        "new_role": role_update.role,
        "updated_by": current_user['uid']
    }


