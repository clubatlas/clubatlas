'use client';

import styles from './RecentActivity.module.css';
import { Subscriber } from '@/lib/api/subscriptions';
import { Event } from '@/lib/api/events';
import { Announcement } from '@/lib/api/announcements';

interface Activity {
  title: string;
  description: string;
  time: string;
  isNew?: boolean;
  timestamp: Date;
}

interface RecentActivityProps {
  subscribers: Subscriber[];
  events: Event[];
  announcements: Announcement[];
}

export default function RecentActivity({ subscribers, events, announcements }: RecentActivityProps) {
  const activities: Activity[] = [];

  subscribers.slice(0, 3).forEach(sub => {
    activities.push({
      title: 'New subscriber',
      description: `${sub.user_email || 'User'} subscribed`,
      time: formatTimeAgo(new Date(sub.subscribed_at)),
      timestamp: new Date(sub.subscribed_at),
      isNew: isRecent(new Date(sub.subscribed_at), 24)
    });
  });

  events.slice(0, 2).forEach(event => {
    if (event.created_at) {
      activities.push({
        title: 'Event created',
        description: `${event.title} - ${new Date(event.start_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        time: formatTimeAgo(new Date(event.created_at)),
        timestamp: new Date(event.created_at),
        isNew: isRecent(new Date(event.created_at), 24)
      });
    }
  });

  announcements.slice(0, 2).forEach(announcement => {
    if (announcement.created_at) {
      activities.push({
        title: 'Announcement posted',
        description: announcement.title,
        time: formatTimeAgo(new Date(announcement.created_at)),
        timestamp: new Date(announcement.created_at),
        isNew: isRecent(new Date(announcement.created_at), 24)
      });
    }
  });

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const displayActivities = activities.slice(0, 3);

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Recent Activity</h3>
      {displayActivities.length === 0 ? (
        <div className={styles.emptyState}>No recent activity</div>
      ) : (
        <div className={styles.activities}>
          {displayActivities.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div
                className={`${styles.activityDot} ${activity.isNew ? styles.activityDotNew : ''}`}
              />
              <div className={styles.activityContent}>
                <p className={styles.activityTitle}>{activity.title}</p>
                <p className={styles.activityDescription}>{activity.description}</p>
                <p className={styles.activityTime}>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function isRecent(date: Date, hours: number): boolean {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= hours;
}










