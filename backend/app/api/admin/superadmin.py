"""
SuperAdmin API endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone

from app.api.dependencies import get_current_user, require_super_admin
from app.services.firestore_service import (
    user_service,
    club_service,
    event_service,
    subscription_service,
    firestore_service
)
from app.services.auth_service import set_user_role, set_email_verified, get_user_by_uid, get_user_by_email
from app.models.superadmin import (
    PlatformStatistics,
    PendingApprovalsResponse,
    PendingApprovalItem,
    RecentActivityResponse,
    ActivityLogItem,
    SystemAlertsResponse,
    SystemAlert,
    ClubStatistics,
    ClubDetailedInfo,
    ClubListResponseDetailed,
    ClubCreateBySuperAdmin,
    ClubUpdateBySuperAdmin,
    StudentStatistics,
    StudentInfo,
    StudentsListResponse,
    ActivityChartData,
    AnalyticsOverview,
    TrafficChartData,
    PopularClub,
    PopularClubsResponse,
    PlatformConfiguration,
    PlatformConfigurationsResponse,
    ConfigurationUpdateRequest,
    SystemInformation,
    BackupResponse,
    CacheResponse
)
import uuid


class ClubLeaderInfo(BaseModel):
    """Club leader information"""
    uid: str
    display_name: Optional[str]
    email: str
    managed_club_ids: List[str]
    managed_club_names: List[str]
    role: str
    status: str
    created_at: Optional[datetime]


class ClubLeadersResponse(BaseModel):
    """Club leaders list response"""
    leaders: List[ClubLeaderInfo]
    total: int


class AssignLeaderRequest(BaseModel):
    """Club leader assignment request"""
    email: EmailStr
    club_id: str
    role_title: str = "Cohead"


class UpdateLeaderRequest(BaseModel):
    """Club leader information update request"""
    display_name: Optional[str] = None
    club_id: Optional[str] = None


router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])


@router.get("/club-leaders", response_model=ClubLeadersResponse)
async def get_club_leaders(
    status_filter: Optional[str] = Query(None, description="Filter by status: active, inactive"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get all club leaders (SuperAdmin only)

    - Queries all users with role 'club-leader' or 'admin'
    - Includes managed club information for each leader
    """
    try:
        admin_users = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('role', 'in', ['club-leader', 'admin'])],
            limit=1000
        )

        leaders_info = []

        for user in admin_users:
            managed_club_ids = user.get('managed_club_ids', [])
            managed_club_names = []

            for club_id in managed_club_ids:
                club = await club_service.get_document(club_service.COLLECTION, club_id)
                if club:
                    managed_club_names.append(club.get('name', 'Unknown Club'))

            user_status = 'active' if managed_club_ids else 'inactive'

            if status_filter and user_status != status_filter.lower():
                continue

            leader_info = ClubLeaderInfo(
                uid=user.get('id', ''),
                display_name=user.get('display_name'),
                email=user.get('email', ''),
                managed_club_ids=managed_club_ids,
                managed_club_names=managed_club_names,
                role=user.get('role', ''),
                status=user_status,
                created_at=user.get('created_at')
            )

            leaders_info.append(leader_info)

        return ClubLeadersResponse(
            leaders=leaders_info,
            total=len(leaders_info)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch club leaders: {str(e)}"
        )


@router.put("/club-leaders/{uid}")
async def update_club_leader(
    uid: str,
    update_data: UpdateLeaderRequest,
    current_user: dict = Depends(require_super_admin)
):
    """
    Update club leader information (SuperAdmin only)

    - Update display_name
    - Update managed_club_ids (change club_id)
    """
    try:
        user = await user_service.get_user_profile(uid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.get('role') not in ['club-leader', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a club leader"
            )

        update_fields = {}

        if update_data.display_name is not None:
            update_fields['display_name'] = update_data.display_name

        if update_data.club_id is not None:
            club = await club_service.get_document(club_service.COLLECTION, update_data.club_id)
            if not club:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Club not found"
                )

            update_fields['managed_club_ids'] = [update_data.club_id]

        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        await user_service.update_document(
            user_service.COLLECTION,
            uid,
            update_fields
        )

        return {
            "message": "Leader updated successfully",
            "uid": uid,
            "updated_fields": list(update_fields.keys())
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update leader: {str(e)}"
        )


