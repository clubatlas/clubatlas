"""
Users API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.user import (
    UserProfileCreate,
    UserProfileUpdate,
    UserProfileResponse,
    ProfileEditRequest,
    RecommendationPreferencesUpdate,
    NotificationPreferencesUpdate,
    UserNotificationPreferences,
)
from app.api.dependencies import get_current_user, get_current_user_optional
from app.services.firestore_service import user_service, subscription_service, bookmark_service
from app.services.firebase_admin import get_auth

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/check-email")
async def check_email_exists(
    email: str = Query(..., description="Email address to check"),
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Check whether a user account exists for the given email.
    - Returns exists: true and role if found
    - Returns exists: false if not found
    """
    users = await user_service.query_documents(
        user_service.COLLECTION,
        filters=[('email', '==', email)],
        limit=1
    )
    if not users:
        return {"exists": False}
    return {"exists": True, "role": users[0].get('role', 'student')}


@router.post("/profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_profile(
    profile_data: UserProfileCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create or update user profile.

    - Creates profile on first login
    - Updates if profile already exists
    """
    uid = current_user['uid']
    email = current_user.get('email', '')

    existing_profile = await user_service.get_user_profile(uid)

    if existing_profile:
        updated_data = {}
        if profile_data.display_name:
            updated_data['display_name'] = profile_data.display_name
        if profile_data.interests:
            updated_data['interests'] = profile_data.interests

        result = await user_service.update_document(
            user_service.COLLECTION,
            uid,
            updated_data
        )
    else:
        result = await user_service.create_user_profile(
            uid=uid,
            email=email,
            display_name=profile_data.display_name,
            interests=profile_data.interests
        )

    return UserProfileResponse(
        uid=result['id'],
        email=result['email'],
        display_name=result.get('display_name'),
        role=result.get('role', 'student'),
        interests=result.get('interests', []),
        recommendation_preferences=result.get('recommendation_preferences'),
        created_at=result.get('created_at'),
        updated_at=result.get('updated_at')
    )


@router.get("/profile", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Get my profile
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile first."
        )

    display_name = profile.get('display_name') or ''
    stored_first = profile.get('first_name')
    stored_last = profile.get('last_name')

    if stored_first is None and stored_last is None and display_name:
        parts = display_name.split(' ', 1)
        derived_first = parts[0]
        derived_last = parts[1] if len(parts) > 1 else ''
    else:
        derived_first = stored_first
        derived_last = stored_last

    raw_notif = profile.get('notification_preferences')
    notif_prefs = UserNotificationPreferences(
        email_notifications=raw_notif.get('email_notifications', True) if raw_notif else True,
        event_reminders=raw_notif.get('event_reminders', True) if raw_notif else True,
    )

    return UserProfileResponse(
        uid=profile['id'],
        email=profile['email'],
        display_name=display_name or None,
        first_name=derived_first,
        last_name=derived_last,
        role=profile.get('role', 'student'),
        student_id=profile.get('student_id'),
        interests=profile.get('interests', []),
        recommendation_preferences=profile.get('recommendation_preferences'),
        notification_preferences=notif_prefs,
        created_at=profile.get('created_at'),
        updated_at=profile.get('updated_at')
    )


@router.put("/profile", response_model=UserProfileResponse)
async def edit_profile(
    profile_data: ProfileEditRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Edit profile (Edit Profile modal)

    - Edit first_name, last_name, email, student_id
    - Automatically updates display_name when first_name/last_name changes
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    updated_data = {}
    if profile_data.first_name is not None:
        updated_data['first_name'] = profile_data.first_name
    if profile_data.last_name is not None:
        updated_data['last_name'] = profile_data.last_name
    if profile_data.email is not None:
        updated_data['email'] = profile_data.email
    if profile_data.student_id is not None:
        updated_data['student_id'] = profile_data.student_id

    if 'first_name' in updated_data or 'last_name' in updated_data:
        new_first = updated_data.get('first_name', profile.get('first_name', ''))
        new_last = updated_data.get('last_name', profile.get('last_name', ''))
        updated_data['display_name'] = f"{new_first} {new_last}".strip()

    result = await user_service.update_document(
        user_service.COLLECTION,
        uid,
        updated_data
    )

    return UserProfileResponse(
        uid=result['id'],
        email=result['email'],
        display_name=result.get('display_name'),
        first_name=result.get('first_name'),
        last_name=result.get('last_name'),
        role=result.get('role', 'student'),
        student_id=result.get('student_id'),
        interests=result.get('interests', []),
        recommendation_preferences=result.get('recommendation_preferences'),
        created_at=result.get('created_at'),
        updated_at=result.get('updated_at')
    )


@router.put("/interests")
async def update_interests(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user interests
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    if profile_update.interests is not None:
        await user_service.update_user_interests(uid, profile_update.interests)

    return {"message": "Interests updated successfully"}


@router.post("/recommendation-preferences")
async def create_recommendation_preferences(
    preferences: RecommendationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Save AI recommendation preferences (3 items collected from AI form)

    - preferred_categories: Interested club categories
    - preferred_activity_types: Desired activity types
    - available_time_slots: Available time slots
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile first."
        )

    await user_service.update_recommendation_preferences(
        uid=uid,
        preferred_categories=preferences.preferred_categories,
        preferred_activity_types=preferences.preferred_activity_types,
        available_time_slots=preferences.available_time_slots,
        source='ai-form'
    )

    return {
        "message": "Recommendation preferences saved successfully",
        "preferences": {
            "preferred_categories": preferences.preferred_categories,
            "preferred_activity_types": preferences.preferred_activity_types,
            "available_time_slots": preferences.available_time_slots
        }
    }


@router.get("/recommendation-preferences")
async def get_recommendation_preferences(
    current_user: dict = Depends(get_current_user)
):
    """
    Get saved recommendation preferences
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    preferences = profile.get('recommendation_preferences')

    if not preferences:
        return {
            "message": "No preferences found",
            "preferences": None
        }

    return {
        "message": "Preferences retrieved successfully",
        "preferences": preferences
    }


@router.put("/notification-preferences")
async def update_notification_preferences(
    prefs: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user notification preferences
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    await user_service.update_notification_preferences(
        uid=uid,
        email_notifications=prefs.email_notifications,
        event_reminders=prefs.event_reminders,
    )

    return {
        "message": "Notification preferences updated successfully",
        "notification_preferences": {
            "email_notifications": prefs.email_notifications,
            "event_reminders": prefs.event_reminders,
        }
    }


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """
    Delete account

    - Delete Firestore user profile
    - Delete subscription data
    - Delete bookmark data
    - Delete Firebase Auth account
    """
    uid = current_user['uid']

    subscriptions = await subscription_service.query_documents(
        subscription_service.COLLECTION,
        filters=[('user_id', '==', uid)]
    )
    for sub in subscriptions:
        await subscription_service.delete_document(subscription_service.COLLECTION, sub['id'])

    bookmarks = await bookmark_service.query_documents(
        bookmark_service.COLLECTION,
        filters=[('user_id', '==', uid)]
    )
    for bm in bookmarks:
        await bookmark_service.delete_document(bookmark_service.COLLECTION, bm['id'])

    await user_service.delete_document(user_service.COLLECTION, uid)

    try:
        get_auth().delete_user(uid)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the account: {str(e)}"
        )


@router.put("/recommendation-preferences")
async def update_recommendation_preferences(
    preferences: RecommendationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update recommendation preferences
    """
    uid = current_user['uid']

    profile = await user_service.get_user_profile(uid)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    await user_service.update_recommendation_preferences(
        uid=uid,
        preferred_categories=preferences.preferred_categories,
        preferred_activity_types=preferences.preferred_activity_types,
        available_time_slots=preferences.available_time_slots,
        source='profile'
    )

    return {
        "message": "Recommendation preferences updated successfully"
    }
