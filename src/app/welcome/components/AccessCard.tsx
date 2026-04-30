import styles from './AccessCard.module.css';
import Link from 'next/link';

const arrowIcon = "/images/icons/welcome/arrow.svg";

interface AccessCardProps {
  type: 'student' | 'admin';
  iconSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function AccessCard({
  type,
  iconSrc,
  title,
  description,
  buttonText,
  buttonHref,
}: AccessCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={`${styles.iconContainer} ${styles[type]}`}>
          <img src={iconSrc} alt={title} className={styles.icon} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <Link href={buttonHref} className={`${styles.button} ${styles[`button${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
          <span className={styles.buttonText}>{buttonText}</span>
          <img 
            src={arrowIcon} 
            alt="arrow"
            className={styles.arrowIcon}
          />
        </Link>
      </div>
    </div>
  );
}










