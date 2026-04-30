import styles from './StatCard.module.css';

interface StatCardProps {
  icon: string;
  iconBg: string;
  value: string;
  label: string;
  change: string;
  changePositive: boolean;
}

export default function StatCard({
  icon,
  iconBg,
  value,
  label,
  change,
  changePositive,
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconContainer} style={{ backgroundColor: iconBg }}>
        <img src={icon} alt={label} className={styles.icon} />
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.textBlock}>
        <div className={styles.label}>{label}</div>
        <div className={`${styles.change} ${changePositive ? styles.changePositive : ''}`}>
          {change}
        </div>
      </div>
    </div>
  );
}










