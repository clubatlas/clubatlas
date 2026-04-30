'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './SystemInformation.module.css';

interface SystemInfo {
  version: string;
  uptime: string;
  database_size: string;
  storage_used: string;
  total_storage: string;
  last_backup?: string;
}

export default function SystemInformation() {
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemInfo();
  }, []);

  const loadSystemInfo = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system/info`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>System Information</h3>
        <div className={styles.grid}>
          <div className={styles.infoItem}>
            <div className={styles.label}>Loading...</div>
            <div className={styles.value}>...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>System Information</h3>
      <div className={styles.grid}>
        {systemInfo && (
          <>
            <div className={styles.infoItem}>
              <div className={styles.label}>Version</div>
              <div className={styles.value}>{systemInfo.version}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.label}>Uptime</div>
              <div className={styles.value}>{systemInfo.uptime}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.label}>Database Size</div>
              <div className={styles.value}>{systemInfo.database_size}</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.label}>Storage Used</div>
              <div className={styles.value}>
                {systemInfo.storage_used === 'N/A' 
                  ? systemInfo.storage_used 
                  : `${systemInfo.storage_used} / ${systemInfo.total_storage}`}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}