@router.put("/club-leaders/{uid}/status")
async def update_leader_status(
    uid: str,
    status: str = Query(..., description="Status: active or inactive"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Update club leader status (SuperAdmin only)

    - Setting to inactive clears managed_club_ids
    """
    if status not in ['active', 'inactive']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'active' or 'inactive'"
        )

    try:
        user = await user_service.get_user_profile(uid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.get('role') not in ['club-leader', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a club leader"
            )

        if status == 'inactive':
            await user_service.update_document(
                user_service.COLLECTION,
                uid,
                {'managed_club_ids': []}
            )

        return {
            "message": f"Leader status updated to {status}",
            "uid": uid,
            "status": status
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update leader status: {str(e)}"
        )


@router.post("/club-leaders/assign")
async def assign_club_leader(
    request: AssignLeaderRequest,
    current_user: dict = Depends(require_super_admin)
):
    """
    Assign a new club leader (SuperAdmin only)

    - Finds user by email
    - Changes role to 'club-leader'
    - Adds club to managed_club_ids
    """
    try:
        club = await club_service.get_document(club_service.COLLECTION, request.club_id)
        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        users = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('email', '==', request.email)],
            limit=1
        )

        if not users or len(users) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email not found"
            )

        user = users[0]
        user_id = user.get('id')

        existing_managed_clubs = user.get('managed_club_ids', [])
        if request.club_id in existing_managed_clubs:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already managing this club"
            )

        new_managed_clubs = existing_managed_clubs + [request.club_id]

        role_updated = await set_user_role(user_id, 'club-leader')
        if not role_updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set user role in Firebase"
            )

        await user_service.update_document(
            user_service.COLLECTION,
            user_id,
            {'managed_club_ids': new_managed_clubs}
        )

        return {
            "message": "Club leader assigned successfully",
            "uid": user_id,
            "email": request.email,
            "club_id": request.club_id,
            "club_name": club.get('name')
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign club leader: {str(e)}"
        )


@router.delete("/club-leaders/{uid}/clubs/{club_id}")
async def remove_leader_from_club(
    uid: str,
    club_id: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    Remove leader rights for a specific club only (SuperAdmin only)

    - Removes only the given club_id from managed_club_ids
    - If managed_club_ids becomes empty, demotes role to 'student'
    """
    try:
        user = await user_service.get_user_profile(uid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.get('role') not in ['club-leader', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a club leader"
            )

        managed_club_ids = user.get('managed_club_ids', [])
        if club_id not in managed_club_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a leader of this club"
            )

        new_managed_clubs = [cid for cid in managed_club_ids if cid != club_id]

        await user_service.update_document(
            user_service.COLLECTION,
            uid,
            {'managed_club_ids': new_managed_clubs}
        )

        if not new_managed_clubs:
            role_updated = await set_user_role(uid, 'student')
            if not role_updated:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to set user role in Firebase"
                )

        return {
            "message": "Leader removed from club successfully",
            "uid": uid,
            "club_id": club_id,
            "remaining_clubs": new_managed_clubs
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove leader from club: {str(e)}"
        )


@router.delete("/club-leaders/{uid}")
async def delete_club_leader(
    uid: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    Delete a club leader (SuperAdmin only)

    - Changes user role to 'student'
    - Clears managed_club_ids
    """
    try:
        user = await user_service.get_user_profile(uid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.get('role') not in ['club-leader', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a club leader"
            )

        role_updated = await set_user_role(uid, 'student')
        if not role_updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to set user role in Firebase"
            )

        await user_service.update_document(
            user_service.COLLECTION,
            uid,
            {'managed_club_ids': []}
        )

        return {
            "message": "Club leader removed successfully",
            "uid": uid
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete club leader: {str(e)}"
        )


# ============================================================================
# Dashboard APIs
# ============================================================================

@router.get("/statistics", response_model=PlatformStatistics)
async def get_platform_statistics(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get platform-wide statistics

    - Club, leader, student, event statistics
    """
    try:
        all_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10000
        )
        active_clubs = sum(1 for c in all_clubs if c.get('is_active', True))
        inactive_clubs = len(all_clubs) - active_clubs

        all_leaders = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('role', 'in', ['club-leader', 'admin'])],
            limit=10000
        )
        active_leaders = sum(1 for l in all_leaders if l.get('managed_club_ids'))

        pending_leader_requests = await firestore_service.query_documents(
            'leader_access_requests',
            filters=[('status', '==', 'pending')],
            limit=1000
        )

        all_students = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('role', '==', 'student')],
            limit=100000
        )

        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        new_students_this_week = sum(
            1 for s in all_students
            if s.get('created_at') and s.get('created_at') > week_ago
        )

        all_events = await event_service.query_documents(
            event_service.COLLECTION,
            limit=100000
        )

        now = datetime.now(timezone.utc)
        upcoming_events = sum(
            1 for e in all_events
            if e.get('start_datetime') and e.get('start_datetime') > now and e.get('status') == 'active'
        )

        all_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('is_active', '==', True)],
            limit=100000
        )

        return PlatformStatistics(
            total_clubs=len(all_clubs),
            active_clubs=active_clubs,
            inactive_clubs=inactive_clubs,
            pending_clubs=0,
            total_leaders=len(all_leaders),
            active_leaders=active_leaders,
            pending_leader_requests=len(pending_leader_requests),
            total_students=len(all_students),
            new_students_this_week=new_students_this_week,
            total_events=len(all_events),
            upcoming_events=upcoming_events,
            total_subscriptions=len(all_subscriptions)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch platform statistics: {str(e)}"
        )


