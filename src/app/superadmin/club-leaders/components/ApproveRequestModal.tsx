'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import { approveLeaderRequest } from '@/lib/api/admin';
import { getClubs, Club } from '@/lib/api/clubs';
import { LeaderAccessRequestResponse } from '@/lib/api/auth';
import styles from './ApproveRequestModal.module.css';

interface ApproveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaderAccessRequestResponse | null;
  onSuccess: () => void;
}

export default function ApproveRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: ApproveRequestModalProps) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadClubs();
      setSelectedClubId(request?.requested_club_id || '');
      setAdminNotes('');
      setError('');
    }
  }, [isOpen, request]);

  const loadClubs = async () => {
    try {
      const response = await getClubs({ page_size: 100 });
      if (response.data) {
        setClubs(response.data.clubs);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClubId) {
      setError('Please select a club');
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

      const response = await approveLeaderRequest(
        request.id,
        {
          assign_to_club_id: selectedClubId,
          admin_notes: adminNotes || undefined,
        },
        token
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to approve request:', error);
      setError('Failed to approve request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Approve Leader Request</h2>
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
              <label htmlFor="club" className={styles.label}>
                Assign to Club <span className={styles.required}>*</span>
              </label>
              <select
                id="club"
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                className={styles.select}
                required
              >
                <option value="">Select a club...</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Admin Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={styles.textarea}
                placeholder="Any notes for this approval..."
                rows={3}
              />
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
              className={styles.approveButton}
              disabled={loading || !selectedClubId}
            >
              {loading ? 'Approving...' : 'Approve Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
