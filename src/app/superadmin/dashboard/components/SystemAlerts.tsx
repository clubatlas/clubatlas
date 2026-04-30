'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './SystemAlerts.module.css';

interface AlertItem {
  id: string;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface SystemAlertsResponse {
  alerts: AlertItem[];
  total: number;
}

export default function SystemAlerts() {
  const { user } = useAuth();
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system-alerts?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: SystemAlertsResponse = await response.json();
        const items = data.alerts.map(alert => {
          const date = new Date(alert.timestamp);
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
            ...alert,
            timestamp: timeAgo
          };
        });
        setAlertItems(items);
      }
    } catch (error) {
      console.error('Failed to load system alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>System Alerts</h3>
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
      <h3 className={styles.title}>System Alerts</h3>
      <div className={styles.list}>
        {alertItems.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No system alerts
          </div>
        ) : (
          alertItems.map((item, index) => (
            <div key={index} className={`${styles.alert} ${styles[item.type]}`}>
              <p className={styles.message}>{item.message}</p>
              <p className={styles.timestamp}>{item.timestamp}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}









