'use client';

import { useState } from 'react';
import styles from './StudentSignup.module.css';
import Logo from '../../welcome/components/Logo';
import SignupInfoPanel from './components/SignupInfoPanel';
import SignupForm from './components/SignupForm';

export default function StudentSignupPage() {
  const [verificationSent, setVerificationSent] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.blurCircle1}></div>
        <div className={styles.blurCircle2}></div>
        <div className={styles.blurCircle3}></div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.headerSection}>
          <Logo />
          <h1 className={styles.mainTitle}>ClubAtlas</h1>
          <p className={styles.subtitle}>
            Your centralized hub for campus club discovery, events, and personalized recommendations
          </p>
        </div>

        <div className={styles.signupCard}>
          {!verificationSent && <SignupInfoPanel />}
          <SignupForm onVerificationSent={() => setVerificationSent(true)} />
        </div>

        <p className={styles.footer}>
          Connecting students with their perfect campus communities
        </p>
      </div>
    </div>
  );
}











