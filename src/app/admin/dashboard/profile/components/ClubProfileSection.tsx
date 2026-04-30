'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ClubProfileSection.module.css';
import { getClub, Club, ClubLeader } from '@/lib/api/clubs';
import { getEvents, Event as ApiEvent } from '@/lib/api/events';
import { useSelectedClub } from '@/contexts/SelectedClubContext';

const imgIconEdit = "/images/icons/dashboard/edit-pencil.svg";
const imgIconLogoPlaceholder = "/images/icons/dashboard/logo-placeholder.svg";

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ClubProfileSection() {
  const { selectedClubId } = useSelectedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClubId) {
      loadData();
    }
  }, [selectedClubId]);

  const loadData = async () => {
    if (!selectedClubId) {
      setClub(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getClub(selectedClubId);

      if (response.data) {
        setClub(response.data);
        const eventsRes = await getEvents({
          club_id: response.data.id,
          status_filter: 'active',
          limit: 10
        });
        if (eventsRes.data) {
          const now = new Date();
          const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const upcoming = eventsRes.data.events.filter((e) => {
            const d = new Date(e.start_datetime);
            return d >= now && d <= weekLater;
          });
          setUpcomingEvents(upcoming.slice(0, 3));
        }
      } else {
        setError(response.error || 'Failed to load club profile');
      }
    } catch (err) {
      console.error('Failed to load club:', err);
      setError('Failed to load club profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.profileSection}>
        <div className={styles.loading}>Loading club profile...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className={styles.profileSection}>
        <div className={styles.error}>{error || 'No club data available'}</div>
      </div>
    );
  }

  const schedule = club.meeting_schedule;
  const abbreviateDay = (d: string) =>
    d.slice(0, 3).replace(/^./, (c) => c.toUpperCase());
  const meetingDay = schedule?.length
    ? [...new Set(schedule.map((s) => s.day).filter(Boolean))]
        .map(abbreviateDay)
        .join(', ')
    : 'Not set';
  const meetingTime = schedule?.length
    ? [...new Set(schedule.flatMap((s) => s.time_slots || []).filter(Boolean))].join(', ')
    : 'Not set';
  const location = schedule?.[0]?.location || 'Not set';
  const leaders = club.leaders ?? [];
  const mediaUrls = club.media_urls ?? [];
  const displayEvents = upcomingEvents.slice(0, 3);

  return (
    <div className={styles.profileSection}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Club Profile Management</h2>
        <Link href="/admin/dashboard/profile/edit" className={styles.editButton}>
          <img src={imgIconEdit} alt="" className={styles.buttonIcon} />
          <span className={styles.buttonText}>Edit Mode</span>
        </Link>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Current Profile Preview</h3>
        <div className={styles.imagesSection}>
          <div className={styles.logoSection}>
            <p className={styles.label}>Club Logo</p>
            <div className={styles.logoContainer}>
              {club.logo_url ? (
                <img src={club.logo_url} alt="Club Logo" className={styles.logoImage} />
              ) : (
                <img src={imgIconLogoPlaceholder} alt="No Logo" className={styles.logoIcon} />
              )}
            </div>
          </div>
          <div className={styles.coverSection}>
            <p className={styles.label}>Cover Image</p>
            <div className={styles.coverContainer}>
              {club.banner_url && (
                <img src={club.banner_url} alt="Banner" className={styles.bannerImage} />
              )}
            </div>
          </div>
        </div>
        <div className={styles.fieldsSection}>
          <div className={styles.fieldGroup}>
            <p className={styles.label}>Club Name *</p>
            <div className={styles.fieldValue}>
              <p className={styles.fieldText}>{club.name}</p>
            </div>
          </div>
          {club.tagline && (
            <div className={styles.fieldGroup}>
              <p className={styles.label}>Tagline</p>
              <div className={styles.fieldValue}>
                <p className={styles.fieldText}>{club.tagline}</p>
              </div>
            </div>
          )}
          <div className={styles.fieldGroupLarge}>
            <p className={styles.label}>Mission Statement *</p>
            <div className={styles.fieldValueLarge}>
              <p className={styles.fieldText}>{club.description}</p>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <p className={styles.label}>Activity Types *</p>
            <div className={styles.fieldValue}>
              <p className={styles.fieldText}>
                {club.activity_type && club.activity_type.length > 0
                  ? Array.isArray(club.activity_type)
                    ? club.activity_type.join(', ')
                    : String(club.activity_type)
                  : 'Not set'}
              </p>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <p className={styles.label}>Categories *</p>
            <div className={styles.fieldValue}>
              <p className={styles.fieldText}>
                {club.categories?.length ? club.categories.join(', ') : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Meeting Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Meeting Day</p>
            <p className={styles.infoValue}>{meetingDay}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Meeting Time</p>
            <p className={styles.infoValue}>{meetingTime}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Location</p>
            <p className={styles.infoValue}>{location}</p>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Contact Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Email</p>
            <p className={styles.infoValue}>{club.contact_email || 'Not set'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Website</p>
            <p className={styles.infoValue}>{club.website || 'Not set'}</p>
          </div>
          <div className={styles.infoItem}>
            <p className={styles.infoLabel}>Social Media</p>
            <p className={styles.infoValue}>{club.social_media || 'Not set'}</p>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Leadership Team</h3>
        {leaders.length === 0 ? (
          <p className={styles.emptyText}>No leadership team added</p>
        ) : (
          <div className={styles.leadersGrid}>
            {leaders.map((leader: ClubLeader) => (
              <div key={leader.uid} className={styles.leaderCard}>
                <div className={styles.avatar}>
                  {leader.avatar_url ? (
                    <img src={leader.avatar_url} alt={leader.name} className={styles.avatarImage} />
                  ) : (
                    <span className={styles.avatarText}>{getInitials(leader.name)}</span>
                  )}
                </div>
                <div className={styles.leaderInfo}>
                  <p className={styles.leaderName}>{leader.name}</p>
                  <p className={styles.leaderRole}>{leader.role}</p>
                  {leader.email && (
                    <p className={styles.leaderEmail}>{leader.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h3 className={styles.sectionTitle}>Photo Gallery</h3>
        <div className={styles.galleryGrid}>
          {Array.from({ length: 6 }).map((_, i) =>
            mediaUrls[i] ? (
              <div key={i} className={styles.gallerySlot}>
                <img src={mediaUrls[i]} alt="" className={styles.galleryImage} />
              </div>
            ) : (
              <div key={i} className={styles.gallerySlotEmpty} />
            )
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.eventsHeader}>
          <h3 className={styles.sectionTitle}>Upcoming Event</h3>
          <Link href="/admin/dashboard/events" className={styles.viewAllLink}>
            View All →
          </Link>
        </div>
        {displayEvents.length === 0 ? (
          <p className={styles.emptyText}>No upcoming events in the next 7 days</p>
        ) : (
          <div className={styles.eventsList}>
            {displayEvents.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <span className={styles.upcomingTag}>UPCOMING</span>
                </div>
                <p className={styles.eventDate}>
                  {new Date(event.start_datetime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className={styles.eventNotifications}>
                  {event.attendees?.length || 0} email notifications sent
                </p>
                <div className={styles.eventActions}>
                  <Link href={`/admin/dashboard/events`} className={styles.eventLink}>
                    View Details
                  </Link>
                  <Link href={`/admin/dashboard/events`} className={styles.eventLink}>
                    Send Reminder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
