'use client';

import Link from 'next/link';
import styles from './SubscribedClubsSection.module.css';

const clockIcon = "https://www.figma.com/api/mcp/asset/957a63a6-0ba3-49b0-ab28-20f59d80839d";

const clubs = [
  {
    id: 1,
    name: 'Robotics Club',
    category: 'ACADEMIC',
    categoryColor: '#dbeafe',
    categoryTextColor: '#1447e6',
    nextMeeting: 'Mon, Nov 27, 4:00 PM',
  },
  {
    id: 2,
    name: 'Photography Club',
    category: 'ARTS',
    categoryColor: '#dbeafe',
    categoryTextColor: '#1447e6',
    nextMeeting: 'Thu, Nov 30, 6:00 PM',
  },
  {
    id: 3,
    name: 'Debate Team',
    category: 'ACADEMIC',
    categoryColor: '#dbeafe',
    categoryTextColor: '#1447e6',
    nextMeeting: 'Wed, Nov 29, 3:00 PM',
  },
];

export default function SubscribedClubsSection() {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Subscribed Clubs</h2>
        <Link href="/student/home/clubs" className={styles.browseMore}>
          Browse More →
        </Link>
      </div>
      <div className={styles.clubsList}>
        {clubs.map((club) => (
          <div key={club.id} className={styles.clubCard}>
            <div className={styles.clubInfo}>
              <div className={styles.clubIcon} />
              <div className={styles.clubDetails}>
                <span 
                  className={styles.category} 
                  style={{ 
                    background: club.categoryColor, 
                    color: club.categoryTextColor 
                  }}
                >
                  {club.category}
                </span>
                <h3 className={styles.clubName}>{club.name}</h3>
                <div className={styles.nextMeeting}>
                  <img src={clockIcon} alt="" className={styles.clockIcon} />
                  <span>Next: {club.nextMeeting}</span>
                </div>
              </div>
            </div>
            <Link href={`/student/home/clubs/${club.id}`} className={styles.viewButton}>
              View Profile
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}









