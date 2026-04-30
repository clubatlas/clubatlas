'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './PlatformConfiguration.module.css';

interface ConfigItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface PlatformConfigurationsResponse {
  configurations: ConfigItem[];
}

export default function PlatformConfiguration() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system/configurations`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: PlatformConfigurationsResponse = await response.json();
        setConfigs(data.configurations);
      }
    } catch (error) {
      console.error('Failed to load configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = async (id: string) => {
    if (!user) return;

    const config = configs.find(c => c.id === id);
    if (!config) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/system/configurations/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: !config.enabled }),
        }
      );

      if (response.ok) {
        setConfigs(prevConfigs =>
          prevConfigs.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to update configuration:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Platform Configuration</h3>
        <div className={styles.list}>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Platform Configuration</h3>
      <div className={styles.list}>
        {configs.map((config) => (
          <div key={config.id} className={styles.item}>
            <div className={styles.info}>
              <div className={styles.itemTitle}>{config.title}</div>
              <div className={styles.itemDescription}>{config.description}</div>
            </div>
            <button
              className={`${styles.statusButton} ${config.enabled ? styles.enabled : styles.disabled}`}
              onClick={() => toggleConfig(config.id)}
            >
              {config.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}









