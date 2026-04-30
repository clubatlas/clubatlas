'use client';

import Link from 'next/link';
import styles from './HeroSection.module.css';

const arrowIcon = "/images/icons/arrow-right.svg";
const sparklesIcon = "/images/icons/sparkles.svg";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Discover Your Campus Community</h1>
        <p className={styles.subtitle}>
          Your centralized hub for club discovery, events, and personalized recommendations
        </p>
        <div className={styles.buttons}>
          <Link href="/student/home/clubs" className={styles.primaryButton}>
            <span>Explore Clubs</span>
            <img src={arrowIcon} alt="" />
          </Link>
          <Link href="/student/home/ai-recommendations" className={styles.secondaryButton}>
            <img src={sparklesIcon} alt="" />
            <span>Get AI Recommendations</span>
          </Link>
        </div>
      </div>
    </section>
  );
}





