import styles from './StatCard.module.css';

interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  sublabel: string;
  bgColor: string;
}

export default function StatCard({ icon, value, label, sublabel, bgColor }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconContainer} style={{ backgroundColor: bgColor }}>
        <img src={icon} alt={label} className={styles.icon} />
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.sublabel}>{sublabel}</div>
    </div>
  );
}









