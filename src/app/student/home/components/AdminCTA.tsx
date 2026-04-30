'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AdminCTA.module.css';

export default function AdminCTA() {
  const { isClubLeader, isSuperAdmin } = useAuth();

  if (isSuperAdmin) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
          <div className={styles.content}>
            <h2 className={styles.title}>Direct Link to SuperAdmin</h2>
            <p className={styles.subtitle}>
              If you&apos;re a super admin, please use this button to go back to dashboard.
            </p>
            <Link href="/superadmin/dashboard" className={styles.button}>
              SuperAdmin dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
        <div className={styles.content}>
          <h2 className={styles.title}>Direct Link to Admin</h2>
          <p className={styles.subtitle}>
            {isClubLeader 
              ? "If you're an admin, please use this button to go to Admin Home."
              : "If you're an admin, please use this button to log in."}
          </p>
          <Link href={isClubLeader ? "/admin/dashboard" : "/admin/login"} className={styles.button}>
            {isClubLeader ? "Club Leader Dashboard" : "Admin Log In"}
          </Link>
        </div>
      </div>
    </section>
  );
}









