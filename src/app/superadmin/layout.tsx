'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import './superadmin.css';

export default function SuperAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="super-admin">
      {children}
    </ProtectedRoute>
  );
}









