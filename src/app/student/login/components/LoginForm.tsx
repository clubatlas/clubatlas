'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './LoginForm.module.css';
import ForgotPasswordModal from './ForgotPasswordModal';
import { signIn, logout } from '@/lib/firebase/auth';
import { useAuth } from '@/contexts/AuthContext';

const arrowIcon = "/images/icons/student-login/arrow.svg";

export default function LoginForm() {
  const router = useRouter();
  const { refreshUserProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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
      const role = token.claims.role as string | undefined;

      // student 롤이고 이메일 미인증 시 로그인 차단
      if (role === 'student' && !userCredential.user.emailVerified) {
        await logout();
        setError('Email verification required. Please check your verification email. (Valid for 1 hour)');
        setLoading(false);
        return;
      }

      // 역할에 따라 리다이렉트
      if (role === 'super-admin') {
        router.push('/superadmin/dashboard');
      } else if (role === 'club-leader' || role === 'admin') {
        router.push('/student/home');
      } else {
        router.push('/student/home');
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

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Sign in to explore clubs and events</p>
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
            placeholder="student@concordacademy.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <p className={styles.hint}>Use your student credentials</p>
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
            src={arrowIcon} 
            alt="arrow"
            className={styles.arrowIcon}
          />
          <span>{loading ? 'Signing in...' : 'Sign In as Student'}</span>
        </button>
      </form>

      <div className={styles.divider}></div>

      <div className={styles.footer}>
        <p className={styles.footerText}>Don&apos;t have an account?</p>
        <Link href="/student/signup" className={styles.signupLink}>
          Create Student Account →
        </Link>
      </div>

      <Link href="/welcome" className={styles.backLink}>
        ← Back to Home
      </Link>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}

