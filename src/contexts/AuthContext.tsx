/**
 * 인증 컨텍스트 - 전역 인증 상태 관리
 */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { onAuthChange, getIdToken } from '@/lib/firebase/auth';
import { getCurrentUserProfile, AuthVerifyResponse } from '@/lib/api/auth';

const PROFILE_CACHE_KEY = 'userProfile_cache';

function getCachedProfile(): AuthVerifyResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(PROFILE_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedProfile(profile: AuthVerifyResponse | null): void {
  if (typeof window === 'undefined') return;
  if (profile) {
    sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(PROFILE_CACHE_KEY);
  }
}

interface AuthContextType {
  user: User | null;
  userProfile: AuthVerifyResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isClubLeader: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: string) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const cachedProfile = getCachedProfile();
  const initialUser = auth?.currentUser ?? null;

  const [user, setUser] = useState<User | null>(initialUser);
  const [userProfile, setUserProfile] = useState<AuthVerifyResponse | null>(
    initialUser ? cachedProfile : null
  );
  const [loading, setLoading] = useState(!(initialUser && cachedProfile));

  const refreshUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      setCachedProfile(null);
      return;
    }

    try {
      const token = await getIdToken(true);
      if (!token) {
        setUserProfile(null);
        setCachedProfile(null);
        return;
      }

      const response = await getCurrentUserProfile(token);
      if (response.data) {
        setUserProfile(response.data);
        setCachedProfile(response.data);
      } else {
        setUserProfile(null);
        setCachedProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
      setCachedProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          if (token) {
            const response = await getCurrentUserProfile(token);
            if (response.data) {
              setUserProfile(response.data);
              setCachedProfile(response.data);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          setUserProfile(null);
          setCachedProfile(null);
        }
      } else {
        setUserProfile(null);
        setCachedProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 역할 확인 헬퍼 함수들
  const isAuthenticated = !!user && !!userProfile;
  const isStudent = userProfile?.role === 'student';
  const isClubLeader = userProfile?.role === 'club-leader' || userProfile?.role === 'admin';
  const isSuperAdmin = userProfile?.role === 'super-admin';
  
  const hasRole = (role: string): boolean => {
    if (!userProfile) return false;
    
    // admin과 club-leader는 동의어
    if (role === 'admin' || role === 'club-leader') {
      return userProfile.role === 'admin' || userProfile.role === 'club-leader';
    }
    
    return userProfile.role === role;
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isStudent,
    isClubLeader,
    isSuperAdmin,
    hasRole,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


