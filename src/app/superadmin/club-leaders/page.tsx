'use client';

import { useState } from 'react';
import styles from './ClubLeaders.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import LeadersTable from './components/LeadersTable';
import PendingRequestsTable from './components/PendingRequestsTable';
import AssignLeaderModal from './components/AssignLeaderModal';

type TabType = 'current' | 'pending';

export default function ClubLeadersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('current');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSearch = () => {};

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAssignSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <div className={styles.header}>
            <h1 className={styles.title}>Club Leaders Management</h1>
            {activeTab === 'current' && (
              <button className={styles.assignButton} onClick={handleOpenModal}>
                <img src="/images/icons/superadmin/club-leaders/plus.svg" alt="" className={styles.assignButtonIcon} />
                + Assign New Leader
              </button>
            )}
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'current' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Leaders
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Requests
            </button>
          </div>

          {activeTab === 'current' && (
            <div className={styles.tableWrapper}>
              <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                  <img src="/images/icons/superadmin/club-leaders/search.svg" alt="Search" className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search leaders by name or email..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button className={styles.searchButton} onClick={handleSearch}>
                  Search
                </button>
              </div>

              <LeadersTable key={refreshKey} searchQuery={searchQuery} />
            </div>
          )}

          {activeTab === 'pending' && (
            <div className={styles.tableWrapper}>
              <PendingRequestsTable />
            </div>
          )}
        </div>
      </div>

      <AssignLeaderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}

