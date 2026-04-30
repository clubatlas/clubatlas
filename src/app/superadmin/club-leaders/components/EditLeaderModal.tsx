'use client';

import { useState, useEffect } from 'react';
import styles from './EditLeaderModal.module.css';
import { getClubs, Club } from '@/lib/api/clubs';
import { updateClubLeader } from '@/lib/api/superadmin';

const closeIcon = "/images/icons/superadmin/club-leaders/modal-close.svg";
const infoIcon = "/images/icons/superadmin/club-leaders/icon-info.svg";
const checkIcon = "/images/icons/superadmin/club-leaders/icon-check.svg";

interface Leader {
  id: string;
  name: string;
  email: string;
  club: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface EditLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  leader: Leader | null;
  onSuccess: () => void;
}

export default function EditLeaderModal({ isOpen, onClose, leader, onSuccess }: EditLeaderModalProps) {
  const [selectedClubId, setSelectedClubId] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubIdMap, setClubIdMap] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadClubs();
    }
  }, [isOpen]);

  useEffect(() => {
    if (leader && clubs.length > 0) {
      const foundClub = clubs.find(c => c.name === leader.club);
      if (foundClub) {
        setSelectedClubId(foundClub.id);
      }
    }
  }, [leader, clubs]);

  const loadClubs = async () => {
    try {
      const response = await getClubs({ page_size: 100 });
      if (response.data && !response.error) {
        setClubs(response.data.clubs);
        
        const idMap: { [key: string]: string } = {};
        response.data.clubs.forEach(club => {
          idMap[club.name] = club.id;
        });
        setClubIdMap(idMap);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    }
  };

  if (!isOpen || !leader) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const originalClubId = clubIdMap[leader.club];
      if (selectedClubId === originalClubId) {
        alert('No changes detected');
        onClose();
        return;
      }

      const response = await updateClubLeader(leader.id, { club_id: selectedClubId });

      if (response.error) {
        setError(response.error);
        return;
      }

      alert('Leader updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update leader:', err);
      setError(err.message || 'Failed to update leader');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit Leader Information</h3>
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
            <label htmlFor="leaderName" className={styles.label}>Leader Name</label>
            <input
              type="text"
              id="leaderName"
              className={styles.input}
              value={leader.name}
              disabled
              style={{ background: '#f3f4f6', cursor: 'not-allowed', height: '36px', padding: '6px 16px' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={leader.email}
              disabled
              style={{ background: '#f3f4f6', cursor: 'not-allowed', height: '36px', padding: '6px 16px' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="clubAssignment" className={styles.label}>Club Assignment</label>
            <select
              id="clubAssignment"
              className={styles.dropdown}
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
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

          <div className={styles.infoBox}>
            <img src={infoIcon} alt="Info" className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <p className={styles.infoTitle}>Important Notes:</p>
              <ul className={styles.infoList}>
                <li>Changes will be applied immediately</li>
                <li>Only club assignment can be edited here</li>
              </ul>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={isLoading}>
              <img src={checkIcon} alt="Save" className={styles.checkIcon} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}









