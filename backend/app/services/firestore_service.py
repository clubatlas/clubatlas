"""
Firestore database service
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from firebase_admin import firestore
from starlette.concurrency import run_in_threadpool
from app.services.firebase_admin import get_firestore


class FirestoreService:
    """Service class for Firestore CRUD operations"""

    def __init__(self):
        self.db = None

    def _get_db(self):
        """Get Firestore client (lazy loading)"""
        if self.db is None:
            self.db = get_firestore()
            if self.db is None:
                raise RuntimeError("Firestore is not initialized. Check Firebase environment variables.")
        return self.db

    async def create_document(
        self,
        collection: str,
        document_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a document"""
        db = self._get_db()
        doc_ref = db.collection(collection).document(document_id)

        data['created_at'] = firestore.SERVER_TIMESTAMP
        data['updated_at'] = firestore.SERVER_TIMESTAMP

        await run_in_threadpool(doc_ref.set, data)

        doc = await run_in_threadpool(doc_ref.get)
        return {'id': doc.id, **doc.to_dict()}

    async def get_document(
        self,
        collection: str,
        document_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a document"""
        db = self._get_db()
        doc_ref = db.collection(collection).document(document_id)
        doc = await run_in_threadpool(doc_ref.get)

        if doc.exists:
            return {'id': doc.id, **doc.to_dict()}
        return None

    async def update_document(
        self,
        collection: str,
        document_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a document"""
        db = self._get_db()
        doc_ref = db.collection(collection).document(document_id)

        data['updated_at'] = firestore.SERVER_TIMESTAMP

        await run_in_threadpool(doc_ref.update, data)

        doc = await run_in_threadpool(doc_ref.get)
        return {'id': doc.id, **doc.to_dict()}

    async def set_document(
        self,
        collection: str,
        document_id: str,
        data: Dict[str, Any],
        merge: bool = True
    ) -> Dict[str, Any]:
        """Set a document (create or merge)"""
        db = self._get_db()
        doc_ref = db.collection(collection).document(document_id)

        if merge:
            data['updated_at'] = firestore.SERVER_TIMESTAMP
            existing_doc = await run_in_threadpool(doc_ref.get)
            if not existing_doc.exists:
                data['created_at'] = firestore.SERVER_TIMESTAMP
        else:
            data['created_at'] = firestore.SERVER_TIMESTAMP
            data['updated_at'] = firestore.SERVER_TIMESTAMP

        await run_in_threadpool(lambda: doc_ref.set(data, merge=merge))

        doc = await run_in_threadpool(doc_ref.get)
        return {'id': doc.id, **doc.to_dict()}

    async def delete_document(
        self,
        collection: str,
        document_id: str
    ) -> bool:
        """Delete a document"""
        db = self._get_db()
        doc_ref = db.collection(collection).document(document_id)
        await run_in_threadpool(doc_ref.delete)
        return True

    async def query_documents(
        self,
        collection: str,
        filters: Optional[List[tuple]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Query documents"""
        db = self._get_db()
        query = db.collection(collection)

        if filters:
            for field, operator, value in filters:
                query = query.where(field, operator, value)

        if order_by:
            query = query.order_by(order_by)

        if offset:
            query = query.offset(offset)

        if limit:
            query = query.limit(limit)

        docs = await run_in_threadpool(lambda: list(query.stream()))

        return [{'id': doc.id, **doc.to_dict()} for doc in docs]

    async def count_documents(
        self,
        collection: str,
        filters: Optional[List[tuple]] = None
    ) -> int:
        """Count documents"""
        db = self._get_db()
        query = db.collection(collection)

        if filters:
            for field, operator, value in filters:
                query = query.where(field, operator, value)

        docs = await run_in_threadpool(lambda: list(query.stream()))
        return len(docs)


class UserService(FirestoreService):
    """User-related Firestore operations"""

    COLLECTION = 'users'

    async def create_user_profile(
        self,
        uid: str,
        email: str,
        display_name: str,
        role: str = 'student',
        interests: List[str] = None
    ) -> Dict[str, Any]:
        """Create a user profile"""
        data = {
            'email': email,
            'display_name': display_name,
            'role': role,
            'interests': interests or [],
            'recommendation_preferences': None
        }
        return await self.create_document(self.COLLECTION, uid, data)

    async def get_user_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get a user profile"""
        return await self.get_document(self.COLLECTION, uid)

    async def get_users_by_ids(self, uids: List[str]) -> Dict[str, Dict[str, Any]]:
        """Batch read multiple user profiles by UID (Firestore batch read)"""
        if not uids:
            return {}
        db = self._get_db()
        refs = [db.collection(self.COLLECTION).document(uid) for uid in uids]
        docs = await run_in_threadpool(db.get_all, refs)
        result: Dict[str, Dict[str, Any]] = {}
        for doc in docs:
            if doc.exists:
                result[doc.id] = {'id': doc.id, **doc.to_dict()}
        return result

    async def update_user_interests(
        self,
        uid: str,
        interests: List[str]
    ) -> Dict[str, Any]:
        """Update user interests"""
        return await self.update_document(
            self.COLLECTION,
            uid,
            {'interests': interests}
        )

    async def update_notification_preferences(
        self,
        uid: str,
        email_notifications: bool,
        event_reminders: bool
    ) -> Dict[str, Any]:
        """Update user notification preferences"""
        return await self.update_document(
            self.COLLECTION,
            uid,
            {
                'notification_preferences': {
                    'email_notifications': email_notifications,
                    'event_reminders': event_reminders,
                }
            }
        )

    async def update_recommendation_preferences(
        self,
        uid: str,
        preferred_categories: List[str],
        preferred_activity_types: List[str],
        available_time_slots: List[str],
        source: str = 'ai-form'
    ) -> Dict[str, Any]:
        """Update recommendation preferences"""
        preferences = {
            'preferred_categories': preferred_categories,
            'preferred_activity_types': preferred_activity_types,
            'available_time_slots': available_time_slots,
            'last_updated': firestore.SERVER_TIMESTAMP,
            'source': source
        }
        return await self.update_document(
            self.COLLECTION,
            uid,
            {'recommendation_preferences': preferences}
        )


class ClubService(FirestoreService):
    """Club-related Firestore operations"""

    COLLECTION = 'clubs'

    async def create_club(
        self,
        club_id: str,
        name: str,
        description: str,
        categories: List[str],
        activity_type: List[str],
        **kwargs
    ) -> Dict[str, Any]:
        """Create a club"""
        data = {
            'name': name,
            'description': description,
            'categories': categories,
            'activity_type': activity_type,
            'tags': kwargs.get('tags', []),
            'meeting_schedule': kwargs.get('meeting_schedule'),
            'leaders': kwargs.get('leaders', []),
            'contact_email': kwargs.get('contact_email'),
            'stats': {
                'total_members': 0,
                'total_subscribers': 0,
                'total_events': 0,
                'view_count': 0,
                'established_date': kwargs.get('established_date')
            },
            'logo_url': kwargs.get('logo_url'),
            'banner_url': kwargs.get('banner_url'),
            'media_urls': kwargs.get('media_urls', []),
            'is_active': True
        }
        return await self.create_document(self.COLLECTION, club_id, data)

    async def get_club(self, club_id: str) -> Optional[Dict[str, Any]]:
        """Get a club"""
        return await self.get_document(self.COLLECTION, club_id)

    async def get_clubs(
        self,
        categories: Optional[List[str]] = None,
        activity_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[List[Dict[str, Any]], int]:
        """Get club list. Returns (page, total) tuple."""
        filters = []

        if categories:
            filters.append(('categories', 'array_contains_any', categories))

        if activity_type:
            filters.append(('activity_type', 'array-contains', activity_type))

        filters.append(('is_active', '==', True))

        # Sort in Python to avoid composite index requirements
        all_clubs = await self.query_documents(
            self.COLLECTION,
            filters=filters,
            limit=None
        )

        all_clubs.sort(key=lambda x: x.get('name', '').lower())
        total = len(all_clubs)
        start_idx = offset
        end_idx = offset + limit
        return all_clubs[start_idx:end_idx], total

    async def update_club(
        self,
        club_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update club information"""
        return await self.update_document(self.COLLECTION, club_id, data)

    async def increment_view_count(self, club_id: str) -> None:
        """Increment club view count"""
        db = self._get_db()
        doc_ref = db.collection(self.COLLECTION).document(club_id)
        await run_in_threadpool(doc_ref.update, {'stats.view_count': firestore.Increment(1)})


class SubscriptionService(FirestoreService):
    """Subscription-related Firestore operations"""

    COLLECTION = 'subscriptions'

    async def subscribe_to_club(
        self,
        user_id: str,
        club_id: str
    ) -> Dict[str, Any]:
        """Subscribe to a club"""
        existing = await self.get_user_subscription(user_id, club_id)

        if existing:
            if existing.get('is_active'):
                raise ValueError("Already subscribed")
            subscription_id = existing['id']
            subscription = await self.update_document(
                self.COLLECTION,
                subscription_id,
                {'is_active': True, 'notification_enabled': True}
            )
            try:
                db = self._get_db()
                club_ref = db.collection('clubs').document(club_id)
                await run_in_threadpool(club_ref.update, {'stats.total_subscribers': firestore.Increment(1)})
            except Exception as e:
                print(f"Failed to update club subscriber count: {e}")
            return subscription

        subscription_id = f"{user_id}_{club_id}"
        data = {
            'user_id': user_id,
            'club_id': club_id,
            'is_active': True,
            'notification_enabled': True,
            'subscribed_at': firestore.SERVER_TIMESTAMP
        }

        subscription = await self.create_document(self.COLLECTION, subscription_id, data)

        try:
            db = self._get_db()
            club_ref = db.collection('clubs').document(club_id)
            await run_in_threadpool(club_ref.update, {'stats.total_subscribers': firestore.Increment(1)})
        except Exception as e:
            print(f"Failed to update club subscriber count: {e}")

        return subscription

    async def unsubscribe_from_club(
        self,
        user_id: str,
        club_id: str
    ) -> bool:
        """Unsubscribe from a club"""
        subscription = await self.get_user_subscription(user_id, club_id)

        if not subscription or not subscription.get('is_active'):
            raise ValueError("Not subscribed")

        subscription_id = subscription['id']
        await self.update_document(
            self.COLLECTION,
            subscription_id,
            {'is_active': False}
        )

        try:
            db = self._get_db()
            club_ref = db.collection('clubs').document(club_id)
            await run_in_threadpool(club_ref.update, {'stats.total_subscribers': firestore.Increment(-1)})
        except Exception as e:
            print(f"Failed to update club subscriber count: {e}")

        return True

    async def get_user_subscription(
        self,
        user_id: str,
        club_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a user's subscription for a specific club"""
        subscriptions = await self.query_documents(
            self.COLLECTION,
            filters=[
                ('user_id', '==', user_id),
                ('club_id', '==', club_id)
            ],
            limit=1
        )
        return subscriptions[0] if subscriptions else None

    async def get_user_subscriptions(
        self,
        user_id: str,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all subscriptions for a user"""
        filters = [('user_id', '==', user_id)]

        if active_only:
            filters.append(('is_active', '==', True))

        # Sort in Python to avoid composite index requirements
        subscriptions = await self.query_documents(
            self.COLLECTION,
            filters=filters
        )

        subscriptions.sort(key=lambda x: x.get('subscribed_at', ''), reverse=True)
        return subscriptions

    async def get_club_subscribers(
        self,
        club_id: str,
        active_only: bool = True
    ) -> List[Dict[str, Any]]:
        """Get all subscribers for a club"""
        filters = [('club_id', '==', club_id)]

        if active_only:
            filters.append(('is_active', '==', True))

        # Sort in Python to avoid composite index requirements
        subscribers = await self.query_documents(
            self.COLLECTION,
            filters=filters
        )

        subscribers.sort(key=lambda x: x.get('subscribed_at', ''), reverse=True)
        return subscribers

    async def update_notification_settings(
        self,
        user_id: str,
        club_id: str,
        notification_enabled: bool
    ) -> Dict[str, Any]:
        """Update notification settings"""
        subscription = await self.get_user_subscription(user_id, club_id)

        if not subscription:
            raise ValueError("Subscription not found")

        subscription_id = subscription['id']
        return await self.update_document(
            self.COLLECTION,
            subscription_id,
            {'notification_enabled': notification_enabled}
        )

    async def count_subscribers(
        self,
        club_id: str,
        active_only: bool = True
    ) -> int:
        """Get subscriber count for a club"""
        return await self.count_documents(
            self.COLLECTION,
            filters=[
                ('club_id', '==', club_id),
                ('is_active', '==', True)
            ] if active_only else [('club_id', '==', club_id)]
        )


class EventService(FirestoreService):
    """Event-related Firestore operations"""

    COLLECTION = 'events'

    async def create_event(
        self,
        event_id: str,
        club_id: str,
        title: str,
        description: str,
        start_datetime: datetime,
        end_datetime: datetime,
        location: str,
        created_by: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Create an event"""
        data = {
            'club_id': club_id,
            'title': title,
            'description': description,
            'event_type': kwargs.get('event_type', 'meeting'),
            'start_datetime': start_datetime,
            'end_datetime': end_datetime,
            'location': location,
            'max_attendees': kwargs.get('max_attendees'),
            'attendees': [],
            'status': 'active',
            'created_by': created_by
        }

        event = await self.create_document(self.COLLECTION, event_id, data)

        try:
            db = self._get_db()
            club_ref = db.collection('clubs').document(club_id)
            await run_in_threadpool(club_ref.update, {'stats.total_events': firestore.Increment(1)})
        except Exception as e:
            print(f"Failed to update club event count: {e}")

        return event

    async def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get an event"""
        return await self.get_document(self.COLLECTION, event_id)

    async def get_events(
        self,
        club_id: Optional[str] = None,
        status: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get event list"""
        filters = []

        if club_id:
            filters.append(('club_id', '==', club_id))

        events = await self.query_documents(
            self.COLLECTION,
            filters=filters if filters else None,
            limit=None
        )

        from datetime import timezone as _tz

        def _make_aware(dt):
            if dt is not None and dt.tzinfo is None:
                return dt.replace(tzinfo=_tz.utc)
            return dt

        aware_start = _make_aware(start_date)
        aware_end = _make_aware(end_date)

        filtered_events = []
        for event in events:
            if status and event.get('status') != status:
                continue

            event_start = event.get('start_datetime')
            if event_start:
                aware_event_start = _make_aware(event_start)
                if aware_start and aware_event_start < aware_start:
                    continue
                if aware_end and aware_event_start > aware_end:
                    continue

            filtered_events.append(event)

        def _sort_key(x):
            dt = x.get('start_datetime')
            return _make_aware(dt) if dt is not None else datetime.min.replace(tzinfo=_tz.utc)

        filtered_events.sort(key=_sort_key)
        start_idx = offset
        end_idx = offset + limit
        return filtered_events[start_idx:end_idx]

    async def update_event(
        self,
        event_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an event"""
        return await self.update_document(self.COLLECTION, event_id, data)

    async def delete_event(self, event_id: str) -> bool:
        """Delete an event (soft delete)"""
        await self.update_document(
            self.COLLECTION,
            event_id,
            {'status': 'cancelled'}
        )
        return True

    async def add_attendee(self, event_id: str, user_id: str) -> Dict[str, Any]:
        """Add an attendee to an event"""
        event = await self.get_event(event_id)

        if not event:
            raise ValueError("Event not found")

        attendees = event.get('attendees', [])

        if user_id in attendees:
            raise ValueError("Already registered")

        max_attendees = event.get('max_attendees')
        if max_attendees and len(attendees) >= max_attendees:
            raise ValueError("Event is full")

        attendees.append(user_id)

        return await self.update_document(
            self.COLLECTION,
            event_id,
            {'attendees': attendees}
        )

    async def remove_attendee(self, event_id: str, user_id: str) -> Dict[str, Any]:
        """Remove an attendee from an event"""
        event = await self.get_event(event_id)

        if not event:
            raise ValueError("Event not found")

        attendees = event.get('attendees', [])

        if user_id not in attendees:
            raise ValueError("Not registered")

        attendees.remove(user_id)

        return await self.update_document(
            self.COLLECTION,
            event_id,
            {'attendees': attendees}
        )


class AnnouncementService(FirestoreService):
    """Announcement-related Firestore operations"""

    COLLECTION = 'announcements'

    async def create_announcement(
        self,
        announcement_id: str,
        club_id: str,
        title: str,
        content: str,
        created_by: str
    ) -> Dict[str, Any]:
        """Create an announcement"""
        data = {
            'club_id': club_id,
            'title': title,
            'content': content,
            'status': 'active',
            'created_by': created_by,
            'sent_to': 0,
            'opens': 0
        }

        announcement = await self.create_document(self.COLLECTION, announcement_id, data)

        return announcement

    async def get_announcement(self, announcement_id: str) -> Optional[Dict[str, Any]]:
        """Get an announcement"""
        return await self.get_document(self.COLLECTION, announcement_id)

    async def get_announcements(
        self,
        club_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get announcement list"""
        filters = []

        if club_id:
            filters.append(('club_id', '==', club_id))

        if status:
            filters.append(('status', '==', status))

        # Sort in Python to avoid composite index requirements
        announcements = await self.query_documents(
            self.COLLECTION,
            filters=filters if filters else None,
            limit=None
        )

        # Sort and paginate (newest first)
        announcements.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        start_idx = offset
        end_idx = offset + limit
        return announcements[start_idx:end_idx]

    async def update_announcement(
        self,
        announcement_id: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an announcement"""
        return await self.update_document(self.COLLECTION, announcement_id, data)

    async def delete_announcement(self, announcement_id: str) -> bool:
        """Delete an announcement (soft delete)"""
        await self.update_document(
            self.COLLECTION,
            announcement_id,
            {'status': 'archived'}
        )
        return True

    async def increment_opens(self, announcement_id: str) -> Dict[str, Any]:
        """Increment open count"""
        db = self._get_db()
        announcement_ref = db.collection(self.COLLECTION).document(announcement_id)
        await run_in_threadpool(announcement_ref.update, {'opens': firestore.Increment(1)})

        return await self.get_announcement(announcement_id)


class BookmarkService(FirestoreService):
    """Bookmark-related Firestore operations"""

    COLLECTION = 'bookmarks'

    async def create_bookmark(
        self,
        bookmark_id: str,
        user_id: str,
        club_id: str
    ) -> Dict[str, Any]:
        """Create a bookmark"""
        existing = await self.get_user_bookmark(user_id, club_id)
        if existing:
            raise ValueError("Already bookmarked")

        data = {
            'user_id': user_id,
            'club_id': club_id
        }

        return await self.create_document(self.COLLECTION, bookmark_id, data)

    async def get_bookmark(self, bookmark_id: str) -> Optional[Dict[str, Any]]:
        """Get a bookmark"""
        return await self.get_document(self.COLLECTION, bookmark_id)

    async def get_user_bookmark(
        self,
        user_id: str,
        club_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a user's bookmark for a specific club"""
        bookmarks = await self.query_documents(
            self.COLLECTION,
            filters=[
                ('user_id', '==', user_id),
                ('club_id', '==', club_id)
            ],
            limit=1
        )

        return bookmarks[0] if bookmarks else None

    async def get_user_bookmarks(
        self,
        user_id: str,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all bookmarks for a user"""
        # Sort in Python to avoid composite index requirements
        bookmarks = await self.query_documents(
            self.COLLECTION,
            filters=[('user_id', '==', user_id)],
            limit=None
        )

        bookmarks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return bookmarks[:limit]

    async def delete_bookmark(
        self,
        user_id: str,
        club_id: str
    ) -> bool:
        """Delete a bookmark"""
        bookmark = await self.get_user_bookmark(user_id, club_id)

        if not bookmark:
            raise ValueError("Bookmark not found")

        bookmark_id = bookmark['id']
        return await self.delete_document(self.COLLECTION, bookmark_id)

    async def count_user_bookmarks(self, user_id: str) -> int:
        """Get bookmark count for a user"""
        return await self.count_documents(
            self.COLLECTION,
            filters=[('user_id', '==', user_id)]
        )


class NotificationService(FirestoreService):
    """Notification management service"""
    COLLECTION = 'notifications'

    async def create_notification(
        self,
        user_id: str,
        type: str,
        title: str,
        content: str,
        club_id: Optional[str] = None,
        club_name: Optional[str] = None,
        reference_id: Optional[str] = None,
        link: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a notification"""
        notification_data = {
            'user_id': user_id,
            'type': type,
            'title': title,
            'content': content,
            'club_id': club_id,
            'club_name': club_name,
            'reference_id': reference_id,
            'link': link,
            'is_read': False,
            'created_at': firestore.SERVER_TIMESTAMP
        }

        return await self.create_document(
            self.COLLECTION,
            None,
            notification_data
        )

    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Get notification list for a user"""
        filters = [('user_id', '==', user_id)]

        if unread_only:
            filters.append(('is_read', '==', False))

        # Sort in Python to avoid composite index requirements
        notifications = await self.query_documents(
            self.COLLECTION,
            filters=filters,
            limit=None
        )

        # Sort and limit (newest first)
        notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return notifications[:limit]

    async def mark_as_read(self, notification_id: str) -> bool:
        """Mark a notification as read"""
        return await self.update_document(
            self.COLLECTION,
            notification_id,
            {'is_read': True}
        )

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications for a user as read"""
        notifications = await self.get_user_notifications(
            user_id=user_id,
            limit=1000,
            unread_only=True
        )

        count = 0
        for notification in notifications:
            await self.mark_as_read(notification['id'])
            count += 1

        return count

    async def count_unread(self, user_id: str) -> int:
        """Get unread notification count"""
        return await self.count_documents(
            self.COLLECTION,
            filters=[
                ('user_id', '==', user_id),
                ('is_read', '==', False)
            ]
        )

    async def delete_notification(self, notification_id: str) -> bool:
        """Delete a notification"""
        return await self.delete_document(self.COLLECTION, notification_id)

    async def create_bulk_notifications(
        self,
        user_ids: List[str],
        type: str,
        title: str,
        content: str,
        club_id: Optional[str] = None,
        club_name: Optional[str] = None,
        reference_id: Optional[str] = None,
        link: Optional[str] = None
    ) -> int:
        """Create identical notifications for multiple users"""
        count = 0
        for user_id in user_ids:
            await self.create_notification(
                user_id=user_id,
                type=type,
                title=title,
                content=content,
                club_id=club_id,
                club_name=club_name,
                reference_id=reference_id,
                link=link
            )
            count += 1

        return count


user_service = UserService()
club_service = ClubService()
subscription_service = SubscriptionService()
event_service = EventService()
announcement_service = AnnouncementService()
bookmark_service = BookmarkService()
notification_service = NotificationService()
firestore_service = FirestoreService()
