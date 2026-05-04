import styles from './Welcome.module.css';
import Logo from './components/Logo';
import AccessCard from './components/AccessCard';
import FeatureCard from './components/FeatureCard';

const studentIcon = "/images/icons/welcome/student-icon.svg";
const adminIcon = "/images/icons/welcome/admin-icon.svg";
const clubDiscoveryIcon = "/images/icons/welcome/club-discovery.svg";
const calendarIcon = "/images/icons/welcome/calendar.svg";
const aiRecommendationsIcon = "/images/icons/welcome/ai-recommendations.svg";

export default function WelcomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.blurCircle1}></div>
        <div className={styles.blurCircle2}></div>
        <div className={styles.blurCircle3}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.headerSection}>
          <Logo />
          <h1 className={styles.mainTitle}>ClubAtlas</h1>
          <p className={styles.subtitle}>
            Your centralized hub for campus club discovery, events, and personalized recommendations
          </p>
        </div>

        <div className={styles.accessCards}>
          <AccessCard
            type="student"
            iconSrc={studentIcon}
            title="Student Access"
            description="Browse clubs, discover events, get AI-powered recommendations, and manage your subscriptions"
            buttonText="Enter as Student"
            buttonHref="/student/login"
          />
          <AccessCard
            type="admin"
            iconSrc={adminIcon}
            title="Admin Access"
            description="Club leaders: Manage your club profile, events, announcements, and engage with subscribers"
            buttonText="Admin Login"
            buttonHref="/admin/login"
          />
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.featuresTitle}>Platform Features</h2>
          <div className={styles.featuresGrid}>
            <FeatureCard
              iconSrc={clubDiscoveryIcon}
              title="Club Discovery"
              description="Browse and search from all campus clubs with smart filters"
            />
            <FeatureCard
              iconSrc={calendarIcon}
              title="Event Calendar"
              description="Track meetings and activities in one unified calendar"
            />
            <FeatureCard
              iconSrc={aiRecommendationsIcon}
              title="AI Recommendations"
              description="Get personalized club suggestions based on your interests"
            />
          </div>
        </div>

        <p className={styles.footer}>
          Connecting students with their perfect campus communities
        </p>
      </div>
    </div>
  );
}
