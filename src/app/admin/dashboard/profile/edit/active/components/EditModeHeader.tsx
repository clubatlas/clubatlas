'use client';

import { useRouter } from 'next/navigation';
import styles from './EditModeHeader.module.css';

const imgIconBack = "https://www.figma.com/api/mcp/asset/bfb52e67-aae7-4eab-b2c1-a160f1a85446";
const imgIconPreview = "https://www.figma.com/api/mcp/asset/e6b2c0d1-009e-4c31-b001-db545d28ea54";
const imgIconSave = "https://www.figma.com/api/mcp/asset/8491c34e-4734-44a0-8a49-71184a1cdd71";

export default function EditModeHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/admin/dashboard/profile/edit');
  };

  const handlePreview = () => {
    console.log('Preview public profile');
  };

  const handleSave = () => {
    console.log('Save changes');
    router.push('/admin/dashboard/profile');
  };

  const handleCancel = () => {
    router.push('/admin/dashboard/profile/edit');
  };

  return (
    <div className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button className={styles.backButton} onClick={handleBack}>
            <img src={imgIconBack} alt="" className={styles.backIcon} />
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Edit Club Profile</h1>
            <p className={styles.subtitle}>Manage your club information</p>
          </div>
        </div>
        <div className={styles.rightSection}>
          <button className={styles.previewButton} onClick={handlePreview}>
            <img src={imgIconPreview} alt="" className={styles.previewIcon} />
            Preview Public Profile
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            <img src={imgIconSave} alt="" className={styles.saveIcon} />
            Save Changes
          </button>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}








