import styles from './AdminInfoPanel.module.css';

type AdminRole = 'club-leader' | 'super-admin';

interface AdminInfoPanelProps {
  role: AdminRole;
}

export default function AdminInfoPanel({ role }: AdminInfoPanelProps) {
  if (role === 'super-admin') {
    return (
      <div className={styles.panel} style={{
        background: 'linear-gradient(123.76deg, rgba(15, 58, 41, 1) 0%, rgba(42, 100, 77, 1) 100%)'
      }}>
        <div className={styles.decorativeCircle1}></div>
        <div className={styles.decorativeCircle2}></div>

        <div className={styles.content}>
          <div className={`${styles.iconContainer} ${styles.iconContainerSuperAdmin}`}>
            <img 
              src="/images/icons/admin-login/super-admin-shield.svg" 
              alt="Super Admin Dashboard"
              className={styles.icon}
            />
          </div>
          <h2 className={styles.title}>ClubAtlas</h2>
          <p className={styles.subtitle}>Super Admin Dashboard</p>
          <p className={styles.description}>
            Manage all clubs, users, and system settings across the platform.
          </p>
          
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <span className={styles.bullet}></span>
              <span>Manage all clubs</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.bullet}></span>
              <span>Control user permissions</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.bullet}></span>
              <span>View platform analytics</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.bullet}></span>
              <span>System configuration</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel} style={{
      background: 'linear-gradient(180deg, #4f812b 0%, #3d6522 100%)'
    }}>
      <div className={styles.decorativeCircle1}></div>
      <div className={styles.decorativeCircle2}></div>

      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <img 
            src="/images/icons/admin-login/club-leader-icon.svg" 
            alt="Leader Dashboard"
            className={styles.icon}
          />
        </div>
        <h2 className={styles.title}>ClubAtlas</h2>
        <p className={styles.subtitle}>Leader Dashboard</p>
        <p className={styles.description}>
          Manage your club profile, events, announcements, and engage with your community.
        </p>
        
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Update club information</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Create and manage events</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Send announcements</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Track engagement analytics</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

