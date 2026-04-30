'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './RequestAccess.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { requestLeaderAccess, getMyLeaderRequest } from '@/lib/api/auth';
import { getIdToken } from '@/lib/firebase/auth';
import { getClubs, Club } from '@/lib/api/clubs';
import { checkEmailExists } from '@/lib/api/users';

type EmailStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export default function RequestAccessPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    requestedClubId: '',
    requestedClubName: '',
    requestedRole: 'Cohead',
    reason: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubsError, setClubsError] = useState('');
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadClubs = async () => {
      setClubsLoading(true);
      setClubsError('');
      try {
        const response = await getClubs({ page_size: 100 });
        if (response.data) {
          setClubs(response.data.clubs);
        } else {
          setClubsError(typeof response.error === 'string' ? response.error : 'Failed to load clubs');
        }
      } catch (err) {
        setClubsError('Failed to load clubs');
        console.error('Failed to load clubs:', err);
      } finally {
        setClubsLoading(false);
      }
    };
    loadClubs();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const checkExistingRequest = async () => {
      if (!user || !userProfile) {
        setCheckingRequest(false);
        return;
      }
      try {
        const token = await getIdToken();
        if (!token) {
          setCheckingRequest(false);
          return;
        }
        const response = await getMyLeaderRequest(token);
        if (response.data) {
          setExistingRequest(response.data);
        }
      } catch (err) {
        console.error('Failed to check existing request:', err);
      } finally {
        setCheckingRequest(false);
      }
    };
    checkExistingRequest();
  }, [user, userProfile, authLoading]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClub = clubs.find(c => c.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      requestedClubId: e.target.value,
      requestedClubName: selectedClub?.name || '',
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));

    if (emailCheckTimer.current) {
      clearTimeout(emailCheckTimer.current);
    }

    if (!email.trim()) {
      setEmailStatus('idle');
      return;
    }

    setEmailStatus('checking');
    emailCheckTimer.current = setTimeout(async () => {
      try {
        const response = await checkEmailExists(email.trim());
        if (response.data?.exists) {
          setEmailStatus('valid');
        } else {
          setEmailStatus('invalid');
        }
      } catch {
        setEmailStatus('idle');
      }
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.requestedClubId) {
      setError('Please select a club.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (emailStatus === 'invalid') {
      setError('The entered email is not registered in the system.');
      return;
    }
    if (emailStatus === 'checking') {
      setError('Please wait for email verification to complete.');
      return;
    }
    if (emailStatus !== 'valid') {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);

    try {
      const token = await getIdToken();

      const response = await requestLeaderAccess({
        email: formData.email,
        requested_club_id: formData.requestedClubId,
        requested_club_name: formData.requestedClubName,
        requested_role: formData.requestedRole,
        reason: formData.reason,
      }, token ?? undefined);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setExistingRequest(response.data);
    } catch (err: any) {
      console.error('Request error:', err);
      setError('Request failed. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading || checkingRequest) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 className={styles.title}>Leader Access Request</h2>
            <p className={styles.subtitle}>Your request is pending approval</p>
          </div>

          <div className={styles.requestInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Requested Club:</span>
              <span className={styles.value}>{existingRequest.requested_club_name || 'N/A'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Requested Role:</span>
              <span className={styles.value}>{existingRequest.requested_role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span className={`${styles.badge} ${styles.pending}`}>Pending</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Requested At:</span>
              <span className={styles.value}>
                {new Date(existingRequest.requested_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <p className={styles.message}>
            Your leader access request is currently under review by a Super Admin.
            You will receive an email notification once your request is processed.
          </p>

          <Link href="/student/home" className={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (existingRequest && existingRequest.status === 'approved') {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 className={styles.title}>Request Approved!</h2>
            <p className={styles.subtitle}>You now have club leader access</p>
          </div>

          <p className={styles.message}>
            Your leader access request has been approved. Please sign out and sign back in
            to access the club leader dashboard.
          </p>

          <Link href="/admin/login" className={styles.backButton}>
            Go to Admin Login →
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 className={styles.title}>Request Submitted!</h2>
            <p className={styles.subtitle}>Your request has been sent successfully</p>
          </div>

          <p className={styles.message}>
            Your leader access request has been submitted and is awaiting approval from a Super Admin.
            You will receive an email notification once your request is processed.
          </p>

          <Link href="/student/home" className={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Request Leader Access</h2>
          <p className={styles.subtitle}>Apply to become a club leader</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleEmailChange}
              required
              disabled={loading}
            />
            {emailStatus === 'checking' && (
              <p className={styles.emailChecking}>Verifying email...</p>
            )}
            {emailStatus === 'valid' && (
              <p className={styles.emailSuccess}>✓ Registered account found</p>
            )}
            {emailStatus === 'invalid' && (
              <p className={styles.emailWarning}>✗ No registered account found with this email</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="requestedClubId" className={styles.label}>
              Club
            </label>
            <select
              id="requestedClubId"
              className={styles.select}
              value={formData.requestedClubId}
              onChange={handleClubChange}
              required
              disabled={loading || clubsLoading}
            >
              <option value="">
                {clubsLoading ? 'Loading clubs...' : clubsError ? 'Failed to load clubs' : 'Select a club'}
              </option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
            {clubsError && (
              <p className={styles.emailWarning}>{clubsError}</p>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="requestedRole" className={styles.label}>
              Requested Role
            </label>
            <input
              id="requestedRole"
              name="requestedRole"
              className={styles.select}
              value="Cohead"
              readOnly
              disabled
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || emailStatus === 'invalid' || emailStatus === 'checking'}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>

        <div className={styles.divider}></div>

        <Link href="/admin/login" className={styles.backLink}>
          ← Back to Admin Login
        </Link>
      </div>
    </div>
  );
}
