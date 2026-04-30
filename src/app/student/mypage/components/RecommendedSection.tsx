'use client';

import Link from 'next/link';
import styles from './RecommendedSection.module.css';

const bookmarkIcon = "https://www.figma.com/api/mcp/asset/e903c1be-ffe7-44c8-844c-a94dcba73734";

const recommended = [
  {
    id: 1,
    name: 'Robotics Club',
    matchPercentage: '88% Match',
    image: '',
  },
  {
    id: 2,
    name: 'Photography Club',
    matchPercentage: '88% Match',
    image: '',
  },
  {
    id: 3,
    name: 'Debate Team',
    matchPercentage: '88% Match',
    image: '',
  },
];

export default function RecommendedSection() {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recommended for You</h2>
        <Link href="/student/home/recommendations" className={styles.getMore}>
          Get More Recommendations →
        </Link>
      </div>
      <div className={styles.grid}>
        {recommended.map((club) => (
          <div key={club.id} className={styles.card}>
            <div className={styles.clubImage} />
            <span className={styles.matchBadge}>{club.matchPercentage}</span>
            <h3 className={styles.clubName}>{club.name}</h3>
            <div className={styles.buttons}>
              <Link href={`/student/home/clubs/${club.id}`} className={styles.viewButton}>
                View
              </Link>
              <button className={styles.bookmarkButton}>
                <img src={bookmarkIcon} alt="" className={styles.bookmarkIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}









