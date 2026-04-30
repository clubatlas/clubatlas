'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './SystemMaintenance.module.css';

const downloadIcon = "/images/icons/superadmin/system/download.svg";

export default function SystemMaintenance() {
  const { user } = useAuth();
  const [backing, setBacking] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleBackup = async () => {
    if (!user || backing) return;

    try {
      setBacking(true);
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system/backup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(`Backup created successfully: ${data.backup_id}`);
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      console.error('Backup error:', error);
      alert('Failed to create backup');
    } finally {
      setBacking(false);
    }
  };

  const handleClearCache = async () => {
    if (!user || clearing) return;

    try {
      setClearing(true);
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system/clear-cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('Cache cleared successfully');
      } else {
        alert('Failed to clear cache');
      }
    } catch (error) {
      console.error('Clear cache error:', error);
      alert('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>System Maintenance</h3>
      <div className={styles.list}>
        <button 
          className={styles.maintenanceItem} 
          onClick={handleBackup}
          disabled={backing}
        >
          <div className={styles.info}>
            <div className={styles.itemTitle}>Database Backup</div>
            <div className={styles.itemDescription}>
              {backing ? 'Creating backup...' : 'Click to create backup'}
            </div>
          </div>
          <img src={downloadIcon} alt="Download" className={styles.icon} />
        </button>
        
        <button 
          className={styles.maintenanceItem} 
          onClick={handleClearCache}
          disabled={clearing}
        >
          <div className={styles.info}>
            <div className={styles.itemTitle}>Clear Cache</div>
            <div className={styles.itemDescription}>
              {clearing ? 'Clearing cache...' : 'Optimize system performance'}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}









