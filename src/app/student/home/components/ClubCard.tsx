'use client';

import Link from 'next/link';
import styles from './ClubCard.module.css';

const clockIcon = "/images/icons/clock.svg";
const usersIcon = "/images/icons/users.svg";

interface ClubCardProps {
  club: {
    id: number;
    name: string;
    description: string;
    category: string;
    categoryColor: string;
    image: string;
    schedule: string;
    members: string;
  };
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <Link href={`/student/home/clubs/${club.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={club.image} alt={club.name} className={styles.image} />
        <div className={styles.imageOverlay} />
        <span className={styles.categoryTag}>{club.category}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{club.name}</h3>
        <p className={styles.description}>{club.description}</p>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <img src={clockIcon} alt="" />
            <span>{club.schedule}</span>
          </div>
          <div className={styles.metaItem}>
            <img src={usersIcon} alt="" />
            <span>{club.members}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}





