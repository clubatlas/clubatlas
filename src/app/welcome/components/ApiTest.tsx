'use client';

import { useState } from 'react';
import { checkHealth, getApiStatus } from '@/lib/api';
import styles from './ApiTest.module.css';

/**
 * API 연결 테스트 컴포넌트 (개발용)
 * Welcome 페이지에서 백엔드 API 연결을 테스트할 수 있습니다.
 */
export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    setHealthStatus('테스트 중...');
    const response = await checkHealth();
    if (response.error) {
      setHealthStatus(`❌ 오류: ${response.error}`);
    } else {
      setHealthStatus(`✅ 성공: ${JSON.stringify(response.data)}`);
    }
    setLoading(false);
  };

  const testApiStatus = async () => {
    setLoading(true);
    setApiStatus('테스트 중...');
    const response = await getApiStatus();
    if (response.error) {
      setApiStatus(`❌ 오류: ${response.error}`);
    } else {
      setApiStatus(`✅ 성공: ${JSON.stringify(response.data)}`);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>API 연결 테스트</h3>
      <div className={styles.buttons}>
        <button 
          onClick={testHealth} 
          disabled={loading}
          className={styles.button}
        >
          Health Check 테스트
        </button>
        <button 
          onClick={testApiStatus} 
          disabled={loading}
          className={styles.button}
        >
          API Status 테스트
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











