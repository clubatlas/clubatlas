'use client';

import Link from 'next/link';
import styles from './ClubCard.module.css';

const clockIcon = "/images/icons/clubs/clock.svg";
const locationIcon = "/images/icons/clubs/location.svg";
const usersIcon = "/images/icons/clubs/users.svg";
const heartIcon = "/images/icons/clubs/heart.svg";

interface ClubCardProps {
  club: {
    id: number;
    name: string;
    description: string;
    category: string;
    image: string;
    schedule: string;
    location: string;
    members: number;
  };
}

export default function ClubCard({ club }: ClubCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img src={club.image} alt={club.name} className={styles.image} />
        <div className={styles.imageOverlay} />
        <span className={styles.categoryTag}>{club.category}</span>
        <button className={styles.favoriteButton} aria-label="Add to favorites">
          <img src={heartIcon} alt="" className={styles.heartIcon} />
        </button>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{club.name}</h3>
        <p className={styles.description}>{club.description}</p>
        
        <div className={styles.metaContainer}>
          <div className={styles.metaItem}>
            <img src={clockIcon} alt="" className={styles.metaIcon} />
            <span className={styles.metaText}>{club.schedule}</span>
          </div>
          <div className={styles.metaItem}>
            <img src={locationIcon} alt="" className={styles.metaIcon} />
            <span className={styles.metaText}>{club.location}</span>
          </div>
          <div className={styles.metaItem}>
            <img src={usersIcon} alt="" className={styles.metaIcon} />
            <span className={styles.metaText}>{club.members}+ members</span>
          </div>
        </div>

        <Link href={`/student/home/clubs/${club.id}`} className={styles.viewButton}>
          View Details
        </Link>
      </div>
    </div>
  );
}

