'use client';

import styles from './StatsCards.module.css';

const imgIcon1 = "https://www.figma.com/api/mcp/asset/019e3258-b1de-4be7-9173-e0bade2fb804";
const imgIcon2 = "https://www.figma.com/api/mcp/asset/fd315f4e-9d4e-4fd3-8d67-c963e95f8f17";
const imgIcon3 = "https://www.figma.com/api/mcp/asset/182e1bcd-cdec-4e3d-b931-063f7d96c22d";
const imgIcon4 = "https://www.figma.com/api/mcp/asset/003e646a-f1d8-4a62-b1fa-4fcd0d1101fd";

interface StatCardData {
  icon: string;
  value: string;
  label: string;
  bgColor: string;
}

const statsData: StatCardData[] = [
  { icon: imgIcon1, value: '5', label: 'Total Requests', bgColor: '#dbeafe' },
  { icon: imgIcon2, value: '3', label: 'Pending', bgColor: '#fef9c2' },
  { icon: imgIcon3, value: '1', label: 'Approved', bgColor: '#dcfce7' },
  { icon: imgIcon4, value: '1', label: 'Rejected', bgColor: '#ffe2e2' }
];

export default function StatsCards() {
  return (
    <div className={styles.grid}>
      {statsData.map((stat, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.topRow}>
            <div className={styles.iconBox} style={{ backgroundColor: stat.bgColor }}>
              <img src={stat.icon} alt={stat.label} className={styles.icon} />
            </div>
            <div className={styles.value}>{stat.value}</div>
          </div>
          <div className={styles.label}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}









