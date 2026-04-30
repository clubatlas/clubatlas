'use client';

import styles from '../Dashboard.module.css';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import AnalyticsSection from './components/AnalyticsSection';

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader />
      <div className={styles.mainContent}>
        <SidebarNavigation />
        <div className={styles.analyticsContent}>
          <AnalyticsSection />
        </div>
      </div>
    </div>
  );
}
