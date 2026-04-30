'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import { rejectLeaderRequest } from '@/lib/api/admin';
import { LeaderAccessRequestResponse } from '@/lib/api/auth';
import styles from './RejectRequestModal.module.css';

interface RejectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaderAccessRequestResponse | null;
  onSuccess: () => void;
}

export default function RejectRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: RejectRequestModalProps) {
  const { user } = useAuth();
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAdminNotes('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    if (!user || !request) return;

    try {
      setLoading(true);
      setError('');

      const token = await getIdToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await rejectLeaderRequest(
        request.id,
        { admin_notes: adminNotes },
        token
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to reject request:', error);
      setError('Failed to reject request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Reject Leader Request</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className={styles.requestInfo}>
              <p className={styles.infoLabel}>Applicant</p>
              <p className={styles.infoValue}>{request.display_name} ({request.email})</p>
            </div>

            <div className={styles.requestInfo}>
              <p className={styles.infoLabel}>Requested Position</p>
              <p className={styles.infoValue}>{request.requested_role}</p>
            </div>

            {request.reason && (
              <div className={styles.requestInfo}>
                <p className={styles.infoLabel}>Reason</p>
                <p className={styles.infoValue}>{request.reason}</p>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Reason for Rejection <span className={styles.required}>*</span>
              </label>
              <textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={styles.textarea}
                placeholder="Explain why this request is being rejected..."
                rows={4}
                required
              />
              <p className={styles.hint}>This will be visible to the applicant.</p>
            </div>

            {error && (
              <div className={styles.error}>{error}</div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.rejectButton}
              disabled={loading || !adminNotes.trim()}
            >
              {loading ? 'Rejecting...' : 'Reject Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