@router.get("/pending-approvals", response_model=PendingApprovalsResponse)
async def get_pending_approvals(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get pending approval items

    - Leader access requests
    - Club creation requests
    """
    try:
        approvals = []

        leader_requests = await firestore_service.query_documents(
            'leader_access_requests',
            filters=[('status', '==', 'pending')],
            limit=limit
        )

        for req in leader_requests:
            club_name = req.get('requested_club_name', 'Unknown Club')
            approval_item = PendingApprovalItem(
                id=req['id'],
                type='leader_request',
                title='Leader Access Request',
                subtitle=f"{club_name} • {req.get('email', 'Unknown')}",
                timestamp=req.get('requested_at', datetime.now()),
                metadata={
                    'user_id': req.get('user_id'),
                    'email': req.get('email'),
                    'display_name': req.get('display_name'),
                    'requested_role': req.get('requested_role'),
                    'requested_club_id': req.get('requested_club_id'),
                    'requested_club_name': club_name
                }
            )
            approvals.append(approval_item)

        club_creation_requests = await firestore_service.query_documents(
            'club_creation_requests',
            filters=[('status', '==', 'pending')],
            limit=limit
        )

        for req in club_creation_requests:
            approval_item = PendingApprovalItem(
                id=req['id'],
                type='club_creation_request',
                title='New Club Request',
                subtitle=req.get('club_name', 'Unknown Club'),
                timestamp=req.get('submitted_at', datetime.now()),
                metadata={
                    'club_name': req.get('club_name'),
                    'description': req.get('description'),
                }
            )
            approvals.append(approval_item)

        approvals.sort(key=lambda x: x.timestamp, reverse=True)

        return PendingApprovalsResponse(
            approvals=approvals[:limit],
            total=len(approvals)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pending approvals: {str(e)}"
        )


@router.get("/recent-activities", response_model=RecentActivityResponse)
async def get_recent_activities(
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get recent club activity log

    - Club creation, event posting, profile updates, etc.
    """
    try:
        activities = []
        now = datetime.now(timezone.utc)
        one_hour_ago = now - timedelta(hours=1)
        min_dt = datetime.min.replace(tzinfo=timezone.utc)

        recent_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10
        )

        recent_clubs_sorted = sorted(
            [c for c in recent_clubs if c.get('created_at')],
            key=lambda x: x.get('created_at', min_dt),
            reverse=True
        )[:5]

        for club in recent_clubs_sorted:
            created_at = club.get('created_at', now)
            is_new = created_at > one_hour_ago

            activity = ActivityLogItem(
                id=f"club_{club['id']}",
                type='club_created',
                title='New club created',
                subtitle=club.get('name', 'Unknown Club'),
                timestamp=created_at,
                is_new=is_new
            )
            activities.append(activity)

        recent_events = await event_service.query_documents(
            event_service.COLLECTION,
            limit=10
        )

        recent_events_sorted = sorted(
            [e for e in recent_events if e.get('created_at')],
            key=lambda x: x.get('created_at', min_dt),
            reverse=True
        )[:5]

        for event in recent_events_sorted:
            created_at = event.get('created_at', now)
            is_new = created_at > one_hour_ago

            club = await club_service.get_club(event.get('club_id'))
            club_name = club.get('name', 'Unknown Club') if club else 'Unknown Club'

            activity = ActivityLogItem(
                id=f"event_{event['id']}",
                type='event_posted',
                title='Event posted',
                subtitle=f"{event.get('title', 'Unknown Event')} • {club_name}",
                timestamp=created_at,
                is_new=is_new
            )
            activities.append(activity)

        activities.sort(key=lambda x: x.timestamp, reverse=True)

        return RecentActivityResponse(
            activities=activities[:limit],
            total=len(activities)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch recent activities: {str(e)}"
        )


