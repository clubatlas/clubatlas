import styles from './StudentLogin.module.css';
import InfoPanel from './components/InfoPanel';
import LoginForm from './components/LoginForm';

export default function StudentLoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        {/* 배경 블러 효과 원형 장식 */}
        <div className={styles.blurCircle1}></div>
        <div className={styles.blurCircle2}></div>
        <div className={styles.blurCircle3}></div>
      </div>
      
      <div className={styles.content}>
        {/* 중앙 섹션: 로그인 카드 */}
        <div className={styles.loginCard}>
          <InfoPanel />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}










