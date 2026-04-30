import styles from './FeatureCard.module.css';

interface FeatureCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

export default function FeatureCard({ iconSrc, title, description }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.iconContainer}>
        <img src={iconSrc} alt={title} className={styles.icon} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}











