'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './Calendar.module.css';
import CreateEventModal from './components/CreateEventModal';
import EventDetailModal from './components/EventDetailModal';
import WeekView from './components/WeekView';
import Header from '../components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCalendarEvents, Event as ApiEvent } from '@/lib/api';
import { getClub } from '@/lib/api/clubs';

// 로컬 아이콘 경로
const viewModeIcon = "/images/icons/calendar/view-mode.svg";
const monthViewIcon = "/images/icons/calendar/month-view.svg";
const weekViewIcon = "/images/icons/calendar/week-view.svg";
const createIcon = "/images/icons/calendar/create.svg";
const prevArrowIcon = "/images/icons/calendar/arrow-left.svg";
const nextArrowIcon = "/images/icons/calendar/arrow-right.svg";
const upcomingIcon = "/images/icons/calendar/upcoming.svg";

interface CalendarEvent {
  id: string;
  date: number;
  time: string;
  title: string;
  color: string;
  club_id: string;
  club_name?: string;
  banner_url?: string;
  logo_url?: string;
  description: string;
  location: string;
  start_datetime: Date;
  attendees?: string[];
}

interface UpcomingEvent {
  id: string;
  date: string;
  time: string;
  club: string;
  event: string;
  category: string;
  categoryColor: string;
  club_id: string;
  location: string;
}

const categoryColors: { [key: string]: string } = {
  'sports': 'linear-gradient(135deg, #4ec27d 0%, #67b89d 100%)',
  'academic': 'linear-gradient(135deg, #7aa4e5 0%, #7f72e4 100%)',
  'arts': 'linear-gradient(135deg, #a679c6 0%, #db7bb0 100%)',
  'social': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  'default': 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
};

