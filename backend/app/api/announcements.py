"""
Announcements API endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.announcement import (
    Announcement,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementListResponse
)
from app.api.dependencies import get_current_user, require_club_leader, get_current_user_optional
from app.services.firestore_service import announcement_service, club_service, user_service, subscription_service
import uuid

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.post("", response_model=Announcement, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    announcement_data: AnnouncementCreate,
    current_user: dict = Depends(require_club_leader)
):
    """
    Create an announcement

    - Club leader only
    - Can only create announcements for clubs the leader manages
    """
    user_id = current_user['uid']
    club_id = announcement_data.club_id
    
    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    if club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create announcements for clubs you manage"
        )
    
    try:
        announcement_id = str(uuid.uuid4())
        
        created_announcement = await announcement_service.create_announcement(
            announcement_id=announcement_id,
            club_id=club_id,
            title=announcement_data.title,
            content=announcement_data.content,
            created_by=user_id
        )
        
        subscriber_count = await subscription_service.count_subscribers(club_id)
        created_announcement['sent_to'] = subscriber_count
        await announcement_service.update_announcement(announcement_id, {'sent_to': subscriber_count})
        
        return Announcement(**created_announcement)
    except Exception as e:
        print(f"Create announcement error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create announcement"
        )


@router.get("", response_model=AnnouncementListResponse)
async def get_announcements(
    club_id: Optional[str] = Query(None, description="Filter by club ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status: active, archived"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get announcement list

    - Filtering: club_id, status
    - Authentication optional
    """
    try:
        announcements = await announcement_service.get_announcements(
            club_id=club_id,
            status=status_filter,
            limit=limit
        )
        
        announcement_objects = [Announcement(**announcement_data) for announcement_data in announcements]
        
        return AnnouncementListResponse(
            announcements=announcement_objects,
            total=len(announcement_objects)
        )
    except RuntimeError:
        return AnnouncementListResponse(
            announcements=[],
            total=0
        )


@router.get("/{announcement_id}", response_model=Announcement)
async def get_announcement(
    announcement_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get announcement detail

    - Authentication optional
    - Increments opens count on each request
    """
    announcement_data = await announcement_service.get_announcement(announcement_id)
    
    if not announcement_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    try:
        await announcement_service.increment_opens(announcement_id)
        announcement_data['opens'] = announcement_data.get('opens', 0) + 1
    except Exception as e:
        print(f"Failed to increment opens: {e}")
    
    return Announcement(**announcement_data)


@router.put("/{announcement_id}", response_model=Announcement)
async def update_announcement(
    announcement_id: str,
    announcement_update: AnnouncementUpdate,
    current_user: dict = Depends(require_club_leader)
):
    """
    Update an announcement

    - Club leader only
    - Can only update announcements for clubs the leader manages
    """
    user_id = current_user['uid']
    
    existing_announcement = await announcement_service.get_announcement(announcement_id)
    
    if not existing_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    announcement_club_id = existing_announcement['club_id']
    
    if announcement_club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify announcements for clubs you manage"
        )
    
    try:
        update_data = announcement_update.dict(exclude_unset=True)
        updated_announcement = await announcement_service.update_announcement(announcement_id, update_data)
        
        return Announcement(**updated_announcement)
    except Exception as e:
        print(f"Update announcement error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update announcement"
        )


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(
    announcement_id: str,
    current_user: dict = Depends(require_club_leader)
):
    """
    Delete an announcement (soft delete - sets status to archived)

    - Club leader only
    - Can only delete announcements for clubs the leader manages
    """
    user_id = current_user['uid']
    
    existing_announcement = await announcement_service.get_announcement(announcement_id)
    
    if not existing_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Announcement not found"
        )
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    announcement_club_id = existing_announcement['club_id']
    
    if announcement_club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete announcements for clubs you manage"
        )
    
    try:
        await announcement_service.delete_announcement(announcement_id)
        return None
    except Exception as e:
        print(f"Delete announcement error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete announcement"
        )