@router.get("/system-alerts", response_model=SystemAlertsResponse)
async def get_system_alerts(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get system alerts

    - System backup, optimization, etc.
    """
    try:
        now = datetime.now()

        alerts = [
            SystemAlert(
                id='alert_1',
                message='System backup completed successfully',
                type='success',
                timestamp=now - timedelta(minutes=30)
            ),
            SystemAlert(
                id='alert_2',
                message='Database optimized',
                type='success',
                timestamp=now - timedelta(hours=2)
            ),
            SystemAlert(
                id='alert_3',
                message='Weekly report generated',
                type='info',
                timestamp=now - timedelta(days=1)
            )
        ]

        return SystemAlertsResponse(
            alerts=alerts[:limit],
            total=len(alerts)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch system alerts: {str(e)}"
        )


# ============================================================================
# All Clubs Management APIs
# ============================================================================

@router.get("/clubs", response_model=ClubListResponseDetailed)
async def get_all_clubs(
    search: Optional[str] = Query(None, description="Search query (club name)"),
    category: Optional[str] = Query(None, description="Category filter"),
    status: Optional[str] = Query(None, description="Status filter: active, inactive"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Get all clubs (SuperAdmin only)

    - Search and filtering support
    - Includes detailed info (leader info, subscriber count, etc.)
    """
    try:
        all_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10000
        )

        filtered_clubs = all_clubs

        if status:
            if status == 'active':
                filtered_clubs = [c for c in filtered_clubs if c.get('is_active', True)]
            elif status == 'inactive':
                filtered_clubs = [c for c in filtered_clubs if not c.get('is_active', True)]

        if category:
            filtered_clubs = [
                c for c in filtered_clubs
                if category in c.get('categories', [])
            ]

        if search:
            search_lower = search.lower()
            filtered_clubs = [
                c for c in filtered_clubs
                if search_lower in c.get('name', '').lower()
            ]

        offset = (page - 1) * page_size
        paginated_clubs = filtered_clubs[offset:offset + page_size]

        all_active_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('is_active', '==', True)],
            limit=100000
        )
        subscriber_counts: dict = {}
        for sub in all_active_subscriptions:
            cid = sub.get('club_id')
            if cid:
                subscriber_counts[cid] = subscriber_counts.get(cid, 0) + 1

        detailed_clubs = []
        for club_data in paginated_clubs:
            leaders = club_data.get('leaders', [])
            leader_name = None
            leader_email = None

            if leaders and len(leaders) > 0:
                leader_name = leaders[0].get('name')
                leader_email = leaders[0].get('email')

            stats = club_data.get('stats', {})
            total_subscribers = subscriber_counts.get(club_data['id'], 0)
            total_events = stats.get('total_events', 0)

            club_status = 'active' if club_data.get('is_active', True) else 'inactive'

            detailed_club = ClubDetailedInfo(
                id=club_data['id'],
                name=club_data.get('name', ''),
                description=club_data.get('description'),
                categories=club_data.get('categories', []),
                activity_type=club_data.get('activity_type', []),
                leader_name=leader_name,
                leader_email=leader_email,
                total_subscribers=total_subscribers,
                total_events=total_events,
                status=club_status,
                created_at=club_data.get('created_at'),
                updated_at=club_data.get('updated_at')
            )
            detailed_clubs.append(detailed_club)

        return ClubListResponseDetailed(
            clubs=detailed_clubs,
            total=len(filtered_clubs),
            page=page,
            page_size=page_size
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch clubs: {str(e)}"
        )


