'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, EventCreate } from '@/lib/api/events';
import { getClub, Club } from '@/lib/api/clubs';
import styles from './CreateEventModal.module.css';
import DatePicker from './DatePicker';

const modalIconPlus = "/images/icons/calendar/create.svg";
const closeIcon = "/images/icons/calendar/close.svg";
const calendarIconDate = "/images/icons/calendar/calendar-date.svg";
const locationIcon = "/images/icons/calendar/location.svg";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (eventDate: Date) => void;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const { userProfile } = useAuth();
  const [eventTitle, setEventTitle] = useState('');
  const [clubId, setClubId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dateInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userProfile?.managed_club_ids && userProfile.managed_club_ids.length > 0) {
      loadManagedClubs();
    }
  }, [isOpen, userProfile]);

  const loadManagedClubs = async () => {
    if (!userProfile?.managed_club_ids) return;

    try {
      const clubPromises = userProfile.managed_club_ids.map(id => getClub(id));
      const clubResponses = await Promise.all(clubPromises);
      const clubs = clubResponses
        .filter(res => !res.error && res.data)
        .map(res => res.data!);
      setManagedClubs(clubs);
      
      if (clubs.length > 0) {
        setClubId(clubs[0].id || '');
      }
    } catch (err) {
      console.error('Failed to load managed clubs:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const [month, day, year] = date.split('/');
      const startDatetime = new Date(`${year}-${month}-${day}T${startTime}`);
      const endDatetime = new Date(`${year}-${month}-${day}T${endTime}`);

      const eventData: EventCreate = {
        club_id: clubId,
        title: eventTitle,
        description: description,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        location: location,
        event_type: 'meeting'
      };

      const response = await createEvent(eventData);

      if (response.error) {
        throw new Error(response.error);
      }

      setEventTitle('');
      setClubId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setDescription('');
      
      onClose();
      if (onSuccess) {
        onSuccess(startDatetime);
      }
    } catch (err) {
      console.error('Create event error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.iconWrapper}>
                <img src={modalIconPlus} alt="" width="24" height="24" />
              </div>
              <div className={styles.headerText}>
                <h2 className={styles.modalTitle}>Create New Event</h2>
                <p className={styles.modalSubtitle}>Add a new club event to the calendar</p>
              </div>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <img src={closeIcon} alt="" width="20" height="20" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Event Title */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Event Title *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., Weekly Team Meeting"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Club */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Club *</label>
              <select
                className={styles.select}
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="">Select a club...</option>
                {managedClubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date, Start Time, End Time */}
            <div className={styles.timeGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date *</label>
                <div className={styles.dateInputWrapper} ref={dateInputRef}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="mm/dd/yyyy"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onClick={() => !isLoading && setShowDatePicker(!showDatePicker)}
                    readOnly
                    disabled={isLoading}
                    required
                  />
                  <img src={calendarIconDate} alt="" width="16" height="16" className={styles.dateIcon} />
                  {showDatePicker && !isLoading && (
                    <DatePicker
                      selectedDate={date}
                      onDateSelect={setDate}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Time *</label>
                <input
                  type="time"
                  className={styles.input}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>End Time *</label>
                <input
                  type="time"
                  className={styles.input}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Location *</label>
              <div className={styles.locationInputWrapper}>
                <img src={locationIcon} alt="" width="20" height="20" className={styles.locationIcon} />
                <input
                  type="text"
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  placeholder="e.g., Engineering Lab 201"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Description *</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe your event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className={styles.footer}>
            <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.createButton} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

