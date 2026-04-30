import styles from './Dashboard.module.css';
import DashboardHeader from './components/DashboardHeader';
import SidebarNavigation from './components/SidebarNavigation';
import OverviewSection from './components/OverviewSection';

export default function DashboardPage() {
  return (
    <div className={styles.container}>
      <DashboardHeader />
      <div className={styles.mainContent}>
        <SidebarNavigation />
        <OverviewSection />
      </div>
    </div>
  );
}