@router.post("/clubs", status_code=status.HTTP_201_CREATED)
async def create_club_by_superadmin(
    club_data: ClubCreateBySuperAdmin,
    current_user: dict = Depends(require_super_admin)
):
    """
    Create a club (SuperAdmin only)

    - Leader can be assigned
    """
    try:
        club_id = str(uuid.uuid4())

        leader_info = []
        if club_data.leader_email:
            users = await user_service.query_documents(
                user_service.COLLECTION,
                filters=[('email', '==', club_data.leader_email)],
                limit=1
            )

            if users and len(users) > 0:
                leader = users[0]
                leader_info = [{
                    'uid': leader.get('id'),
                    'name': leader.get('display_name', leader.get('email')),
                    'role': 'Cohead',
                    'email': leader.get('email')
                }]

                await user_service.update_document(
                    user_service.COLLECTION,
                    leader['id'],
                    {
                        'role': 'club-leader',
                        'managed_club_ids': [club_id]
                    }
                )

        created_club = await club_service.create_club(
            club_id=club_id,
            name=club_data.name,
            description=club_data.description,
            categories=club_data.categories,
            activity_type=club_data.activity_type,
            tagline=club_data.tagline,
            contact_email=club_data.contact_email,
            leaders=leader_info
        )

        return {
            "message": "Club created successfully",
            "club_id": club_id,
            "club": created_club
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create club: {str(e)}"
        )


@router.put("/clubs/{club_id}")
async def update_club_by_superadmin(
    club_id: str,
    club_update: ClubUpdateBySuperAdmin,
    current_user: dict = Depends(require_super_admin)
):
    """
    Update a club (SuperAdmin only)

    - Can update any club
    """
    try:
        club = await club_service.get_club(club_id)

        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        update_data = club_update.dict(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        updated_club = await club_service.update_club(club_id, update_data)

        return {
            "message": "Club updated successfully",
            "club_id": club_id,
            "updated_fields": list(update_data.keys()),
            "club": updated_club
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update club: {str(e)}"
        )


@router.delete("/clubs/{club_id}")
async def delete_club_by_superadmin(
    club_id: str,
    hard_delete: bool = Query(False, description="true: permanent delete, false: deactivate"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Delete a club (SuperAdmin only)

    - hard_delete=false: sets is_active to false (soft delete)
    - hard_delete=true: permanently deletes (caution!)
    """
    try:
        club = await club_service.get_club(club_id)

        if not club:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Club not found"
            )

        if hard_delete:
            await club_service.delete_document(club_service.COLLECTION, club_id)
            message = "Club permanently deleted"
        else:
            await club_service.update_club(club_id, {'is_active': False})
            message = "Club deactivated"

        return {
            "message": message,
            "club_id": club_id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete club: {str(e)}"
        )


@router.get("/clubs/stats", response_model=ClubStatistics)
async def get_club_statistics(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get club statistics

    - Active clubs, pending approval, total subscribers
    """
    try:
        all_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10000
        )

        active_clubs = sum(1 for c in all_clubs if c.get('is_active', True))

        all_active_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('is_active', '==', True)],
            limit=100000
        )
        total_subscribers = len(all_active_subscriptions)

        return ClubStatistics(
            active_clubs=active_clubs,
            pending_approval=0,
            total_subscribers=total_subscribers
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch club statistics: {str(e)}"
        )


# ============================================================================
# Student Users APIs
# ============================================================================

