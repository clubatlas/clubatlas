import styles from './StudentHome.module.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturedClubs from './components/FeaturedClubs';
import EventsSection from './components/EventsSection';
import AdminCTA from './components/AdminCTA';
import Footer from './components/Footer';

export default function StudentHomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <Header />
        <HeroSection />
        <FeaturedClubs />
        <EventsSection />
        <AdminCTA />
        <Footer />
      </div>
    </div>
  );
}









