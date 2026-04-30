'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './EventsSection.module.css';
import EventCard from './EventCard';
import EventDetailModal from '../calendar/components/EventDetailModal';
import { getEvents, Event } from '@/lib/api/events';
import { getClub } from '@/lib/api/clubs';

const arrowIcon = "/images/icons/arrow-right-green.svg";

const dateColors = [
  'linear-gradient(132.27deg, rgba(219, 234, 254, 1) 0%, rgba(190, 219, 255, 1) 100%)',
  'transparent',
  'linear-gradient(132.27deg, rgba(220, 252, 231, 1) 0%, rgba(0, 0, 0, 0) 100%)',
  'linear-gradient(132.27deg, rgba(252, 231, 243, 1) 0%, rgba(252, 206, 232, 1) 100%)',
];

const eventColors = ['#615fff', '#00c950', '#2b7fff', '#ad46ff'];

interface HomeEvent {
  id: string;
  day: string;
  date: string;
  dateColor: string;
  time: string;
  clubName: string;
  eventType: string;
  description: string;
  location: string;
  startDatetime: Date;
  clubId: string;
  color: string;
  attendees: string[];
}

interface CalendarEvent {
  id: string;
  date: number;
  time: string;
  title: string;
  color: string;
  club_id: string;
  club_name?: string;
  description: string;
  location: string;
  start_datetime: Date;
  attendees?: string[];
}

export default function EventsSection() {
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    loadThisWeeksEvents();
  }, []);

  const handleDetailsClick = (event: HomeEvent) => {
    setSelectedEvent({
      id: event.id,
      date: event.startDatetime.getDate(),
      time: event.time,
      title: event.eventType,
      color: event.color,
      club_id: event.clubId,
      club_name: event.clubName,
      description: event.description,
      location: event.location,
      start_datetime: event.startDatetime,
      attendees: event.attendees,
    });
  };

  const loadThisWeeksEvents = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const response = await getEvents({
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString(),
        limit: 50
      });

      if (response.data && !response.error) {
        const upcomingEvents = response.data.events
          .filter(event => new Date(event.start_datetime) >= now)
          .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
          .slice(0, 4);

        const eventsWithClubs = await Promise.all(
          upcomingEvents.map(async (event: Event, index: number) => {
            const clubResponse = await getClub(event.club_id);
            const clubName = clubResponse.data?.name || 'Unknown Club';
            
            const eventDate = new Date(event.start_datetime);
            const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dateNum = eventDate.getDate().toString();
            const time = eventDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });

            return {
              id: event.id as string,
              day: dayName,
              date: dateNum,
              dateColor: dateColors[index % dateColors.length],
              time: time,
              clubName: clubName,
              eventType: event.title,
              description: event.description,
              location: event.location,
              startDatetime: eventDate,
              clubId: event.club_id,
              color: eventColors[index % eventColors.length],
              attendees: event.attendees || [],
            };
          })
        );

        setEvents(eventsWithClubs);
      }
    } catch (err) {
      console.error('Failed to load this week\'s events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>This Week&apos;s Events</h2>
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
          <h2 className={styles.title}>This Week&apos;s Events</h2>
          <Link href="/student/home/calendar" className={styles.viewAllButton}>
            <span>Full Calendar</span>
            <img src={arrowIcon} alt="" />
          </Link>
        </div>
        
        {events.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
            No upcoming events this week.
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDetailsClick={() => handleDetailsClick(event)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
}





