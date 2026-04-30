'use client';

import styles from './EditProfileHeader.module.css';

const imgIconBack = "/images/icons/dashboard/icon-back.svg";
const imgIconSave = "/images/icons/dashboard/icon-save.svg";

interface EditProfileHeaderProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function EditProfileHeader({ onSave, onCancel, isSaving }: EditProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button className={styles.backButton} onClick={onCancel}>
            <img src={imgIconBack} alt="" className={styles.backIcon} />
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Edit Club Profile</h1>
            <p className={styles.subtitle}>Update your club information</p>
          </div>
        </div>
        <div className={styles.rightSection}>
          <button className={styles.viewButton} onClick={onCancel}>
            Cancel
          </button>
          <button 
            className={styles.saveButton} 
            onClick={onSave}
            disabled={isSaving}
          >
            <img src={imgIconSave} alt="" className={styles.saveIcon} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

