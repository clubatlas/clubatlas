'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FeaturedClubs.module.css';
import ClubCard from './ClubCard';
import { getClubs, Club } from '@/lib/api/clubs';

const arrowIcon = "/images/icons/arrow-right-green.svg";

function getDayName(day?: string): string {
  const days: { [key: string]: string } = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday'
  };
  return day ? days[day.toLowerCase()] || day : '';
}

export default function FeaturedClubs() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedClubs();
  }, []);

  const loadFeaturedClubs = async () => {
    setLoading(true);
    try {
      const response = await getClubs({ page_size: 50 });

      if (response.data && !response.error) {
        const sortedClubs = [...response.data.clubs].sort((a, b) => 
          (b.stats?.total_subscribers || 0) - (a.stats?.total_subscribers || 0)
        );

        const featured = sortedClubs.slice(0, 3).map((club: Club) => {
          const dayName = getDayName(club.meeting_schedule?.[0]?.day);
          const timeSlot = club.meeting_schedule?.[0]?.time_slots?.[0] || '';
          const schedule = dayName && timeSlot 
            ? `Every ${dayName} ${timeSlot}` 
            : 'Schedule TBA';

          return {
            id: club.id,
            name: club.name,
            description: club.description,
            category: club.categories?.[0] || 'General',
            categoryColor: 'rgba(255, 255, 255, 0.9)',
            image: club.logo_url || '/default-club-logo.png',
            schedule: schedule,
            members: `${club.stats?.total_subscribers || 0}+ members`,
          };
        });

        setClubs(featured);
      }
    } catch (err) {
      console.error('Failed to load featured clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Clubs</h2>
          </div>
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Featured Clubs</h2>
          <Link href="/student/home/clubs" className={styles.viewAllButton}>
            <span>View All</span>
            <img src={arrowIcon} alt="" />
          </Link>
        </div>
        
        {clubs.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
            No featured clubs available.
          </div>
        ) : (
          <div className={styles.clubsGrid}>
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}





