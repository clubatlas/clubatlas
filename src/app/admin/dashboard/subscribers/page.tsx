'use client';

import styles from '../Dashboard.module.css';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import SubscribersSection from './components/SubscribersSection';

export default function SubscribersPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader />
      <div className={styles.mainContent}>
        <SidebarNavigation />
        <div className={styles.subscribersContent}>
          <SubscribersSection />
        </div>
      </div>
    </div>
  );
}

