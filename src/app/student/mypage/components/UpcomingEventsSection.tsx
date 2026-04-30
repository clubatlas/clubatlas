'use client';

import Link from 'next/link';
import styles from './UpcomingEventsSection.module.css';

const calendarIcon = "https://www.figma.com/api/mcp/asset/c5cb86da-c4b0-4828-9768-449666401c71";

const events = [
  {
    id: 1,
    clubName: 'Robotics Club',
    eventName: 'Weekly Meeting',
    dateTime: 'Mon, Nov 27 • 4:00 PM',
  },
  {
    id: 2,
    clubName: 'Debate Team',
    eventName: 'Practice Session',
    dateTime: 'Wed, Nov 29 • 3:00 PM',
  },
  {
    id: 3,
    clubName: 'Photography Club',
    eventName: 'Photo Walk',
    dateTime: 'Thu, Nov 30 • 6:00 PM',
  },
];

export default function UpcomingEventsSection() {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Upcoming Events</h2>
        <Link href="/student/home/calendar" className={styles.fullCalendar}>
          Full Calendar →
        </Link>
      </div>
      <div className={styles.eventsList}>
        {events.map((event) => (
          <div key={event.id} className={styles.eventCard}>
            <div className={styles.eventInfo}>
              <div className={styles.iconContainer}>
                <img src={calendarIcon} alt="" className={styles.icon} />
              </div>
              <div className={styles.eventDetails}>
                <p className={styles.clubName}>{event.clubName}</p>
                <h3 className={styles.eventName}>{event.eventName}</h3>
                <p className={styles.dateTime}>{event.dateTime}</p>
              </div>
            </div>
            <div className={styles.buttons}>
              <button className={styles.viewDetailsButton}>View Details</button>
              <button className={styles.addCalendarButton}>Add to Calendar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}









