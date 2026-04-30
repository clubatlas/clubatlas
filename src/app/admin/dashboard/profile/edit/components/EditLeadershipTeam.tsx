'use client';

import { useState, useRef } from 'react';
import styles from './EditLeadershipTeam.module.css';
import { ClubLeader } from '@/lib/api/clubs';

const imgIconEdit = "/images/icons/dashboard/icon-edit.svg";
const imgIconDelete = "/images/icons/dashboard/icon-delete.svg";

interface LeaderCardProps {
  leader: ClubLeader;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: (updated: ClubLeader) => void;
  onCancel: () => void;
  onAvatarUpload?: (file: File) => void;
}

function LeaderCard({ leader, isEditing, onEdit, onDelete, onSave, onCancel, onAvatarUpload }: LeaderCardProps) {
  const [draft, setDraft] = useState<ClubLeader>({ ...leader });
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const initial = (draft.name || '?').charAt(0).toUpperCase();

  const handleSave = () => {
    onSave({ ...draft, avatar_url: leader.avatar_url });
  };

  const handleAvatarClick = () => {
    if (onAvatarUpload) {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
    e.target.value = '';
  };

  const displayAvatarUrl = leader.avatar_url;

  return (
    <div className={styles.leaderCard}>
      <div className={styles.cardTop}>
        <div
          className={`${styles.avatar} ${onAvatarUpload ? styles.avatarClickable : ''}`}
          onClick={handleAvatarClick}
        >
          {displayAvatarUrl ? (
            <img src={displayAvatarUrl} alt={leader.name} className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarText}>{initial}</span>
          )}
          {onAvatarUpload && (
            <div className={styles.avatarOverlay}>
              <span className={styles.avatarOverlayIcon}>📷</span>
            </div>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileChange}
            style={{ display: 'none' }}
          />
        </div>
        <div className={styles.actions}>
          {!isEditing && (
            <>
              <button type="button" className={styles.actionButton} onClick={onEdit}>
                <img src={imgIconEdit} alt="Edit" className={styles.actionIcon} />
              </button>
              <button type="button" className={styles.actionButton} onClick={onDelete}>
                <img src={imgIconDelete} alt="Delete" className={styles.actionIcon} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className={styles.editFields}>
          <input
            className={styles.fieldInput}
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <input
            className={styles.fieldInput}
            value="Cohead"
            readOnly
            disabled
          />
          <input
            className={styles.fieldInput}
            placeholder="Email"
            type="email"
            value={draft.email || ''}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          />
          <div className={styles.editActions}>
            <button type="button" className={styles.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.leaderInfo}>
          <h3 className={styles.leaderName}>{leader.name || '(No name)'}</h3>
          <p className={styles.leaderRole}>{leader.role || '(No role)'}</p>
          <p className={styles.leaderEmail}>{leader.email || '(No email)'}</p>
        </div>
      )}
    </div>
  );
}

interface EditLeadershipTeamProps {
  leaders: ClubLeader[];
  setLeaders: (value: ClubLeader[]) => void;
  onAvatarUpload?: (leaderIdx: number, file: File) => void;
}

export default function EditLeadershipTeam({ leaders, setLeaders, onAvatarUpload }: EditLeadershipTeamProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleAddLeader = () => {
    const newLeader: ClubLeader = { uid: `new-${Date.now()}`, name: '', role: 'Cohead', email: '' };
    const newLeaders = [...leaders, newLeader];
    setLeaders(newLeaders);
    setEditingIdx(newLeaders.length - 1);
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
  };

  const handleDelete = (idx: number) => {
    setLeaders(leaders.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const handleSave = (idx: number, updated: ClubLeader) => {
    const newLeaders = leaders.map((l, i) => (i === idx ? updated : l));
    setLeaders(newLeaders);
    setEditingIdx(null);
  };

  const handleCancel = (idx: number) => {
    if (!leaders[idx].name && !leaders[idx].role) {
      setLeaders(leaders.filter((_, i) => i !== idx));
    }
    setEditingIdx(null);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Leadership Team</h2>
        <button type="button" className={styles.addButton} onClick={handleAddLeader}>
          + Add Leader
        </button>
      </div>

      {leaders.length === 0 ? (
        <div className={styles.emptyState}>No leaders assigned yet</div>
      ) : (
        <div className={styles.leadersGrid}>
          {leaders.map((leader, idx) => (
            <LeaderCard
              key={leader.uid || idx}
              leader={leader}
              isEditing={editingIdx === idx}
              onEdit={() => handleEdit(idx)}
              onDelete={() => handleDelete(idx)}
              onSave={(updated) => handleSave(idx, updated)}
              onCancel={() => handleCancel(idx)}
              onAvatarUpload={onAvatarUpload ? (file) => onAvatarUpload(idx, file) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}








