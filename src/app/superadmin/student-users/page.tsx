'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './StudentUsers.module.css';
import SuperAdminHeader from '../dashboard/components/SuperAdminHeader';
import SuperAdminSidebar from '../dashboard/components/SuperAdminSidebar';
import StatCard from './components/StatCard';
import StudentsTable from './components/StudentsTable';

interface StudentStats {
  total_users: number;
  active_this_month: number;
  new_this_week: number;
  avg_subscriptions: number;
}

export default function StudentUsersPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !verifyEmail.trim()) return;

    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/students/verify-email-by-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: verifyEmail.trim() }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setVerifyResult({ success: true, message: `✅ ${data.email} — email verified successfully.` });
        setVerifyEmail('');
      } else {
        const err = await response.json();
        setVerifyResult({ success: false, message: `❌ ${err.detail || 'Failed to verify email.'}` });
      }
    } catch {
      setVerifyResult({ success: false, message: '❌ Request failed. Please try again.' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/students/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load student statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} superadmin-layout`}>
      <SuperAdminHeader />
      
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        
        <div className={styles.contentArea}>
          <h1 className={styles.title}>Student Users</h1>

          <div className={styles.statsGrid}>
            <StatCard
              value={loading ? "..." : (stats?.total_users ?? 0).toLocaleString()}
              label="Total Users"
              subtext={loading ? "" : `+${stats?.new_this_week || 0} this week`}
              subtextColor="green"
            />
            <StatCard
              value={loading ? "..." : (stats?.new_this_week ?? 0).toString()}
              label="New This Week"
              subtext=""
              subtextColor="green"
            />
          </div>

          <div className={styles.tableWrapper}>
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <img src="/images/icons/superadmin/club-leaders/search.svg" alt="Search" className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="button" className={styles.searchButton}>
                Search
              </button>
            </div>
            <StudentsTable searchQuery={searchQuery} />
          </div>

          {/* Force Email Verification */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.1)',
            padding: '24px',
            marginTop: '24px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#0a0a0a', marginBottom: '8px' }}>
              Force Email Verification
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Manually mark a user&apos;s email as verified. Use this for accounts that cannot receive verification emails.
            </p>
            <form onSubmit={handleVerifyEmail} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="student@concordacademy.org"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                required
                disabled={verifyLoading}
                style={{
                  flex: '1',
                  minWidth: '260px',
                  height: '44px',
                  padding: '0 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={verifyLoading}
                style={{
                  height: '44px',
                  padding: '0 24px',
                  background: '#103b2a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: verifyLoading ? 'not-allowed' : 'pointer',
                  opacity: verifyLoading ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {verifyLoading ? 'Processing...' : 'Verify Email'}
              </button>
            </form>
            {verifyResult && (
              <p style={{
                marginTop: '12px',
                fontSize: '14px',
                color: verifyResult.success ? '#166534' : '#991b1b',
              }}>
                {verifyResult.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}









