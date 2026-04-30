/**
 * 보호된 라우트 컴포넌트
 * 인증 및 역할 기반 접근 제어
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'club-leader' | 'admin' | 'super-admin';
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, userProfile, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 인증 필요한데 로그인 안 됨
    if (requireAuth && !user) {
      const redirect = redirectTo || getDefaultRedirect('login');
      router.push(redirect);
      return;
    }

    // 역할 확인
    if (requiredRole && user && userProfile) {
      const hasRequiredRole = hasRole(requiredRole);
      
      if (!hasRequiredRole) {
        // 권한 부족 - 적절한 페이지로 리다이렉트
        const redirect = redirectTo || getDefaultRedirect(userProfile.role);
        router.push(redirect);
        return;
      }
    }
  }, [user, userProfile, loading, requiredRole, requireAuth, redirectTo, hasRole, router]);

  // 로딩 중
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // 인증 필요한데 로그인 안 됨
  if (requireAuth && !user) {
    return null;
  }

  // 역할 확인 필요
  if (requiredRole && (!userProfile || !hasRole(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}

/**
 * 역할별 기본 리다이렉트 경로
 */
function getDefaultRedirect(type: string): string {
  switch (type) {
    case 'student':
      return '/student/home';
    case 'club-leader':
    case 'admin':
      return '/admin/dashboard';
    case 'super-admin':
      return '/superadmin/dashboard';
    case 'login':
      return '/student/login';
    default:
      return '/welcome';
  }
}


