'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLoginForm.module.css';
import ForgotPasswordModal from '../../../student/login/components/ForgotPasswordModal';
import CreateClubModal from './CreateClubModal';
import { signIn } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

type AdminRole = 'club-leader' | 'super-admin';

interface AdminLoginFormProps {
  role: AdminRole;
  onRoleChange: (role: AdminRole) => void;
}

export default function AdminLoginForm({ role, onRoleChange }: AdminLoginFormProps) {
  const router = useRouter();
  const { refreshUserProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Firebase 로그인
      const userCredential = await signIn(email, password);
      
      // 사용자 프로필 새로고침
      await refreshUserProfile();
      
      // ID 토큰 가져오기
      const token = await userCredential.user.getIdTokenResult();
      const userRole = token.claims.role as string | undefined;
      
      // 역할 확인
      if (role === 'super-admin') {
        if (userRole !== 'super-admin') {
          setError('You do not have Super Admin privileges. Please check your role.');
          setLoading(false);
          return;
        }
        router.push('/superadmin/dashboard');
      } else {
        // club-leader 또는 admin
        if (userRole !== 'club-leader' && userRole !== 'admin' && userRole !== 'super-admin') {
          setError('You do not have Club Leader privileges. Please request access.');
          setLoading(false);
          return;
        }
        
        // Super Admin은 admin 대시보드에도 접근 가능
        if (userRole === 'super-admin') {
          router.push('/superadmin/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Firebase 에러 메시지 처리
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact an administrator.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const isSuperAdmin = role === 'super-admin';

  return (
    <div className={`${styles.panel} ${isSuperAdmin ? styles.panelSuperAdmin : styles.panelClubLeader}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>
          {isSuperAdmin ? 'Sign in as Super Admin' : 'Sign in to access your club dashboard'}
        </p>
      </div>

      {/* 역할 선택 버튼 */}
      <div className={styles.roleSelectorWrapper}>
      <div className={styles.roleSelector}>
        <button
          type="button"
          onClick={() => onRoleChange('club-leader')}
          className={`${styles.roleButton} ${role === 'club-leader' ? styles.roleButtonActive : ''}`}
        >
          Club Leader
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('super-admin')}
          className={`${styles.roleButton} ${role === 'super-admin' ? styles.roleButtonActive : ''}`}
        >
          Super Admin
        </button>
      </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#c33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <div className={styles.fieldGroup}>
          <label htmlFor="email" className={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="leader@concordacademy.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <p className={styles.hint}>
            {isSuperAdmin ? 'Use your admin credentials' : 'Use your club leader credentials'}
          </p>
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setIsForgotPasswordOpen(true)}
            className={styles.forgotLink}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          <img 
            src="/images/icons/student-login/arrow.svg"
            alt="arrow"
            className={styles.arrowIcon}
          />
          <span>
            {loading 
              ? 'Signing in...' 
              : isSuperAdmin ? 'Sign In as Super Admin' : 'Sign In to Dashboard'
            }
          </span>
        </button>
      </form>

      <div className={styles.divider}></div>

      {!isSuperAdmin && (
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.requestLink}
            onClick={() => setIsCreateClubModalOpen(true)}
          >
            Create a New Club →
          </button>
          <Link href="/admin/request-access" className={styles.requestLink}>
            Request Leader Access →
          </Link>
        </div>
      )}

      <Link href="/welcome" className={styles.backLink}>
        ← Back to Home
      </Link>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      {isCreateClubModalOpen && (
        <CreateClubModal onClose={() => setIsCreateClubModalOpen(false)} />
      )}
    </div>
  );
}