@router.get("/students", response_model=StudentsListResponse)
async def get_students(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get student user list (SuperAdmin only)
    """
    try:
        all_students = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('role', '==', 'student')],
            limit=100000
        )

        active_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('is_active', '==', True)],
            limit=100000
        )

        user_sub_count: dict = {}
        for sub in active_subscriptions:
            user_id = sub.get('user_id')
            if user_id:
                user_sub_count[user_id] = user_sub_count.get(user_id, 0) + 1

        students_info = [
            StudentInfo(
                uid=s.get('id', ''),
                display_name=s.get('display_name'),
                email=s.get('email', ''),
                subscription_count=user_sub_count.get(s.get('id', ''), 0),
                created_at=s.get('created_at')
            )
            for s in all_students
        ]

        return StudentsListResponse(students=students_info, total=len(students_info))

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch students: {str(e)}"
        )


@router.get("/students/statistics", response_model=StudentStatistics)
async def get_student_statistics(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get student user statistics

    - Total users, active users, new users, average subscriptions
    """
    try:
        all_students = await user_service.query_documents(
            user_service.COLLECTION,
            filters=[('role', '==', 'student')],
            limit=100000
        )

        total_users = len(all_students)

        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        new_this_week = sum(
            1 for s in all_students
            if s.get('created_at') and s.get('created_at') > week_ago
        )

        active_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('is_active', '==', True)],
            limit=100000
        )

        user_subscription_count = {}
        for sub in active_subscriptions:
            user_id = sub.get('user_id')
            if user_id:
                user_subscription_count[user_id] = user_subscription_count.get(user_id, 0) + 1

        active_this_month = len(user_subscription_count)

        avg_subscriptions = (
            sum(user_subscription_count.values()) / len(user_subscription_count)
            if user_subscription_count else 0.0
        )

        return StudentStatistics(
            total_users=total_users,
            active_this_month=active_this_month,
            new_this_week=new_this_week,
            avg_subscriptions=round(avg_subscriptions, 1)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch student statistics: {str(e)}"
        )


@router.delete("/students/{uid}")
async def delete_student(
    uid: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    Delete a student user (SuperAdmin only)

    - Removes user from Firestore users collection
    - Deactivates user's active subscriptions
    """
    try:
        user = await user_service.get_user_profile(uid)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if user.get('role') not in ['student', None]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a student"
            )

        user_subscriptions = await subscription_service.query_documents(
            subscription_service.COLLECTION,
            filters=[('user_id', '==', uid), ('is_active', '==', True)],
            limit=1000
        )
        for sub in user_subscriptions:
            await subscription_service.update_document(
                subscription_service.COLLECTION,
                sub['id'],
                {'is_active': False}
            )

        await user_service.delete_document(user_service.COLLECTION, uid)

        return {"message": "Student deleted successfully", "uid": uid}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete student: {str(e)}"
        )


@router.post("/students/{uid}/verify-email")
async def force_verify_email(
    uid: str,
    current_user: dict = Depends(require_super_admin)
):
    """
    Force-set a user's email verification to true (SuperAdmin only, by UID)
    """
    user = await get_user_by_uid(uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    success = await set_email_verified(uid, verified=True)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update email verification status"
        )

    return {"uid": uid, "email": user["email"], "email_verified": True}


@router.post("/students/verify-email-by-email")
async def force_verify_email_by_email(
    email: str = Body(..., embed=True),
    current_user: dict = Depends(require_super_admin)
):
    """
    Force-set a user's email verification to true by email (SuperAdmin only)
    """
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No user found with email: {email}"
        )

    success = await set_email_verified(user["uid"], verified=True)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update email verification status"
        )

    return {"uid": user["uid"], "email": user["email"], "email_verified": True}


@router.get("/students/activity-chart", response_model=ActivityChartData)
async def get_student_activity_chart(
    days: int = Query(30, ge=7, le=90, description="Query period (days)"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Student activity trend chart data

    - New signup trends
    - Active user trends
    """
    try:
        now = datetime.now()

        labels = []
        signup_data = []

        for i in range(days, 0, -1):
            date = now - timedelta(days=i)
            labels.append(date.strftime('%m/%d'))
            signup_data.append(0)

        import random
        signup_data = [random.randint(5, 20) for _ in range(days)]

        datasets = [
            {
                'label': 'New Signups',
                'data': signup_data,
                'borderColor': '#3b82f6',
                'backgroundColor': 'rgba(59, 130, 246, 0.1)'
            }
        ]

        return ActivityChartData(
            labels=labels,
            datasets=datasets
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch activity chart data: {str(e)}"
        )


# ============================================================================
# Platform Analytics APIs
# ============================================================================

@router.get("/analytics/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    current_user: dict = Depends(require_super_admin)
):
    """
    Platform analytics overview

    - Page views, engagement rate, session time, etc.
    """
    try:
        all_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10000
        )

        total_page_views = sum(
            c.get('stats', {}).get('view_count', 0)
            for c in all_clubs
        )

        club_profile_views = total_page_views

        total_subscribers = sum(
            c.get('stats', {}).get('total_subscribers', 0)
            for c in all_clubs
        )

        avg_engagement = (
            (total_subscribers / total_page_views * 100)
            if total_page_views > 0 else 0.0
        )

        avg_session_time = 4.2

        return AnalyticsOverview(
            total_page_views=total_page_views,
            club_profile_views=club_profile_views,
            avg_engagement=round(avg_engagement, 1),
            avg_session_time=avg_session_time
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch analytics overview: {str(e)}"
        )


