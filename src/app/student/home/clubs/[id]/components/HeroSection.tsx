'use client';

import styles from './HeroSection.module.css';

const roboticsImage = "https://www.figma.com/api/mcp/asset/f19d250f-4777-4e93-a829-b8d8a3fb9731"; // 클럽 썸네일 이미지
const heartIcon = "/images/icons/clubs/heart.svg";

interface HeroSectionProps {
  clubId: string;
}

export default function HeroSection({ clubId }: HeroSectionProps) {
  const clubData: Record<string, any> = {
    '1': {
      name: 'Robotics Club',
      category: 'STEM',
      image: roboticsImage,
      tagline: 'Building the future with technology',
    },
  };

  const club = clubData[clubId] || clubData['1'];

  return (
    <div className={styles.heroSection}>
      <div className={styles.imageContainer}>
        <img src={club.image} alt={club.name} className={styles.image} />
        <div className={styles.imageOverlay} />
      </div>
      
      <div className={styles.heroContent}>
        <div className={styles.heroInfo}>
          <span className={styles.categoryTag}>{club.category}</span>
          <h1 className={styles.clubName}>{club.name}</h1>
          <p className={styles.tagline}>{club.tagline}</p>
          
          <div className={styles.actions}>
            <button className={styles.subscribeButton}>
              Subscribe to Club
            </button>
            <button className={styles.favoriteButton}>
              <img src={heartIcon} alt="Favorite" className={styles.heartIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






