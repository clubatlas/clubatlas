'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './ClubStats.module.css';

interface ClubStatsData {
  active_clubs: number;
  pending_approval: number;
  total_subscribers: number;
}

export default function ClubStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClubStatsData>({
    active_clubs: 0,
    pending_approval: 0,
    total_subscribers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load club stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.statCard}>
          <div className={styles.value}>...</div>
          <div className={styles.label}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.statCard}>
        <div className={styles.value}>{stats.active_clubs}</div>
        <div className={styles.label}>Active Clubs</div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.value}>{stats.pending_approval}</div>
        <div className={styles.label}>Pending Approval</div>
      </div>
      
      <div className={styles.statCard}>
        <div className={styles.value}>{stats.total_subscribers.toLocaleString()}</div>
        <div className={styles.label}>Total Subscribers</div>
      </div>
    </div>
  );
}