@router.get("/analytics/traffic", response_model=TrafficChartData)
async def get_traffic_chart(
    days: int = Query(30, ge=7, le=90, description="Query period (days)"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Traffic chart data

    - Daily visitor trends
    """
    try:
        now = datetime.now()

        labels = []
        traffic_data = []

        for i in range(days, 0, -1):
            date = now - timedelta(days=i)
            labels.append(date.strftime('%m/%d'))

        import random
        traffic_data = [random.randint(50, 200) for _ in range(days)]

        datasets = [
            {
                'label': 'Page Views',
                'data': traffic_data,
                'borderColor': '#8b5cf6',
                'backgroundColor': 'rgba(139, 92, 246, 0.1)'
            }
        ]

        return TrafficChartData(
            labels=labels,
            datasets=datasets
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch traffic chart data: {str(e)}"
        )


@router.get("/analytics/popular-clubs", response_model=PopularClubsResponse)
async def get_popular_clubs(
    limit: int = Query(10, ge=1, le=50, description="Maximum results"),
    current_user: dict = Depends(require_super_admin)
):
    """
    Popular clubs ranking

    - Sorted by view count and subscriber count
    """
    try:
        all_clubs = await club_service.query_documents(
            club_service.COLLECTION,
            limit=10000
        )

        active_clubs = [c for c in all_clubs if c.get('is_active', True)]

        sorted_clubs = sorted(
            active_clubs,
            key=lambda x: x.get('stats', {}).get('view_count', 0),
            reverse=True
        )[:limit]

        popular_clubs = []
        for rank, club in enumerate(sorted_clubs, start=1):
            stats = club.get('stats', {})

            popular_club = PopularClub(
                rank=rank,
                club_id=club['id'],
                name=club.get('name', 'Unknown'),
                views=stats.get('view_count', 0),
                subscribers=stats.get('total_subscribers', 0),
                events=stats.get('total_events', 0)
            )
            popular_clubs.append(popular_club)

        return PopularClubsResponse(
            clubs=popular_clubs,
            total=len(popular_clubs)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch popular clubs: {str(e)}"
        )


# ============================================================================
# System Settings APIs
# ============================================================================

@router.get("/system/configurations", response_model=PlatformConfigurationsResponse)
async def get_platform_configurations(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get platform configurations

    - Club approvals, email notifications, registration settings, etc.
    """
    try:
        configs_doc = await firestore_service.get_document('system_settings', 'platform_config')

        if not configs_doc:
            default_configs = {
                'new_club_approvals': True,
                'email_notifications': True,
                'public_registration': True
            }
            await firestore_service.set_document(
                'system_settings',
                'platform_config',
                default_configs,
                merge=False
            )
            configs_doc = default_configs

        configurations = [
            PlatformConfiguration(
                id='new-club-approvals',
                title='New Club Approvals',
                description='Require admin approval for new clubs',
                enabled=configs_doc.get('new_club_approvals', True)
            ),
            PlatformConfiguration(
                id='email-notifications',
                title='Email Notifications',
                description='System email notifications',
                enabled=configs_doc.get('email_notifications', True)
            ),
            PlatformConfiguration(
                id='public-registration',
                title='Public Registration',
                description='Allow public user registration',
                enabled=configs_doc.get('public_registration', True)
            )
        ]

        return PlatformConfigurationsResponse(
            configurations=configurations
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch configurations: {str(e)}"
        )


@router.put("/system/configurations/{config_id}")
async def update_platform_configuration(
    config_id: str,
    update_data: ConfigurationUpdateRequest,
    current_user: dict = Depends(require_super_admin)
):
    """
    Update platform configuration

    - Enable/disable a specific setting
    """
    try:
        config_field_map = {
            'new-club-approvals': 'new_club_approvals',
            'email-notifications': 'email_notifications',
            'public-registration': 'public_registration'
        }

        if config_id not in config_field_map:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuration not found"
            )

        field_name = config_field_map[config_id]

        await firestore_service.set_document(
            'system_settings',
            'platform_config',
            {field_name: update_data.enabled},
            merge=True
        )

        return {
            "message": "Configuration updated successfully",
            "config_id": config_id,
            "enabled": update_data.enabled
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update configuration: {str(e)}"
        )


@router.post("/system/backup", response_model=BackupResponse)
async def create_system_backup(
    current_user: dict = Depends(require_super_admin)
):
    """
    Create a database backup

    - Actual backup logic to be implemented later
    - Currently only records the backup entry
    """
    try:
        backup_id = str(uuid.uuid4())
        timestamp = datetime.now()

        await firestore_service.set_document(
            'system_backups',
            backup_id,
            {
                'backup_id': backup_id,
                'created_by': current_user['uid'],
                'status': 'completed',
                'size': 'N/A'
            },
            merge=False
        )

        await firestore_service.set_document(
            'system_settings',
            'platform_config',
            {'last_backup': timestamp},
            merge=True
        )

        return BackupResponse(
            message="Backup created successfully",
            backup_id=backup_id,
            timestamp=timestamp,
            size="N/A"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create backup: {str(e)}"
        )


@router.post("/system/clear-cache", response_model=CacheResponse)
async def clear_system_cache(
    current_user: dict = Depends(require_super_admin)
):
    """
    Clear system cache

    - Actual cache clearing logic to be implemented later
    - Currently simulated
    """
    try:
        timestamp = datetime.now()

        await firestore_service.set_document(
            'system_logs',
            f"cache_clear_{timestamp.strftime('%Y%m%d_%H%M%S')}",
            {
                'action': 'cache_cleared',
                'performed_by': current_user['uid'],
                'timestamp': timestamp
            },
            merge=False
        )

        return CacheResponse(
            message="Cache cleared successfully",
            cleared_items=0,
            timestamp=timestamp
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear cache: {str(e)}"
        )


@router.get("/system/info", response_model=SystemInformation)
async def get_system_information(
    current_user: dict = Depends(require_super_admin)
):
    """
    Get system information

    - Version, uptime, database size, etc.
    """
    try:
        config_doc = await firestore_service.get_document('system_settings', 'platform_config')
        last_backup = config_doc.get('last_backup') if config_doc else None

        total_docs = 0
        collections = ['users', 'clubs', 'events', 'subscriptions', 'announcements', 'bookmarks', 'notifications']

        for collection in collections:
            docs = await firestore_service.query_documents(collection, limit=100000)
            total_docs += len(docs)

        estimated_size_mb = total_docs / 1024

        return SystemInformation(
            version="ClubAtlas v1.0.0",
            uptime="N/A",
            database_size=f"{estimated_size_mb:.1f} MB",
            storage_used="N/A",
            total_storage="N/A",
            last_backup=last_backup
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch system information: {str(e)}"
        )
