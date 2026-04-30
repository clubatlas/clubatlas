'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './ActivityChart.module.css';

const chartIcon = "/images/icons/superadmin/student-users/chart.svg";

interface ActivityChartData {
  labels: string[];
  datasets: any[];
}

export default function ActivityChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ActivityChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/students/activity-chart?days=30`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to load activity chart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>User Activity Trends</h3>
      <div className={styles.chartArea}>
        <div className={styles.placeholder}>
          <img src={chartIcon} alt="Chart" className={styles.icon} />
          <p className={styles.text}>
            {loading ? 'Loading chart data...' : chartData ? `${chartData.labels.length} days of activity data loaded` : 'User Activity Chart Visualization'}
          </p>
        </div>
      </div>
    </div>
  );
}









