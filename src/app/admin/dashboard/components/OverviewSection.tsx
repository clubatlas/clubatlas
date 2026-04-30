'use client';

import { useState, useEffect } from 'react';
import styles from './OverviewSection.module.css';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions';
import UpcomingEvents from './UpcomingEvents';
import CreateEventModal, { EventFormData } from '../events/components/CreateEventModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { getClub, Club } from '@/lib/api/clubs';
import { getClubSubscribers, Subscriber } from '@/lib/api/subscriptions';
import { getEvents, createEvent, Event } from '@/lib/api/events';
import { getAnnouncements, Announcement } from '@/lib/api/announcements';

export default function OverviewSection() {
  const { userProfile } = useAuth();
  const { selectedClubId } = useSelectedClub();
  const [club, setClub] = useState<Club | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (selectedClubId) {
      loadDashboardData();
    }
  }, [selectedClubId]);

  const loadDashboardData = async () => {
    if (!selectedClubId) return;

    try {
      setIsLoading(true);
      setError(null);

      const clubResponse = await getClub(selectedClubId);
      if (!clubResponse.data) {
        setError('No managed club found');
        return;
      }

      const clubData = clubResponse.data;
      setClub(clubData);

      const [subscribersRes, eventsRes, announcementsRes] = await Promise.all([
        getClubSubscribers(clubData.id),
        getEvents({ 
          club_id: clubData.id, 
          status_filter: 'active',
          limit: 50 
        }),
        getAnnouncements({ 
          club_id: clubData.id, 
          status_filter: 'active',
          limit: 10 
        })
      ]);

      if (subscribersRes.data) {
        setSubscribers(subscribersRes.data.subscribers);
      }

      if (eventsRes.data) {
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = eventsRes.data.events.filter(event => {
          const eventDate = new Date(event.start_datetime);
          return eventDate >= now && eventDate <= weekLater;
        });
        setUpcomingEvents(upcoming);
      }

      if (announcementsRes.data) {
        setAnnouncements(announcementsRes.data.announcements);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCreate = async (eventData: EventFormData) => {
    if (!club) return;
    try {
      const startDateTime = new Date(eventData.dateTime).toISOString();
      const endDateTime = new Date(new Date(eventData.dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();
      const response = await createEvent({
        club_id: club.id,
        title: eventData.title,
        description: eventData.description,
        event_type: 'meeting',
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        location: eventData.location,
      });
      if (response.data) {
        setIsCreateModalOpen(false);
        await loadDashboardData();
      } else {
        alert(response.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event');
    }
  };

  const totalSubscribers = subscribers.length;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyNewSubscribers = subscribers.filter(sub => {
    const subDate = new Date(sub.subscribed_at);
    return subDate >= weekAgo;
  }).length;

  const profileViews = club?.stats?.view_count || 0;
  
  const totalAnnouncements = announcements.length;
  const totalOpens = announcements.reduce((sum, ann) => sum + (ann.opens || 0), 0);
  const engagementRate = totalAnnouncements > 0 && totalSubscribers > 0
    ? Math.round((totalOpens / (totalAnnouncements * totalSubscribers)) * 100)
    : 0;

  const thisWeekEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.start_datetime);
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= threeDaysLater;
  }).length;

  if (isLoading) {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className={styles.overviewSection}>
        <div className={styles.error}>{error || 'No club data available'}</div>
      </div>
    );
  }

  return (
    <div className={styles.overviewSection}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>Welcome back, {userProfile?.display_name || 'Admin'}!</h2>
        <p className={styles.welcomeSubtitle}>
          Here's what's happening with {club.name}
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon="/images/icons/dashboard/stat-subscribers.svg"
          iconBg="#dbeafe"
          value={totalSubscribers.toString()}
          label="Total Subscribers"
          change={weeklyNewSubscribers > 0 ? `+${weeklyNewSubscribers} this week` : 'No new this week'}
          changePositive={weeklyNewSubscribers > 0}
        />
        <StatCard
          icon="/images/icons/dashboard/nav-events.svg"
          iconBg="#f3e8ff"
          value={upcomingEvents.length.toString()}
          label="Upcoming Events"
          change={thisWeekEvents > 0 ? `${thisWeekEvents} this week` : 'None this week'}
          changePositive={thisWeekEvents > 0}
        />
      </div>

      <div className={styles.contentGrid}>
        <RecentActivity 
          subscribers={subscribers}
          events={upcomingEvents}
          announcements={announcements}
        />
        <QuickActions onCreateEvent={() => setIsCreateModalOpen(true)} />
      </div>

      <UpcomingEvents events={upcomingEvents} clubId={club.id} />

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateEvent={handleEventCreate}
      />
    </div>
  );
}










