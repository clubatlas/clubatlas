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

    if (requireAuth && !user) {
      const redirect = redirectTo || getDefaultRedirect('login');
      router.push(redirect);
      return;
    }

    if (requiredRole && user && userProfile) {
      const hasRequiredRole = hasRole(requiredRole);

      if (!hasRequiredRole) {
        const redirect = redirectTo || getDefaultRedirect(userProfile.role);
        router.push(redirect);
        return;
      }
    }
  }, [user, userProfile, loading, requiredRole, requireAuth, redirectTo, hasRole, router]);

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

  if (requireAuth && !user) {
    return null;
  }

  if (requiredRole && (!userProfile || !hasRole(requiredRole))) {
    return null;
  }

  return <>{children}</>;
}

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
