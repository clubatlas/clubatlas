"""
Leader access request management API (SuperAdmin only)
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
    """Verify SuperAdmin role"""
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')

    if user_role != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin role required"
        )

    return current_user


@router.get("", response_model=List[LeaderAccessRequestResponse])
async def get_all_leader_requests(
    status_filter: Optional[str] = Query(None, description="Filter: pending, approved, rejected"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get all leader access requests (SuperAdmin only)

    - Filterable by status
    - Sorted newest first
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
    Get detail for a specific leader access request
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
    Approve a leader access request (SuperAdmin only)

    - Changes user role to club-leader
    - Adds to club leaders array
    - Sets request status to approved
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

    user_id = request_doc['user_id']
    club_id = approval_data.assign_to_club_id

    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    try:
        success = await set_user_role(user_id, "club-leader")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user role"
            )

        leaders = club.get('leaders', [])
        leader_info = {
            'uid': user_id,
            'name': request_doc['display_name'],
            'role': request_doc['requested_role'],
            'email': request_doc['email']
        }

        if not any(l.get('uid') == user_id for l in leaders):
            leaders.append(leader_info)
            await club_service.update_club(club_id, {'leaders': leaders})

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
    Reject a leader access request (SuperAdmin only)

    - Sets request status to rejected
    - Records rejection reason
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
    Directly change a user's role (SuperAdmin only)

    - For emergency or direct role changes
    - club-leader → student or vice versa
    """
    from app.services.firestore_service import user_service

    user_profile = await user_service.get_user_profile(uid)
    if not user_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

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
