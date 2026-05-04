import styles from './InfoPanel.module.css';

const studentPortalIcon = "/images/icons/student-login/student-portal.svg";

export default function InfoPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.decorativeCircle1}></div>
      <div className={styles.decorativeCircle2}></div>

      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <img 
            src={studentPortalIcon} 
            alt="Student Portal"
            className={styles.icon}
          />
        </div>
        <h2 className={styles.title}>ClubAtlas</h2>
        <p className={styles.subtitle}>Student Portal</p>
        <p className={styles.description}>
          Discover clubs, explore events, get personalized recommendations, and connect with your campus community.
        </p>
        
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Browse and discover clubs</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Get AI-powered recommendations</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Subscribe to club updates</span>
          </li>
          <li className={styles.featureItem}>
            <span className={styles.bullet}></span>
            <span>Track events in your calendar</span>
          </li>
        </ul>
      </div>
    </div>
  );
}










