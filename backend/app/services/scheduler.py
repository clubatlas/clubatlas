"""
Event reminder scheduler

- Runs every interval_seconds (default 3600s = 1 hour)
- Sends 1-week reminders for active events scheduled within 7 days that haven't been notified yet
- Sends 1-day reminders for active events scheduled within 1 day that haven't been notified yet
- Uses reminder_1week_sent / reminder_1day_sent flags on event documents to prevent duplicate sends
"""
import asyncio
from datetime import datetime, timedelta


async def send_upcoming_event_reminders() -> None:
    """Send 1-week / 1-day event reminder notifications"""
    from app.services.firestore_service import (
        event_service, club_service, subscription_service, notification_service, user_service
    )

    now = datetime.now()
    one_week_later = now + timedelta(days=7)
    one_day_later = now + timedelta(days=1)

    events = await event_service.get_events(
        status='active',
        start_date=now,
        end_date=one_week_later,
        limit=1000
    )

    for event in events:
        event_id = event['id']
        start_dt = event['start_datetime']
        reminder_1week_sent = event.get('reminder_1week_sent', False)
        reminder_1day_sent = event.get('reminder_1day_sent', False)

        needs_1week = not reminder_1week_sent and start_dt > one_day_later
        needs_1day = not reminder_1day_sent and start_dt <= one_day_later

        if not needs_1week and not needs_1day:
            continue

        try:
            club = await club_service.get_club(event['club_id'])
            club_name = club['name'] if club else 'Club'

            subscribers = await subscription_service.get_club_subscribers(
                event['club_id'], active_only=True
            )
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

            try:
                formatted_date = start_dt.strftime('%b %d, %I:%M %p')
            except Exception:
                formatted_date = str(start_dt)

            event_year = getattr(start_dt, 'year', '')
            event_month = getattr(start_dt, 'month', '')
            link = f"/student/home/calendar?eventId={event_id}&year={event_year}&month={event_month}"

            if needs_1week:
                if recipient_ids:
                    await notification_service.create_bulk_notifications(
                        user_ids=recipient_ids,
                        type='event_reminder',
                        title=f"Coming Up Next Week: {event['title']}",
                        content=(
                            f"{event['title']} by {club_name} is scheduled for "
                            f"{formatted_date} at {event.get('location', 'TBD')}."
                        ),
                        club_id=event['club_id'],
                        club_name=club_name,
                        reference_id=event_id,
                        link=link
                    )
                await event_service.update_event(event_id, {'reminder_1week_sent': True})
                print(f"[Scheduler] 1-week reminder sent for event '{event['title']}' ({event_id})")

            if needs_1day:
                if recipient_ids:
                    await notification_service.create_bulk_notifications(
                        user_ids=recipient_ids,
                        type='event_reminder',
                        title=f"Tomorrow: {event['title']}",
                        content=(
                            f"Reminder: {event['title']} by {club_name} is tomorrow — "
                            f"{formatted_date} at {event.get('location', 'TBD')}."
                        ),
                        club_id=event['club_id'],
                        club_name=club_name,
                        reference_id=event_id,
                        link=link
                    )
                await event_service.update_event(event_id, {'reminder_1day_sent': True})
                print(f"[Scheduler] 1-day reminder sent for event '{event['title']}' ({event_id})")

        except Exception as e:
            print(f"[Scheduler] Failed to process event {event_id}: {e}")


async def run_scheduler(interval_seconds: int = 3600) -> None:
    """Repeatedly run reminder checks at interval_seconds intervals"""
    print(f"[Scheduler] Event reminder scheduler started (interval: {interval_seconds}s)")
    while True:
        try:
            await send_upcoming_event_reminders()
        except Exception as e:
            print(f"[Scheduler] Unexpected error during reminder check: {e}")
        await asyncio.sleep(interval_seconds)
