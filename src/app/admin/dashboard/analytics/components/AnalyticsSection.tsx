'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './AnalyticsSection.module.css';
import EngagementChart from './EngagementChart';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { getClubSubscribers } from '@/lib/api/subscriptions';
import { getAnnouncements } from '@/lib/api/announcements';
import { getAnalyticsTrends } from '@/lib/api/analytics';

const PERIOD_OPTIONS = [
  { value: 1, label: 'Last 1 month' },
  { value: 3, label: 'Last 3 months' },
  { value: 6, label: 'Last 6 months' },
] as const;

export default function AnalyticsSection() {
  const { userProfile } = useAuth();
  const { selectedClubId } = useSelectedClub();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [periodMonths, setPeriodMonths] = useState<number>(6);
  const getDefaultChartData = useCallback((monthsCount: number) => {
    const now = new Date();
    const months: string[] = [];
    const zeros: number[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('en-US', { month: 'short' }));
      zeros.push(0);
    }
    return { months, subscribers: zeros };
  }, []);
  const [chartData, setChartData] = useState<{ months: string[]; subscribers: number[] }>(() => {
    const now = new Date();
    const months: string[] = [];
    const zeros: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleDateString('en-US', { month: 'short' }));
      zeros.push(0);
    }
    return { months, subscribers: zeros };
  });

  useEffect(() => {
    if (selectedClubId) {
      loadAnalytics();
    }
  }, [selectedClubId, periodMonths]);

  const loadAnalytics = async () => {
    if (!selectedClubId) {
      setChartData(getDefaultChartData(6));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [subscribersRes, announcementsRes, trendsRes] = await Promise.all([
        getClubSubscribers(selectedClubId),
        getAnnouncements({ club_id: selectedClubId, limit: 100 }),
        getAnalyticsTrends(selectedClubId, periodMonths),
      ]);

      if (subscribersRes.data) {
        setSubscribers(subscribersRes.data.total);
      }

      if (announcementsRes.data && subscribersRes.data) {
        const totalSent = announcementsRes.data.announcements.reduce((s, a) => s + (a.sent_to || 0), 0);
        const totalOpens = announcementsRes.data.announcements.reduce((s, a) => s + (a.opens || 0), 0);
        const total = subscribersRes.data.total;
        const eng = totalSent > 0 && total > 0
          ? Math.round((totalOpens / totalSent) * 100)
          : total > 0
            ? Math.min(100, Math.round((totalOpens / total) * 100))
            : 0;
        setEngagement(Math.min(100, eng));
      }

      if (trendsRes.data && trendsRes.data.months?.length > 0) {
        setChartData({
          months: trendsRes.data.months,
          subscribers: trendsRes.data.subscribers,
        });
      } else {
        setChartData(getDefaultChartData(periodMonths));
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics');
      setChartData(getDefaultChartData(periodMonths));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading analytics...</div>;
  }
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.analyticsSection}>
      <h1 className={styles.title}>Analytics & Insights</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{subscribers.toLocaleString()}</div>
          <div className={styles.statLabel}>Subscribers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{engagement}%</div>
          <div className={styles.statLabel}>Engagement</div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Engagement Trends</h2>
            <p className={styles.chartDescription}>
              Track your club&apos;s growth
            </p>
          </div>
          <select
            className={styles.periodDropdown}
            value={periodMonths}
            onChange={(e) => setPeriodMonths(Number(e.target.value))}
            aria-label="Select period"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <EngagementChart
          months={chartData.months}
          subscribersData={chartData.subscribers}
        />
      </div>
    </div>
  );
}
