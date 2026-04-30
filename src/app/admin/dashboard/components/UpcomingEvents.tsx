'use client';

import Link from 'next/link';
import styles from './UpcomingEvents.module.css';
import { Event as ApiEvent } from '@/lib/api/events';

const imgIcon = "/images/icons/dashboard/nav-events.svg";

interface UpcomingEventsProps {
  events: ApiEvent[];
  clubId: string;
}

export default function UpcomingEvents({ events, clubId }: UpcomingEventsProps) {
  const displayEvents = events.slice(0, 4);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Upcoming Events (Next 7 Days)</h3>
        <Link href="/admin/dashboard/events" className={styles.viewAllLink}>
          View All →
        </Link>
      </div>
      {displayEvents.length === 0 ? (
        <div className={styles.emptyState}>
          No upcoming events in the next 7 days
        </div>
      ) : (
        <div className={styles.eventsGrid}>
          {displayEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventHeader}>
                <div className={styles.eventInfo}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
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
                </div>
                <img src={imgIcon} alt="Event" className={styles.eventIcon} />
              </div>
              <p className={styles.eventNotifications}>
                {event.attendees?.length || 0} registered
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}










