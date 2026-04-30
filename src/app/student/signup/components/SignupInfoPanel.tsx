import styles from './SignupInfoPanel.module.css';

const studentIcon = "/images/icons/signup/student-icon.svg";
const checkCircleIcon = "/images/icons/signup/check-circle.svg";

export default function SignupInfoPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.decorativeCircle1}></div>
      <div className={styles.decorativeCircle2}></div>
      
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <img src={studentIcon} alt="Join as Student" className={styles.icon} />
        </div>
        <h2 className={styles.title}>ClubAtlas</h2>
        <p className={styles.subtitle}>Join as Student</p>
        <p className={styles.description}>
          Create your student account to discover clubs, get personalized recommendations, and connect with your campus community.
        </p>
        
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <img src={checkCircleIcon} alt="" className={styles.checkIcon} />
            <div className={styles.featureContent}>
              <p className={styles.featureTitle}>Discover Clubs</p>
              <p className={styles.featureDescription}>Browse and explore all campus clubs with smart filters</p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <img src={checkCircleIcon} alt="" className={styles.checkIcon} />
            <div className={styles.featureContent}>
              <p className={styles.featureTitle}>AI Recommendations</p>
              <p className={styles.featureDescription}>Get personalized club suggestions based on your interests</p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <img src={checkCircleIcon} alt="" className={styles.checkIcon} />
            <div className={styles.featureContent}>
              <p className={styles.featureTitle}>Track Events</p>
              <p className={styles.featureDescription}>Subscribe to clubs and track their events in your calendar</p>
            </div>
          </li>
          <li className={styles.featureItem}>
            <img src={checkCircleIcon} alt="" className={styles.checkIcon} />
            <div className={styles.featureContent}>
              <p className={styles.featureTitle}>Stay Connected</p>
              <p className={styles.featureDescription}>Receive updates from your favorite clubs</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}











