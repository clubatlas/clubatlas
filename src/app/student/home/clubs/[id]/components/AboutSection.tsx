'use client';

import styles from './AboutSection.module.css';

const clockIcon = "/images/icons/clubs/clock.svg";
const locationIcon = "/images/icons/clubs/location.svg";

interface AboutSectionProps {
  clubId: string;
}

export default function AboutSection({ clubId }: AboutSectionProps) {
  const clubData: Record<string, any> = {
    '1': {
      description: 'The Robotics Club is dedicated to exploring the exciting world of robotics and automation. We provide hands-on experience with cutting-edge technology, participate in competitions, and work on innovative projects that push the boundaries of what\'s possible. Whether you\'re a beginner or an experienced engineer, there\'s a place for you in our club.',
      schedule: 'Every Monday, 4:00 PM',
      location: 'Engineering Lab, Building A',
    },
  };

  const club = clubData[clubId] || clubData['1'];

  return (
    <section className={styles.aboutSection}>
      <div className={styles.mainContent}>
        <h2 className={styles.sectionTitle}>About This Club</h2>
        <p className={styles.description}>{club.description}</p>
      </div>
      
      <div className={styles.sidebar}>
        <div className={styles.infoCard}>
          <h3 className={styles.cardTitle}>Meeting Details</h3>
          
          <div className={styles.infoItem}>
            <img src={clockIcon} alt="Schedule" className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Schedule</p>
              <p className={styles.infoValue}>{club.schedule}</p>
            </div>
          </div>
          
          <div className={styles.infoItem}>
            <img src={locationIcon} alt="Location" className={styles.icon} />
            <div>
              <p className={styles.infoLabel}>Location</p>
              <p className={styles.infoValue}>{club.location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}






