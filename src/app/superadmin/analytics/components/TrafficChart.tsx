'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './TrafficChart.module.css';

const chartIcon = "/images/icons/superadmin/analytics/chart.svg";

interface TrafficChartData {
  labels: string[];
  datasets: any[];
}

export default function TrafficChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<TrafficChartData | null>(null);
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics/traffic?days=30`,
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
      console.error('Failed to load traffic chart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Traffic Overview</h3>
      <div className={styles.chartArea}>
        <div className={styles.placeholder}>
          <img src={chartIcon} alt="Chart" className={styles.icon} />
          <p className={styles.text}>
            {loading ? 'Loading traffic data...' : chartData ? `${chartData.labels.length} days of traffic data loaded` : 'Traffic Chart'}
          </p>
        </div>
      </div>
    </div>
  );
}









