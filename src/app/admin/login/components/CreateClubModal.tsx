'use client';

import { useState } from 'react';
import styles from './CreateClubModal.module.css';

interface Props {
  onClose: () => void;
}

export default function CreateClubModal({ onClose }: Props) {
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { apiClient } = await import('@/lib/api/client');
      const result = await apiClient.post('/api/admin/club-creation-requests', {
        club_name: clubName.trim(),
        description: description.trim(),
      });
      if (result.status >= 400) {
        setError(result.error || 'Failed to submit request. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Create New Club</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <img
              src="/images/icons/forgot-password/modal-close.svg"
              alt="close"
              width="16"
              height="16"
            />
          </button>
        </div>

        {submitted ? (
          <div className={styles.successState}>
            <p className={styles.successText}>
              Your club creation request has been submitted. An admin will review it and get back to you soon.
            </p>
            <button className={styles.submitButton} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p className={styles.errorText}>{error}</p>}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Club Name</label>
              <input
                type="text"
                className={styles.input}
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Enter club name"
                disabled={submitting}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your club..."
                disabled={submitting}
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Create Club'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
