import styles from '../Dashboard.module.css';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import ClubProfileSection from './components/ClubProfileSection';

export default function ClubProfilePage() {
  return (
    <div className={styles.container}>
      <DashboardHeader />
      <div className={styles.mainContent}>
        <SidebarNavigation />
        <ClubProfileSection />
      </div>
    </div>
  );
}









