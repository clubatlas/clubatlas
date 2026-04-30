'use client';

import styles from './StatCard.module.css';

interface StatCardProps {
  value: string;
  label: string;
  subtext: string;
  subtextColor: 'green' | 'gray';
}

export default function StatCard({ value, label, subtext, subtextColor }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.subtext} ${styles[subtextColor]}`}>
        {subtext}
      </div>
    </div>
  );
}








