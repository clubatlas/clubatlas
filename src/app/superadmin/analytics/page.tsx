'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './Analytics.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import AnalyticsCard from './components/AnalyticsCard';
import TrafficChart from './components/TrafficChart';
import PopularClubs from './components/PopularClubs';

interface AnalyticsOverview {
  total_page_views: number;
  club_profile_views: number;
  avg_engagement: number;
  avg_session_time: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics/overview`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <h1 className={styles.title}>Platform Analytics</h1>

          <div className={styles.statsGrid}>
            <AnalyticsCard
              value={loading ? "..." : (analytics?.club_profile_views ?? 0).toLocaleString()}
              label="Club Profile Views"
              subtext=""
            />
            <AnalyticsCard
              value={loading ? "..." : analytics ? `${analytics.avg_engagement.toFixed(1)}%` : "0%"}
              label="Avg Engagement"
              subtext=""
            />
          </div>

          <div className={styles.bottomGrid}>
            <TrafficChart />
            <PopularClubs />
          </div>
        </div>
      </div>
    </div>
  );
}









