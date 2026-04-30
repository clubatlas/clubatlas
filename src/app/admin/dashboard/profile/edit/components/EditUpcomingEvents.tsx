'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './EditUpcomingEvents.module.css';
import { getEvents, Event as ApiEvent } from '@/lib/api/events';

interface EditUpcomingEventsProps {
  clubId: string;
}

export default function EditUpcomingEvents({ clubId }: EditUpcomingEventsProps) {
  const [events, setEvents] = useState<ApiEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await getEvents({ club_id: clubId, status_filter: 'active', limit: 10 });
      if (res.data) {
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = res.data.events.filter((e) => {
          const d = new Date(e.start_datetime);
          return d >= now && d <= weekLater;
        });
        setEvents(upcoming.slice(0, 3));
      }
    };
    if (clubId) load();
  }, [clubId]);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Upcoming Event</h2>
        <Link href="/admin/dashboard/events" className={styles.viewAllLink}>
          View All →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className={styles.emptyText}>No upcoming events in the next 7 days</p>
      ) : (
        <div className={styles.eventsList}>
          {events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <h4 className={styles.eventTitle}>{event.title}</h4>
                <span className={styles.upcomingTag}>UPCOMING</span>
              </div>
              <p className={styles.eventDate}>
                {new Date(event.start_datetime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
              <p className={styles.eventNotifications}>
                {event.attendees?.length || 0} email notifications sent
              </p>
              <div className={styles.eventActions}>
                <Link href="/admin/dashboard/events" className={styles.eventLink}>
                  View Details
                </Link>
                <Link href="/admin/dashboard/events" className={styles.eventLink}>
                  Send Reminder
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
