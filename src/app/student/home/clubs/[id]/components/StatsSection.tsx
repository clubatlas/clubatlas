'use client';

import styles from './StatsSection.module.css';

interface StatsSectionProps {
  clubId: string;
}

export default function StatsSection({ clubId }: StatsSectionProps) {
  const stats = [
    {
      value: '127+',
      label: 'Active Members',
      icon: '👥',
    },
    {
      value: '45+',
      label: 'Projects Completed',
      icon: '🎯',
    },
    {
      value: '12+',
      label: 'Awards Won',
      icon: '🏆',
    },
    {
      value: '3',
      label: 'Years Established',
      icon: '📅',
    },
  ];

  return (
    <section className={styles.statsSection}>
      <h2 className={styles.sectionTitle}>Club Statistics</h2>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.icon}>{stat.icon}</div>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}






