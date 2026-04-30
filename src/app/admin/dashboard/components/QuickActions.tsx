'use client';

import Link from 'next/link';
import styles from './QuickActions.module.css';

interface QuickActionsProps {
  onCreateEvent: () => void;
}

export default function QuickActions({ onCreateEvent }: QuickActionsProps) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Quick Actions</h3>
      <div className={styles.actions}>
        <button type="button" onClick={onCreateEvent} className={styles.actionButton}>
          <div className={styles.actionIconContainer} style={{ backgroundColor: "#dbeafe" }}>
            <img src="/images/icons/dashboard/nav-events.svg" alt="Create Event" className={styles.actionIcon} />
          </div>
          <span className={styles.actionLabel}>Create Event</span>
        </button>
        <Link href="/admin/dashboard/announcements?openModal=true" className={styles.actionButton}>
          <div className={styles.actionIconContainer} style={{ backgroundColor: "#f3e8ff" }}>
            <img src="/images/icons/dashboard/nav-announcements.svg" alt="New Announcement" className={styles.actionIcon} />
          </div>
          <span className={styles.actionLabel}>New Announcement</span>
        </Link>
        <Link href="/admin/dashboard/profile/edit" className={styles.actionButton}>
          <div className={styles.actionIconContainer} style={{ backgroundColor: "#dcfce7" }}>
            <img src="/images/icons/dashboard/nav-club-profile.svg" alt="Edit Profile" className={styles.actionIcon} />
          </div>
          <span className={styles.actionLabel}>Edit Profile</span>
        </Link>
        <Link href="/admin/dashboard/subscribers" className={styles.actionButton}>
          <div className={styles.actionIconContainer} style={{ backgroundColor: "#ffedd4" }}>
            <img src="/images/icons/dashboard/nav-subscribers.svg" alt="View Subscribers" className={styles.actionIcon} />
          </div>
          <span className={styles.actionLabel}>View Subscribers</span>
        </Link>
      </div>
    </div>
  );
}










