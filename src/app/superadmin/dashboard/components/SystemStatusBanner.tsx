import styles from './SystemStatusBanner.module.css';

const checkIcon = "/images/icons/superadmin/system-check.svg";

export default function SystemStatusBanner() {
  return (
    <div className={styles.banner}>
      <div className={styles.iconContainer}>
        <img src={checkIcon} alt="System Status" className={styles.icon} />
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>System Status: All Systems Operational</h3>
        <p className={styles.subtitle}>Last checked: 2 minutes ago • Uptime: 99.9%</p>
      </div>
    </div>
  );
}









