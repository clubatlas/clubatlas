'use client';

import { useState, useEffect } from 'react';
import styles from './AssignLeaderModal.module.css';
import { getClubs, Club } from '@/lib/api/clubs';
import { assignClubLeader } from '@/lib/api/superadmin';

const closeIcon = "/images/icons/superadmin/club-leaders/modal-close.svg";

interface AssignLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignLeaderModal({ isOpen, onClose, onSuccess }: AssignLeaderModalProps) {
  const [email, setEmail] = useState('');
  const [clubId, setClubId] = useState('');
  const [roleTitle] = useState('Cohead');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadClubs();
    }
  }, [isOpen]);

  const loadClubs = async () => {
    try {
      const response = await getClubs({ page_size: 100 });
      if (response.data && !response.error) {
        setClubs(response.data.clubs);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await assignClubLeader({
        email,
        club_id: clubId,
        role_title: roleTitle
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      alert(`Successfully assigned ${email} as leader of ${response.data?.club_name}`);
      
      // Reset form
      setEmail('');
      setClubId('');
      

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to assign leader:', err);
      setError(err.message || 'Failed to assign leader');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Assign New Leader</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={closeIcon} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              padding: '12px', 
              background: '#fee2e2', 
              border: '1px solid #ef4444',
              borderRadius: '8px', 
              color: '#991b1b',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>User Email</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="user@email.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              The user must already have an account
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="club" className={styles.label}>Club</label>
            <select
              id="club"
              className={styles.dropdown}
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>Role Title</label>
            <input
              type="text"
              id="role"
              className={styles.input}
              value="Cohead"
              readOnly
              disabled
            />
          </div>

          <button type="submit" className={styles.assignButton} disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Leader'}
          </button>
        </form>
      </div>
    </div>
  );
}









