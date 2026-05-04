'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './EventDetailModal.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { attendEvent, cancelAttendance } from '@/lib/api/events';
import { subscribeToClub, unsubscribeFromClub, checkSubscription } from '@/lib/api/subscriptions';

const closeIcon = "/images/icons/calendar/close.svg";
const clockIcon = "/images/icons/calendar/clock.svg";
const locationIcon = "/images/icons/calendar/location2.svg";
const usersIcon = "/images/icons/calendar/users.svg";
const attendanceIcon = "/images/icons/calendar/attendance.svg";
const bellIcon = "/images/icons/calendar/bell.svg";


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

interface EventDetailModalProps {
  onClose: () => void;
  event: CalendarEvent;
}

export default function EventDetailModal({ onClose, event }: EventDetailModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [attendanceStatus, setAttendanceStatus] = useState<'planning' | 'checked-in' | 'cannot'>('cannot');
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const isPast = event.start_datetime < new Date();

  useEffect(() => {
    if (user && event.attendees?.includes(user.uid)) {
      setAttendanceStatus('planning');
    } else {
      setAttendanceStatus('cannot');
    }
  }, [event.id, user]);

  useEffect(() => {
    if (!user) return;
    checkSubscription(event.club_id).then((res) => {
      if (res.data) {
        setIsSubscribed(res.data.is_subscribed);
      }
    });
  }, [event.club_id, user]);

  const handleSubscribeToggle = async () => {
    if (isSubscribing) return;
    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        const res = await unsubscribeFromClub(event.club_id);
        if (!res.error) {
          setIsSubscribed(false);
        }
      } else {
        const res = await subscribeToClub(event.club_id);
        if (!res.error) {
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle subscription:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleAttendanceChange = async (status: 'planning' | 'checked-in' | 'cannot') => {
    if (isPast) return;
    const prev = attendanceStatus;
    setAttendanceStatus(status);

    try {
      if (status === 'planning' && prev !== 'planning') {
        await attendEvent(event.id);
      } else if (status === 'cannot' && prev === 'planning') {
        await cancelAttendance(event.id);
      }
    } catch (err) {
      console.error('Failed to update attendance:', err);
      setAttendanceStatus(prev);
      return;
    }

    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageHeader}>
          {(event.banner_url || event.logo_url) && (
            <img
              src={event.banner_url || event.logo_url}
              alt={event.club_name || 'Club'}
              className={styles.headerImage}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className={styles.imageOverlay} />
          <button className={styles.closeButton} onClick={onClose}>
            <img src={closeIcon} alt="Close" />
          </button>
          <div className={styles.categoryTag}>
            Academic
          </div>
        </div>

        <div className={styles.contentSection}>
          <h1 className={styles.eventTitle}>{event.title}</h1>
          {event.club_name && (
            <button
              className={styles.relatedLink}
              onClick={() => router.push(`/student/home/clubs/${event.club_id}`)}
            >
              {event.club_name} →
            </button>
          )}

          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon} style={{ background: 'linear-gradient(135deg, #ffe2e2 0%, #ffedd4 100%)' }}>
                <img src={clockIcon} alt="Time" />
              </div>
              <div className={styles.infoText}>
                <div className={styles.infoLabel}>Time</div>
                <div className={styles.infoValue}>
                  {event.start_datetime.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon} style={{ background: 'linear-gradient(135deg, #ffedd4 0%, #ffe2e2 100%)' }}>
                <img src={locationIcon} alt="Location" />
              </div>
              <div className={styles.infoText}>
                <div className={styles.infoLabel}>Location</div>
                <div className={styles.infoValue}>{event.location}</div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon} style={{ background: 'linear-gradient(135deg, #ffe2e2 0%, #fce7f3 100%)' }}>
                <img src={usersIcon} alt="Attendees" />
              </div>
              <div className={styles.infoText}>
                <div className={styles.infoLabel}>Attendees</div>
                <div className={styles.infoValue}>Check attendance status</div>
              </div>
            </div>
          </div>

          {/* About this event */}
          <div className={styles.aboutSection}>
            <h3 className={styles.sectionTitle}>About this event</h3>
            <p className={styles.description}>{event.description}</p>
          </div>

          {/* Your Attendance */}
          <div className={styles.attendanceSection}>
            <h3 className={styles.sectionTitleWithIcon}>
              <img src={attendanceIcon} alt="Attendance" className={styles.titleIcon} />
              Your Attendance
            </h3>

            {isPast && (
              <div className={styles.pastNotice}>
                This event has already ended. Attendance can no longer be changed.
              </div>
            )}

            <div className={`${styles.attendanceOptions} ${isPast ? styles.attendanceDisabled : ''}`}>
              <label className={`${styles.radioOption} ${attendanceStatus === 'planning' ? styles.selected : ''} ${isPast ? styles.radioOptionDisabled : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="planning"
                  checked={attendanceStatus === 'planning'}
                  onChange={() => handleAttendanceChange('planning')}
                  className={styles.radioInput}
                  disabled={isPast}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Planning to Attend</div>
                  <div className={styles.radioDescription}>I'm interested and planning to join</div>
                </div>
              </label>

              <label className={`${styles.radioOption} ${attendanceStatus === 'checked-in' ? styles.selected : ''} ${isPast ? styles.radioOptionDisabled : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="checked-in"
                  checked={attendanceStatus === 'checked-in'}
                  onChange={() => handleAttendanceChange('checked-in')}
                  className={styles.radioInput}
                  disabled={isPast}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>
                    Checked In
                    {attendanceStatus === 'checked-in' && <span className={styles.checkmark}> ✓</span>}
                  </div>
                  <div className={styles.radioDescription}>I attended this event</div>
                </div>
              </label>

              <label className={`${styles.radioOption} ${attendanceStatus === 'cannot' ? styles.selected : ''} ${isPast ? styles.radioOptionDisabled : ''}`}>
                <input
                  type="radio"
                  name="attendance"
                  value="cannot"
                  checked={attendanceStatus === 'cannot'}
                  onChange={() => handleAttendanceChange('cannot')}
                  className={styles.radioInput}
                  disabled={isPast}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioTitle}>Cannot Attend</div>
                  <div className={styles.radioDescription}>I won't be able to make it</div>
                </div>
              </label>
            </div>

            {showSavedNotification && (
              <div className={styles.savedNotification}>
                <span className={styles.checkIcon}>✓</span>
                <span className={styles.notificationText}>Your attendance status has been saved</span>
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.subscribeButton}
              onClick={handleSubscribeToggle}
              disabled={isSubscribing}
            >
              <img src={bellIcon} alt="Subscribe" className={styles.buttonIcon} />
              {isSubscribed ? 'Subscribed' : 'Subscribe to Updates'}
            </button>
            <button
              className={styles.viewProfileButton}
              onClick={() => router.push(`/student/home/clubs/${event.club_id}`)}
            >
              View Club Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

