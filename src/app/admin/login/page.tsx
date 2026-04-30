'use client';

import { useState } from 'react';
import styles from './AdminLogin.module.css';
import Logo from '../../welcome/components/Logo';
import AdminInfoPanel from './components/AdminInfoPanel';
import AdminLoginForm from './components/AdminLoginForm';

type AdminRole = 'club-leader' | 'super-admin';

export default function AdminLoginPage() {
  const [role, setRole] = useState<AdminRole>('club-leader');

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
          <AdminInfoPanel role={role} />
          <AdminLoginForm role={role} onRoleChange={setRole} />
        </div>
      </div>
    </div>
  );
}

