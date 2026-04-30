'use client';

import styles from './EditSaveFooter.module.css';

const imgIconSave = "/images/icons/dashboard/icon-save.svg";

interface EditSaveFooterProps {
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function EditSaveFooter({ onDiscard, onSave, isSaving }: EditSaveFooterProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.textSection}>
          <h3 className={styles.title}>Ready to publish your changes?</h3>
          <p className={styles.description}>
            Review your edits and save to update your club&apos;s public profile
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.discardButton} onClick={onDiscard} disabled={isSaving}>
            Discard Changes
          </button>
          <button className={styles.saveButton} onClick={onSave} disabled={isSaving}>
            <img src={imgIconSave} alt="" className={styles.saveIcon} />
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
