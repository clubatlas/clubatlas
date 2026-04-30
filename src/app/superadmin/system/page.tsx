'use client';

import styles from './System.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import PlatformConfiguration from './components/PlatformConfiguration';
import SystemMaintenance from './components/SystemMaintenance';
import SystemInformation from './components/SystemInformation';

export default function SystemPage() {
  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <h1 className={styles.title}>System Settings</h1>

          <PlatformConfiguration />
          <SystemMaintenance />
          <SystemInformation />
        </div>
      </div>
    </div>
  );
}









