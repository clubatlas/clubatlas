'use client';

import { useState } from 'react';
import styles from './PasswordRequests.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import RequestsTable from './components/RequestsTable';

export default function PasswordRequestsPage() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <div className={styles.header}>
            <h1 className={styles.title}>Password Reset Requests</h1>
            <p className={styles.subtitle}>Manage and approve password reset requests from users</p>
          </div>

          <StatsCards />
          
          <FilterBar filterStatus={filterStatus} onFilterChange={setFilterStatus} />
          
          <RequestsTable filterStatus={filterStatus} />
        </div>
      </div>
    </div>
  );
}









