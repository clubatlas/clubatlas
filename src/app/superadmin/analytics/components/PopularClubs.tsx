'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './PopularClubs.module.css';

interface Club {
  rank: number;
  club_id: string;
  name: string;
  views: number;
  subscribers: number;
  events: number;
}

interface PopularClubsResponse {
  clubs: Club[];
  total: number;
}

export default function PopularClubs() {
  const { user } = useAuth();
  const [clubsData, setClubsData] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularClubs();
  }, []);

  const loadPopularClubs = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics/popular-clubs?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: PopularClubsResponse = await response.json();
        setClubsData(data.clubs);
      }
    } catch (error) {
      console.error('Failed to load popular clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Popular Clubs</h3>
        <div className={styles.list}>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Popular Clubs</h3>
      <div className={styles.list}>
        {clubsData.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No clubs data available
          </div>
        ) : (
          clubsData.map((club) => (
            <div key={club.rank} className={styles.clubItem}>
              <div className={styles.clubInfo}>
                <div className={styles.clubName}>
                  {club.rank}. {club.name}
                </div>
                <div className={styles.clubStats}>
                  {club.subscribers} subscribers • {club.events} events
                </div>
              </div>
              <div className={styles.views}>
                {club.views} views
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}









