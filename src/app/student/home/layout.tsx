'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}









