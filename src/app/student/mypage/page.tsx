import styles from './MyPage.module.css';
import Header from '../home/components/Header';
import ProfileSection from './components/ProfileSection';
import TabNavigation from './components/TabNavigation';
import StatsGrid from './components/StatsGrid';
import SubscribedClubsSection from './components/SubscribedClubsSection';
import UpcomingEventsSection from './components/UpcomingEventsSection';
import RecommendedSection from './components/RecommendedSection';
import Footer from '../home/components/Footer';

export default function MyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <Header />
        <div className={styles.content}>
          <ProfileSection />
          <TabNavigation />
          <div className={styles.overviewTab}>
            <StatsGrid />
            <div className={styles.twoColumnGrid}>
              <SubscribedClubsSection />
              <UpcomingEventsSection />
            </div>
            <RecommendedSection />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}









