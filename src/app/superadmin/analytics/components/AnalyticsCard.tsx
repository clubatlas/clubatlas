'use client';

import styles from './AnalyticsCard.module.css';

interface AnalyticsCardProps {
  value: string;
  label: string;
  subtext: string;
}

export default function AnalyticsCard({ value, label, subtext }: AnalyticsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {subtext ? <div className={styles.subtext}>{subtext}</div> : null}
    </div>
  );
}









