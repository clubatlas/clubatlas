'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SelectedClubContextType {
  selectedClubId: string | null;
  setSelectedClubId: (id: string) => void;
}

const SelectedClubContext = createContext<SelectedClubContextType | undefined>(undefined);

export function SelectedClubProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile?.managed_club_ids && userProfile.managed_club_ids.length > 0) {
      setSelectedClubId(prev => prev ?? userProfile.managed_club_ids![0]);
    }
  }, [userProfile]);

  return (
    <SelectedClubContext.Provider value={{ selectedClubId, setSelectedClubId }}>
      {children}
    </SelectedClubContext.Provider>
  );
}

export function useSelectedClub() {
  const context = useContext(SelectedClubContext);
  if (context === undefined) {
    throw new Error('useSelectedClub must be used within SelectedClubProvider');
  }
  return context;
}
