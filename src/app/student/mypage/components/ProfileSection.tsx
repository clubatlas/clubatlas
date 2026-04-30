'use client';

import styles from './ProfileSection.module.css';

export default function ProfileSection() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.avatar}>
          <span className={styles.initials}>JD</span>
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>John Doe</h1>
          <p className={styles.details}>
            john.doe@email.edu • Computer Science • Class of 2025
          </p>
          <div className={styles.badges}>
            <div className={styles.badge} style={{ background: '#eff6ff' }}>
              <span className={styles.badgeLabel}>Following:</span>
              <span className={styles.badgeValue} style={{ color: '#155dfc' }}>3 clubs</span>
            </div>
            <div className={styles.badge} style={{ background: '#f0fdf4' }}>
              <span className={styles.badgeLabel}>Events:</span>
              <span className={styles.badgeValue} style={{ color: '#00a63e' }}>3 attended</span>
            </div>
            <div className={styles.badge} style={{ background: '#faf5ff' }}>
              <span className={styles.badgeLabel}>Member since:</span>
              <span className={styles.badgeValue} style={{ color: '#9810fa' }}>Nov 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









