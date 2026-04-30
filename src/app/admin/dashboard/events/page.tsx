'use client';

import styles from '../Dashboard.module.css';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import EventsSection from './components/EventsSection';

export default function EventsPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader />
      <div className={styles.mainContent}>
        <SidebarNavigation />
        <div className={styles.eventsContent}>
          <EventsSection />
        </div>
      </div>
    </div>
  );
}








