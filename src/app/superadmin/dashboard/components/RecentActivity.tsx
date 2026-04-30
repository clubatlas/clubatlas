'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './RecentActivity.module.css';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  is_new: boolean;
}

interface RecentActivityResponse {
  activities: ActivityItem[];
  total: number;
}

export default function RecentActivity() {
  const { user } = useAuth();
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/recent-activities?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: RecentActivityResponse = await response.json();
        const items = data.activities.map(activity => {
          const date = new Date(activity.timestamp);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          let timeAgo;
          if (diffDays > 0) {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHours > 0) {
            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = 'Just now';
          }

          return {
            ...activity,
            timestamp: timeAgo
          };
        });
        setActivityItems(items);
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Recent Club Activity</h3>
        <div className={styles.list}>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent Club Activity</h3>
      <div className={styles.list}>
        {activityItems.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No recent activities
          </div>
        ) : (
          activityItems.map((item, index) => (
            <div key={index} className={styles.item}>
              <div className={`${styles.dot} ${item.is_new ? styles.dotGreen : ''}`}></div>
              <div className={styles.content}>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.itemSubtitle}>{item.subtitle}</p>
                <p className={styles.itemTimestamp}>{item.timestamp}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}









