'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './AllClubs.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import AllClubsTable from './components/AllClubsTable';
import ClubStats from './components/ClubStats';
import CreateClubModal, { ClubFormData } from './components/CreateClubModal';

export default function AllClubsPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateClub = async (data: ClubFormData) => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            categories: [data.category],
            activity_type: [data.category],
            leader_email: data.leader,
            tagline: '',
          }),
        }
      );

      if (response.ok) {
        alert('Club created successfully!');
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1);
      } else {
        const error = await response.json();
        alert(`Failed to create club: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create club:', error);
      alert('Failed to create club');
    }
  };

  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <div className={styles.header}>
            <h1 className={styles.title}>All Clubs Management</h1>
            <button 
              className={styles.createButton}
              onClick={() => setIsModalOpen(true)}
            >
              <img src="/images/icons/superadmin/all-clubs/plus.svg" alt="" className={styles.createButtonIcon} />
              + Create New Club
            </button>
          </div>

          <AllClubsTable key={refreshKey} />
          
          <ClubStats key={`stats-${refreshKey}`} />
        </div>
      </div>

      <CreateClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClub}
      />
    </div>
  );
}

