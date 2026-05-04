"""
Bookmarks API endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.bookmark import (
    Bookmark,
    BookmarkCreate,
    BookmarkedClub,
    BookmarkListResponse
)
from app.api.dependencies import get_current_user
from app.services.firestore_service import bookmark_service, club_service
import uuid

router = APIRouter(prefix="/api/bookmarks", tags=["bookmarks"])


@router.post("", response_model=Bookmark, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    bookmark_data: BookmarkCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Add a club bookmark

    - Authenticated users only
    - Prevents duplicate bookmarks
    """
    user_id = current_user['uid']
    club_id = bookmark_data.club_id

    club = await club_service.get_club(club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Club not found"
        )

    try:
        bookmark_id = str(uuid.uuid4())

        created_bookmark = await bookmark_service.create_bookmark(
            bookmark_id=bookmark_id,
            user_id=user_id,
            club_id=club_id
        )

        return Bookmark(**created_bookmark)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Create bookmark error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bookmark"
        )


@router.get("/my", response_model=BookmarkListResponse)
async def get_my_bookmarks(
    current_user: dict = Depends(get_current_user)
):
    """
    Get my bookmark list

    - Authenticated users only
    - Includes club details
    """
    user_id = current_user['uid']

    try:
        bookmarks = await bookmark_service.get_user_bookmarks(user_id)

        if not bookmarks:
            return BookmarkListResponse(bookmarks=[], total=0)

        bookmarked_clubs = []
        for bookmark in bookmarks:
            club_id = bookmark['club_id']
            club = await club_service.get_club(club_id)

            if club:
                bookmarked_club = BookmarkedClub(
                    bookmark_id=bookmark['id'],
                    club_id=club_id,
                    club_name=club['name'],
                    club_tagline=club.get('tagline'),
                    club_description=club['description'],
                    categories=club['categories'],
                    logo_url=club.get('logo_url'),
                    banner_url=club.get('banner_url'),
                    match_score=None,
                    match_reason=None,
                    bookmarked_at=bookmark['created_at']
                )
                bookmarked_clubs.append(bookmarked_club)

        return BookmarkListResponse(
            bookmarks=bookmarked_clubs,
            total=len(bookmarked_clubs)
        )
    except Exception as e:
        print(f"Get bookmarks error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bookmarks"
        )


@router.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    club_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a bookmark

    - Authenticated users only
    - Can only delete own bookmarks
    """
    user_id = current_user['uid']

    try:
        await bookmark_service.delete_bookmark(user_id, club_id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        print(f"Delete bookmark error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete bookmark"
        )


@router.get("/{club_id}/check")
async def check_bookmark(
    club_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check if a specific club is bookmarked

    - Authenticated users only
    """
    user_id = current_user['uid']

    try:
        bookmark = await bookmark_service.get_user_bookmark(user_id, club_id)
        return {"is_bookmarked": bookmark is not None}
    except Exception as e:
        print(f"Check bookmark error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check bookmark"
        )
