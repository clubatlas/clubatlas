'use client';

import { useRouter } from 'next/navigation';
import styles from './EditModeBanner.module.css';

const imgIconAlert = "https://www.figma.com/api/mcp/asset/0226e3fa-5ebe-4bf2-998b-7df01e4436a8";

export default function EditModeBanner() {
  const router = useRouter();

  const handleExitEditMode = () => {
    router.push('/admin/dashboard/profile/edit');
  };

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.leftSection}>
          <div className={styles.iconContainer}>
            <img src={imgIconAlert} alt="" className={styles.icon} />
          </div>
          <div className={styles.textSection}>
            <h3 className={styles.title}>📝 Edit Mode Active</h3>
            <p className={styles.description}>
              Make changes to your club profile. Click &quot;Save Changes&quot; when done.
            </p>
          </div>
        </div>
        <button className={styles.exitButton} onClick={handleExitEditMode}>
          Exit Edit Mode
        </button>
      </div>
    </div>
  );
}








