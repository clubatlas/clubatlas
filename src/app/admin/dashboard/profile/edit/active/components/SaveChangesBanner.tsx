'use client';

import { useRouter } from 'next/navigation';
import styles from './SaveChangesBanner.module.css';

const imgIconSave = "https://www.figma.com/api/mcp/asset/ed2a0252-8f5b-4773-882d-7d89626e56c8";

export default function SaveChangesBanner() {
  const router = useRouter();

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      router.push('/admin/dashboard/profile');
    }
  };

  const handleSave = () => {
    console.log('Save all changes');
    router.push('/admin/dashboard/profile');
  };

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
          <button className={styles.discardButton} onClick={handleDiscard}>
            Discard Changes
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            <img src={imgIconSave} alt="" className={styles.saveIcon} />
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}








