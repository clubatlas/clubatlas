'use client';

import { useState } from 'react';
import { checkHealth, getApiStatus } from '@/lib/api';
import styles from './ApiTest.module.css';

export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    setHealthStatus('Testing...');
    const response = await checkHealth();
    if (response.error) {
      setHealthStatus(`❌ Error: ${response.error}`);
    } else {
      setHealthStatus(`✅ Success: ${JSON.stringify(response.data)}`);
    }
    setLoading(false);
  };

  const testApiStatus = async () => {
    setLoading(true);
    setApiStatus('Testing...');
    const response = await getApiStatus();
    if (response.error) {
      setApiStatus(`❌ Error: ${response.error}`);
    } else {
      setApiStatus(`✅ Success: ${JSON.stringify(response.data)}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>API Connection Test</h3>
      <div className={styles.buttons}>
        <button
          onClick={testHealth}
          disabled={loading}
          className={styles.button}
        >
          Health Check Test
        </button>
        <button
          onClick={testApiStatus}
          disabled={loading}
          className={styles.button}
        >
          API Status Test
        </button>
      </div>
      <div className={styles.results}>
        {healthStatus && (
          <div className={styles.result}>
            <strong>Health Check:</strong> {healthStatus}
          </div>
        )}
        {apiStatus && (
          <div className={styles.result}>
            <strong>API Status:</strong> {apiStatus}
          </div>
        )}
      </div>
    </div>
  );
}
