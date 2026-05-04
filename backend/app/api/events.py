"""
Events API endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timezone
from app.models.event import (
    Event,
    EventCreate,
    EventUpdate,
    EventListResponse,
    AttendanceRecord,
    AttendanceStats,
    AttendanceHistoryResponse
)
from app.api.dependencies import get_current_user, require_club_leader, get_current_user_optional
from app.services.firestore_service import event_service, club_service, user_service, subscription_service, notification_service
import uuid

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("", response_model=Event, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: dict = Depends(require_club_leader)
):
    """
    Create event

    - Club leader only
    - Can only create events for clubs you manage
    """
    user_id = current_user['uid']
    club_id = event_data.club_id
    
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
            detail="You can only create events for clubs you manage"
        )
    
    try:
        event_id = str(uuid.uuid4())
        
        created_event = await event_service.create_event(
            event_id=event_id,
            club_id=club_id,
            title=event_data.title,
            description=event_data.description,
            start_datetime=event_data.start_datetime,
            end_datetime=event_data.end_datetime,
            location=event_data.location,
            created_by=user_id,
            event_type=event_data.event_type,
            max_attendees=event_data.max_attendees
        )
        
        return Event(**created_event)
    except Exception as e:
        print(f"Create event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event"
        )


@router.get("", response_model=EventListResponse)
async def get_events(
    club_id: Optional[str] = Query(None, description="Filter by club ID"),
    status_filter: Optional[str] = Query(None, description="Filter by status: active, cancelled, completed"),
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    limit: int = Query(50, ge=1, le=100, description="Max count"),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get event list

    - Filtering: club_id, status, date range
    - Authentication optional
    """
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        events = await event_service.get_events(
            club_id=club_id,
            status=status_filter,
            start_date=start_dt,
            end_date=end_dt,
            limit=limit
        )
        
        event_objects = [Event(**event_data) for event_data in events]
        
        return EventListResponse(
            events=event_objects,
            total=len(event_objects)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format: {str(e)}"
        )
    except RuntimeError:
        return EventListResponse(
            events=[],
            total=0
        )


@router.get("/my-calendar", response_model=EventListResponse)
async def get_my_calendar_events(
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get my calendar events

    - Returns events from subscribed clubs
    - Returns events from managed clubs
    """
    user_id = current_user['uid']
    
    try:
        from app.services.firestore_service import subscription_service
        
        club_ids = set()
        
        subscriptions = await subscription_service.get_user_subscriptions(
            user_id,
            active_only=True
        )
        
        if subscriptions:
            club_ids.update([sub['club_id'] for sub in subscriptions])
        
        user_profile = await user_service.get_user_profile(user_id)
        managed_clubs = user_profile.get('managed_club_ids', [])
        if managed_clubs:
            club_ids.update(managed_clubs)
        
        if not club_ids:
            return EventListResponse(events=[], total=0)
        
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None
        
        all_events = []
        for club_id in club_ids:
            events = await event_service.get_events(
                club_id=club_id,
                status='active',
                start_date=start_dt,
                end_date=end_dt,
                limit=100
            )
            all_events.extend(events)
        
        all_events.sort(key=lambda x: x['start_datetime'])
        
        event_objects = [Event(**event_data) for event_data in all_events]
        
        return EventListResponse(
            events=event_objects,
            total=len(event_objects)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format: {str(e)}"
        )
    except Exception as e:
        print(f"Get my calendar error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get calendar events"
        )


@router.get("/my-attendance", response_model=AttendanceHistoryResponse)
async def get_my_attendance_history(
    status_filter: Optional[str] = Query(None, description="attended, missed, all"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get my event attendance history

    - Based on past events of subscribed clubs
    - Distinguishes attended and missed events
    - Provides attendance statistics
    """
    user_id = current_user['uid']

    try:
        from app.services.firestore_service import subscription_service

        subscriptions = await subscription_service.get_user_subscriptions(
            user_id,
            active_only=True
        )

        if not subscriptions:
            return AttendanceHistoryResponse(
                records=[],
                stats=AttendanceStats(
                    total_events=0,
                    attended=0,
                    missed=0,
                    attendance_rate=0.0
                )
            )

        club_ids = [sub['club_id'] for sub in subscriptions]

        now = datetime.now(timezone.utc)

        all_events = []
        club_names = {}

        for club_id in club_ids:
            club = await club_service.get_club(club_id)
            if club:
                club_names[club_id] = club['name']

            events = await event_service.get_events(
                club_id=club_id,
                status=None,
                start_date=None,
                end_date=now,
                limit=100
            )

            for event in events:
                end_dt = event['end_datetime']
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=timezone.utc)
                if end_dt < now:
                    all_events.append((club_id, event))

        records = []
        attended_count = 0
        missed_count = 0

        for club_id, event_data in all_events:
            is_attended = user_id in event_data.get('attendees', [])
            attendance_status = 'attended' if is_attended else 'missed'

            if is_attended:
                attended_count += 1
            else:
                missed_count += 1

            if status_filter and status_filter != 'all':
                if status_filter != attendance_status:
                    continue

            record = AttendanceRecord(
                event=Event(**event_data),
                status=attendance_status,
                club_name=club_names.get(club_id, 'Unknown Club')
            )
            records.append(record)

        records.sort(key=lambda x: x.event.end_datetime, reverse=True)

        total_events = attended_count + missed_count
        attendance_rate = (attended_count / total_events * 100) if total_events > 0 else 0.0

        stats = AttendanceStats(
            total_events=total_events,
            attended=attended_count,
            missed=missed_count,
            attendance_rate=round(attendance_rate, 1)
        )

        return AttendanceHistoryResponse(
            records=records,
            stats=stats
        )

    except Exception as e:
        print(f"Get attendance history error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get attendance history"
        )


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get event details

    - Authentication optional
    """
    event_data = await event_service.get_event(event_id)
    
    if not event_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return Event(**event_data)


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: dict = Depends(require_club_leader)
):
    """
    Update event

    - Club leader only
    - Can only modify events for clubs you manage
    """
    user_id = current_user['uid']
    
    existing_event = await event_service.get_event(event_id)
    
    if not existing_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    event_club_id = existing_event['club_id']
    
    if event_club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify events for clubs you manage"
        )
    
    try:
        update_data = event_update.dict(exclude_unset=True)
        updated_event = await event_service.update_event(event_id, update_data)
        
        return Event(**updated_event)
    except Exception as e:
        print(f"Update event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event"
        )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: dict = Depends(require_club_leader)
):
    """
    Delete event (soft delete - changes status to cancelled)

    - Club leader only
    - Can only delete events for clubs you manage
    """
    user_id = current_user['uid']
    
    existing_event = await event_service.get_event(event_id)
    
    if not existing_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    
    event_club_id = existing_event['club_id']
    
    if event_club_id not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete events for clubs you manage"
        )
    
    try:
        club = await club_service.get_club(existing_event['club_id'])
        club_name = club['name'] if club else 'Club'

        subscribers = await subscription_service.get_club_subscribers(existing_event['club_id'], active_only=True)
        subscriber_ids = {sub['user_id'] for sub in subscribers}
        attendee_ids = set(existing_event.get('attendees', []))
        recipient_ids = list(subscriber_ids | attendee_ids)

        await event_service.delete_event(event_id)

        if recipient_ids:
            await notification_service.create_bulk_notifications(
                user_ids=recipient_ids,
                type='event_cancelled',
                title=f"Event Cancelled: {existing_event['title']}",
                content=f'"{existing_event["title"]}" hosted by {club_name} has been cancelled.',
                club_id=existing_event['club_id'],
                club_name=club_name,
                reference_id=event_id,
                link=f"/student/home/calendar"
            )

        return None
    except Exception as e:
        print(f"Delete event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )


@router.post("/{event_id}/attend", response_model=Event)
async def attend_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Register for event

    - Authenticated users only
    """
    user_id = current_user['uid']
    
    try:
        updated_event = await event_service.add_attendee(event_id, user_id)
        return Event(**updated_event)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Attend event error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register for event"
        )


