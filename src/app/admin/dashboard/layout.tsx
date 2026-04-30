'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { SelectedClubProvider } from '@/contexts/SelectedClubContext';

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole="club-leader">
      <SelectedClubProvider>
        <div className="admin-layout">
          {children}
        </div>
      </SelectedClubProvider>
    </ProtectedRoute>
  );
}


