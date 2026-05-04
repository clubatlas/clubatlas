"""
Club creation request API

- Public endpoint for unauthenticated users to request new club creation
- Admin endpoints for SuperAdmin to approve/reject requests
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from app.api.dependencies import get_current_user
from app.services.firestore_service import FirestoreService, club_service

router = APIRouter(prefix="/api/admin/club-creation-requests", tags=["club-creation-requests"])
firestore_service = FirestoreService()

COLLECTION = 'club_creation_requests'


def require_super_admin(current_user: dict = Depends(get_current_user)) -> dict:
    user_role = current_user.get('role') or current_user.get('custom_claims', {}).get('role')
    if user_role != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin role required"
        )
    return current_user


class ClubCreationRequestCreate(BaseModel):
    club_name: str
    description: str


class ClubCreationRequestApproval(BaseModel):
    admin_notes: Optional[str] = ""


class ClubCreationRequestRejection(BaseModel):
    admin_notes: Optional[str] = "Denied by super admin"


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_club_creation_request(request_data: ClubCreationRequestCreate):
    """
    Submit a club creation request (public endpoint - no authentication required)

    - Called from the "Create a New Club" modal on the login page
    - Saved to club_creation_requests collection with pending status
    """
    if not request_data.club_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Club name is required"
        )
    if not request_data.description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required"
        )

    request_id = str(uuid.uuid4())
    doc_data = {
        'club_name': request_data.club_name.strip(),
        'description': request_data.description.strip(),
        'status': 'pending',
        'submitted_at': datetime.now(),
        'admin_notes': None,
        'processed_at': None,
        'processed_by': None,
    }

    await firestore_service.set_document(COLLECTION, request_id, doc_data, merge=False)

    return {"id": request_id, "message": "Club creation request submitted successfully"}


@router.post("/{request_id}/approve")
async def approve_club_creation_request(
    request_id: str,
    approval: ClubCreationRequestApproval,
    current_user: dict = Depends(require_super_admin)
):
    """
    Approve a club creation request (SuperAdmin only)

    - Actually creates the club in Firestore
    - Sets request status to approved
    """
    doc = await firestore_service.get_document(COLLECTION, request_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if doc.get('status') != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {doc.get('status')}"
        )

    club_id = str(uuid.uuid4())
    await club_service.create_club(
        club_id=club_id,
        name=doc['club_name'],
        description=doc['description'],
        categories=[],
        activity_type=[],
    )

    await firestore_service.set_document(
        COLLECTION,
        request_id,
        {
            'status': 'approved',
            'processed_at': datetime.now(),
            'processed_by': current_user['uid'],
            'admin_notes': approval.admin_notes,
            'created_club_id': club_id,
        },
        merge=True
    )

    return {"message": "Club creation request approved", "club_id": club_id}


@router.post("/{request_id}/reject")
async def reject_club_creation_request(
    request_id: str,
    rejection: ClubCreationRequestRejection,
    current_user: dict = Depends(require_super_admin)
):
    """
    Reject a club creation request (SuperAdmin only)
    """
    doc = await firestore_service.get_document(COLLECTION, request_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if doc.get('status') != 'pending':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request is already {doc.get('status')}"
        )

    await firestore_service.set_document(
        COLLECTION,
        request_id,
        {
            'status': 'rejected',
            'processed_at': datetime.now(),
            'processed_by': current_user['uid'],
            'admin_notes': rejection.admin_notes,
        },
        merge=True
    )

    return {"message": "Club creation request rejected"}
