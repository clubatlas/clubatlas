import styles from './Logo.module.css';

const logoIcon = "/images/icons/welcome/logo.svg";

export default function Logo() {
  return (
    <div className={styles.logoContainer}>
      <div className={styles.logoIcon}>
        <img 
          src={logoIcon} 
          alt="ClubAtlas Logo"
          className={styles.logoImage}
        />
      </div>
    </div>
  );
}










