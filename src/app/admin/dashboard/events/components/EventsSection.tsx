'use client';

import { useState, useEffect } from 'react';
import styles from './EventsSection.module.css';
import EventCard from './EventCard';
import CreateEventModal, { EventFormData } from './CreateEventModal';
import EditEventModal from './EditEventModal';
import EventDetailsModal from './EventDetailsModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { getEvents, createEvent, updateEvent, deleteEvent, Event as ApiEvent } from '@/lib/api';

const imgIconAdd = "/images/icons/dashboard/icon-plus.svg";
const imgIconSearch = "/images/icons/dashboard/icon-search.svg";

interface Event {
  id: string;
  title: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  date: string;
  notificationsSent: number;
  attendeesCount: number;
  dateTime?: string;
  location?: string;
  description?: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekly Meeting',
    status: 'upcoming',
    date: 'Mon, Nov 27, 4:00 PM',
    dateTime: '2024-11-27T16:00',
    location: 'Engineering 201',
    description: 'Regular weekly team meeting',
    notificationsSent: 32,
    attendeesCount: 0,
  },
  {
    id: '2',
    title: 'Competition Prep Workshop',
    status: 'upcoming',
    date: 'Wed, Nov 29, 5:00 PM',
    dateTime: '2024-11-29T17:00',
    location: 'Lab 305',
    description: 'Prepare for upcoming robotics competition',
    notificationsSent: 18,
    attendeesCount: 0,
  },
  {
    id: '3',
    title: 'Guest Speaker Event',
    status: 'upcoming',
    date: 'Mon, Dec 4, 4:00 PM',
    dateTime: '2024-12-04T16:00',
    location: 'Main Auditorium',
    description: 'Special guest speaker from industry',
    notificationsSent: 45,
    attendeesCount: 0,
  },
];

export default function EventsSection() {
  const { userProfile } = useAuth();
  const { selectedClubId } = useSelectedClub();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past'>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (selectedClubId) {
      loadEvents();
    }
  }, [selectedClubId]);

  const loadEvents = async () => {
    if (!selectedClubId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getEvents({ club_id: selectedClubId, limit: 100 });

      if (response.data) {
        const now = new Date();
        const mappedEvents: Event[] = response.data.events.map((apiEvent: ApiEvent) => {
          const startDate = new Date(apiEvent.start_datetime);
          const isPast = startDate < now;
          const status = apiEvent.status === 'cancelled' ? 'cancelled'
            : isPast ? 'completed'
            : 'upcoming';
          return {
          id: apiEvent.id || '',
          title: apiEvent.title,
          status,
          date: new Date(apiEvent.start_datetime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          dateTime: new Date(apiEvent.start_datetime).toISOString().slice(0, 16),
          location: apiEvent.location,
          description: apiEvent.description,
          notificationsSent: apiEvent.attendees?.length || 0,
          attendeesCount: apiEvent.attendees?.length || 0,
        };
        });

        setEvents(mappedEvents);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleEventCreate = async (eventData: EventFormData) => {
    if (!selectedClubId) {
      alert('No managed clubs found');
      return;
    }

    try {
      const startDateTime = new Date(eventData.dateTime).toISOString();
      const endDateTime = new Date(new Date(eventData.dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

      const response = await createEvent({
        club_id: selectedClubId,
        title: eventData.title,
        description: eventData.description,
        event_type: 'meeting',
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        location: eventData.location,
      });

      if (response.data) {
        setIsCreateModalOpen(false);
        await loadEvents();
      } else {
        alert(response.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event');
    }
  };

  const handleViewDetails = (event: Event) => {
    setViewingEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setViewingEvent(null);
  };

  const handleDeleteEvent = async (event: Event) => {
    if (!confirm(`Delete event "${event.title}"?`)) return;

    try {
      const response = await deleteEvent(event.id);
      if (response.error) {
        alert(response.error);
      } else {
        await loadEvents();
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventUpdate = async (eventData: EventFormData) => {
    if (!editingEvent) return;

    try {
      const startDateTime = new Date(eventData.dateTime).toISOString();
      const endDateTime = new Date(new Date(eventData.dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString();

      const response = await updateEvent(editingEvent.id, {
        title: eventData.title,
        description: eventData.description,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        location: eventData.location,
      });

      if (response.data) {
        setIsEditModalOpen(false);
        setEditingEvent(null);
        await loadEvents();
      } else {
        alert(response.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Failed to update event:', err);
      alert('Failed to update event');
    }
  };

  const filteredByTab = events.filter(event => {
    const isUpcoming = event.status === 'upcoming';
    return filterTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  const filteredEvents = filteredByTab
    .filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (filterTab === 'past') {
        return new Date(b.dateTime || 0).getTime() - new Date(a.dateTime || 0).getTime();
      }
      return new Date(a.dateTime || 0).getTime() - new Date(b.dateTime || 0).getTime();
    });

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab: 'upcoming' | 'past') => {
    setFilterTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className={styles.eventsSection}>
        <div className={styles.headerRow}>
          <div className={styles.header}>
            <h1 className={styles.title}>Event Management</h1>
            <button onClick={handleCreateEvent} className={styles.createButton}>
              <img src={imgIconAdd} alt="" className={styles.buttonIcon} />
              <span>Create New Event</span>
            </button>
          </div>
          <div className={styles.searchContainer}>
            <div className={styles.searchBox}>
              <img src={imgIconSearch} alt="" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.filterTab} ${filterTab === 'upcoming' ? styles.filterTabActive : ''}`}
                onClick={() => handleTabChange('upcoming')}
              >
                Upcoming
              </button>
              <button
                type="button"
                className={`${styles.filterTab} ${filterTab === 'past' ? styles.filterTabActive : ''}`}
                onClick={() => handleTabChange('past')}
              >
                Past
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading events...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : filteredEvents.length === 0 ? (
          <div className={styles.empty}>
            {searchQuery
              ? 'No events found matching your search'
              : filterTab === 'upcoming'
                ? 'No upcoming events. Create your first event!'
                : 'No past events yet.'}
          </div>
        ) : (
          <>
            <div className={styles.eventsGrid}>
              {paginatedEvents.map((event) => (
                <EventCard key={event.id} event={event} onEdit={handleEditEvent} onDelete={handleDeleteEvent} onViewDetails={handleViewDetails} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onCreateEvent={handleEventCreate}
      />

      <EditEventModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onUpdateEvent={handleEventUpdate}
        eventData={editingEvent ? {
          id: editingEvent.id,
          title: editingEvent.title,
          dateTime: editingEvent.dateTime || '',
          location: editingEvent.location || '',
          description: editingEvent.description || '',
        } : null}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleDetailsModalClose}
        onEdit={handleEditEvent}
        event={viewingEvent}
      />
    </>
  );
}