@router.delete("/{event_id}/attend", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_attendance(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel event attendance

    - Authenticated users only
    """
    user_id = current_user['uid']
    
    try:
        await event_service.remove_attendee(event_id, user_id)
        return None
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        print(f"Cancel attendance error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel attendance"
        )


@router.post("/{event_id}/remind")
async def send_event_reminder(
    event_id: str,
    current_user: dict = Depends(require_club_leader)
):
    """
    Send event reminder

    - Creates notifications for all event attendees + club subscribers
    - Club leader only
    """
    user_id = current_user['uid']

    event = await event_service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    user_profile = await user_service.get_user_profile(user_id)
    managed_clubs = user_profile.get('managed_club_ids', [])
    if event['club_id'] not in managed_clubs and current_user.get('role') != 'super-admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only send reminders for events of clubs you manage")

    try:
        club = await club_service.get_club(event['club_id'])
        club_name = club['name'] if club else 'Club'

        subscribers = await subscription_service.get_club_subscribers(event['club_id'], active_only=True)
        subscriber_ids = {sub['user_id'] for sub in subscribers}

        attendee_ids = set(event.get('attendees', []))

        all_candidate_ids = list(subscriber_ids | attendee_ids)

        user_profiles = await user_service.get_users_by_ids(all_candidate_ids)
        recipient_ids = [
            uid for uid in all_candidate_ids
            if user_profiles.get(uid, {}).get(
                'notification_preferences', {}
            ).get('event_reminders', True)
        ]

        if not recipient_ids:
            return {"sent": 0, "message": "No recipients found"}

        start_dt = event['start_datetime']
        try:
            formatted_date = start_dt.strftime('%b %d, %I:%M %p')
        except Exception:
            formatted_date = str(start_dt)

        event_year = start_dt.year if hasattr(start_dt, 'year') else ''
        event_month = start_dt.month if hasattr(start_dt, 'month') else ''

        sent = await notification_service.create_bulk_notifications(
            user_ids=recipient_ids,
            type='event_reminder',
            title=f"Reminder: {event['title']}",
            content=f"{event['title']} is coming up on {formatted_date} at {event.get('location', 'TBD')}.",
            club_id=event['club_id'],
            club_name=club_name,
            reference_id=event_id,
            link=f"/student/home/calendar?eventId={event_id}&year={event_year}&month={event_month}"
        )

        return {"sent": sent, "message": f"Reminder sent to {sent} recipient(s)"}

    except Exception as e:
        print(f"Send reminder error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send reminder: {str(e)}"
        )


