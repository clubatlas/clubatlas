'use client';

import styles from './EventCard.module.css';

interface EventCardProps {
  event: {
    id: string;
    day: string;
    date: string;
    dateColor: string;
    time: string;
    clubName: string;
    eventType: string;
  };
  onDetailsClick: () => void;
}

export default function EventCard({ event, onDetailsClick }: EventCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.dateBox} style={{ background: event.dateColor }}>
          <span className={styles.day}>{event.day}</span>
          <span className={styles.date}>{event.date}</span>
        </div>
        <div className={styles.details}>
          <span className={styles.time}>{event.time}</span>
          <h3 className={styles.clubName}>{event.clubName}</h3>
          <p className={styles.eventType}>{event.eventType}</p>
        </div>
        <button className={styles.detailsButton} onClick={onDetailsClick}>
          Details
        </button>
      </div>
    </div>
  );
}