const eventColors = ['#615fff', '#00c950', '#2b7fff', '#ad46ff', '#f59e0b', '#ef4444'];

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, userProfile } = useAuth();

  const isClubLeader = userProfile?.role === 'club-leader' || userProfile?.role === 'admin';

  const pendingEventIdRef = useRef<string | null>(null);

  const getInitialDate = () => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    if (yearParam && monthParam) {
      const y = parseInt(yearParam, 10);
      const m = parseInt(monthParam, 10) - 1; // 1-indexed → 0-indexed
      if (!isNaN(y) && !isNaN(m)) return new Date(y, m, 1);
    }
    return new Date();
  };

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(getInitialDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId) pendingEventIdRef.current = eventId;
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    }
  }, [isAuthenticated, currentDate]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const response = await getMyCalendarEvents({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      if (response.data) {
        const apiEvents = response.data.events;

        const uniqueClubIds = [...new Set(apiEvents.map(e => e.club_id))];
        const clubResults = await Promise.all(
          uniqueClubIds.map(id => getClub(id).catch(() => null))
        );
        const clubMap: Record<string, { name: string; banner_url?: string; logo_url?: string }> = {};
        uniqueClubIds.forEach((id, idx) => {
          const data = clubResults[idx]?.data;
          if (data) {
            clubMap[id] = { name: data.name, banner_url: data.banner_url, logo_url: data.logo_url };
          }
        });

        const calendarEvents: CalendarEvent[] = apiEvents.map((apiEvent: ApiEvent, idx: number) => {
            const startDate = new Date(apiEvent.start_datetime);
            const club = clubMap[apiEvent.club_id];
            return {
              id: apiEvent.id || '',
              date: startDate.getDate(),
              time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }),
              title: apiEvent.title,
              color: eventColors[idx % eventColors.length],
              club_id: apiEvent.club_id,
              club_name: club?.name ?? 'Club',
              banner_url: club?.banner_url,
              logo_url: club?.logo_url,
              description: apiEvent.description,
              location: apiEvent.location,
              start_datetime: startDate,
              attendees: apiEvent.attendees || []
            };
          });

        setEvents(calendarEvents);

        if (pendingEventIdRef.current) {
          const target = calendarEvents.find(e => e.id === pendingEventIdRef.current);
          if (target) {
            pendingEventIdRef.current = null;
            setSelectedEvent(target);
            setIsEventDetailModalOpen(true);
          }
        }

        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const upcoming = calendarEvents
          .filter(event => event.start_datetime >= now && event.start_datetime <= weekLater)
          .slice(0, 5)
          .map(event => ({
            id: event.id,
            date: event.start_datetime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: event.start_datetime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            club: event.club_name || 'Club',
            event: event.title,
            category: 'academic',
            categoryColor: categoryColors['academic'],
            club_id: event.club_id,
            location: event.location
          }));

        setUpcomingEvents(upcoming);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getEventsForDate = (date: number) => {
    return events.filter(event => event.date === date);
  };

  const handleEventClick = (event?: CalendarEvent) => {
    if (event) {
      setSelectedEvent(event);
    }
    setIsEventDetailModalOpen(true);
  };

  const handlePrevMonth = () => {
    if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };


  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Club Calendar</h1>
            <p className={styles.subtitle}>
              Stay updated with all club events and activities
            </p>
          </div>

          <div className={styles.contentGrid}>
            {/* Left Sidebar */}
            <div className={styles.sidebar}>
              {/* View Mode Card */}
              <div className={styles.viewModeCard}>
                <div className={styles.cardHeader}>
                  <img src={viewModeIcon} alt="" width="20" height="20" />
                  <h3>View Mode</h3>
                </div>
                <div className={styles.viewModeButtons}>
                  <button 
                    className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.viewModeButtonActive : ''}`}
                    onClick={() => setViewMode('month')}
                  >
                    <img src={monthViewIcon} alt="" width="16" height="16" />
                    Month View
                  </button>
                  <button 
                    className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.viewModeButtonActive : ''}`}
                    onClick={() => { setViewMode('week'); setCurrentDate(new Date()); }}
                  >
                    <img src={weekViewIcon} alt="" width="16" height="16" />
                    Week View
                  </button>
                  {isClubLeader && (
                    <button className={styles.createButton} onClick={() => setIsModalOpen(true)}>
                      <img src={createIcon} alt="" width="20" height="20" />
                      Create
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Main Calendar Area */}
            <div className={styles.calendarArea}>
              {/* Month Navigation */}
              <div className={styles.monthNavigation}>
                <button className={styles.navButton} onClick={handlePrevMonth}>
                  <img src={prevArrowIcon} alt="Previous" width="24" height="24" />
                </button>
                <h2 className={styles.monthTitle}>{monthName}</h2>
                <button className={styles.navButton} onClick={handleNextMonth}>
                  <img src={nextArrowIcon} alt="Next" width="24" height="24" />
                </button>
              </div>

              {isLoading ? (
                <div className={styles.loading}>Loading calendar events...</div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : (
                <>
                  {/* Calendar Grid - Conditional Rendering */}
                  {viewMode === 'month' ? (
                    <div className={styles.calendarCard}>
                      <div className={styles.calendarHeader}>
                        {daysOfWeek.map(day => (
                          <div key={day} className={styles.dayHeader}>{day}</div>
                        ))}
                      </div>
                      <div className={styles.calendarBody}>
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                          <div key={`empty-${idx}`} className={`${styles.calendarDay} ${styles.otherMonth}`} />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(date => {
                          const dayEvents = getEventsForDate(date);
                          const today = new Date();
                          const isToday = date === today.getDate() && 
                                          month === today.getMonth() && 
                                          year === today.getFullYear();
                          
                          return (
                            <div 
                              key={date} 
                              className={styles.calendarDay}
                            >
                              {isToday ? (
                                <div className={styles.todayBadge}>{date}</div>
                              ) : (
                                <span className={styles.dayNumber}>{date}</span>
                              )}
                              <div className={styles.eventsContainer}>
                                {dayEvents.slice(0, 3).map((event) => (
                                  <div 
                                    key={event.id} 
                                    className={styles.eventTag}
                                    style={{ backgroundColor: event.color }}
                                    onClick={() => handleEventClick(event)}
                                  >
                                    {event.club_name ? `${event.club_name} - ${event.title}` : event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 3 && (
                                  <div className={styles.moreEvents}>
                                    +{dayEvents.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <WeekView 
                      onEventClick={handleEventClick} 
                      currentDate={currentDate}
                      events={events}
                    />
                  )}
                </>
              )}

              {/* Upcoming Events */}
              {!isLoading && !error && (
                <div className={styles.upcomingCard}>
                  <div className={styles.upcomingHeader}>
                    <img src={upcomingIcon} alt="" width="24" height="24" />
                    <h3>Upcoming This Week</h3>
                  </div>
                  {upcomingEvents.length === 0 ? (
                    <div className={styles.emptyUpcoming}>
                      No upcoming events this week. Check out clubs to find events!
                    </div>
                  ) : (
                    <div className={styles.upcomingList}>
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className={styles.upcomingItem}>
                          <div 
                            className={styles.eventBar}
                            style={{ background: event.categoryColor }}
                          />
                          <div className={styles.eventInfo}>
                            <div className={styles.eventDateTime}>
                              <span className={styles.eventDate}>{event.date}</span>
                              <span className={styles.eventTime}>{event.time}</span>
                              <div
                                className={styles.categoryBadge}
                                style={{ background: event.categoryColor }}
                              >
                                {event.category}
                              </div>
                            </div>
                            <h4 className={styles.eventClub}>{event.club}</h4>
                            <p className={styles.eventName}>{event.event}</p>
                            <p className={styles.eventLocation}>📍 {event.location}</p>
                          </div>
                          <Link href={`/student/home/clubs/${event.club_id}`} className={styles.viewClubButton}>
                            View Club
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 Concord Academy ClubAtlas. Connecting students with their perfect campus communities.</p>
        </div>
      </footer>

      {/* Create Event Modal */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(eventDate) => {
          setCurrentDate(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
        }}
      />

      {/* Event Detail Modal */}
      {isEventDetailModalOpen && selectedEvent && (
        <EventDetailModal 
          onClose={() => {
            setIsEventDetailModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
        />
      )}
    </div>
  );
}

