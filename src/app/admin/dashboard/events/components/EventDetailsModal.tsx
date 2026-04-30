'use client';

import { useState } from 'react';
import styles from './EventDetailsModal.module.css';
import { sendEventReminder } from '@/lib/api/events';

const imgIconClose = '/images/icons/superadmin/club-leaders/modal-close.svg';
const imgIconCalendar = '/images/icons/dashboard/icon-calendar.svg';
const imgIconLocation = '/images/icons/club-detail/location.svg';
const imgIconDescription = '/images/icons/dashboard/icon-description.svg';
const imgIconMail = '/images/icons/dashboard/icon-mail.svg';
const imgIconEdit = '/images/icons/dashboard/icon-edit.svg';

export interface EventDetail {
  id: string;
  title: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  date: string;
  notificationsSent: number;
  attendeesCount: number;
  location?: string;
  description?: string;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: EventDetail) => void;
  event: EventDetail | null;
}

export default function EventDetailsModal({ isOpen, onClose, onEdit, event }: EventDetailsModalProps) {
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  if (!isOpen || !event) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleEdit = () => {
    onClose();
    onEdit(event);
  };

  const handleSendReminder = async () => {
    if (reminderSending || reminderSent) return;
    setReminderSending(true);
    try {
      const response = await sendEventReminder(event.id);
      if (response.error) {
        alert(response.error);
      } else {
        setReminderSent(true);
        setTimeout(() => setReminderSent(false), 3000);
      }
    } catch {
      alert('Failed to send reminder');
    } finally {
      setReminderSending(false);
    }
  };

  const isUpcoming = event.status === 'upcoming';

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.statusBadge}>{event.status.toUpperCase()}</span>
            <h2 className={styles.headerTitle}>{event.title}</h2>
            <p className={styles.headerSubtitle}>Club Event</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <img src={imgIconClose} alt="" className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.infoGrid}>
            <div className={`${styles.infoCard} ${styles.infoCardDate}`}>
              <div className={`${styles.infoIconBox} ${styles.infoIconBoxDate}`}>
                <img src={imgIconCalendar} alt="" className={styles.infoIconImg} />
              </div>
              <div className={styles.infoCardText}>
                <span className={styles.infoCardLabel}>Date &amp; Time</span>
                <span className={styles.infoCardValue}>{event.date}</span>
              </div>
            </div>

            <div className={`${styles.infoCard} ${styles.infoCardLocation}`}>
              <div className={`${styles.infoIconBox} ${styles.infoIconBoxLocation}`}>
                <img src={imgIconLocation} alt="" className={styles.infoIconImg} />
              </div>
              <div className={styles.infoCardText}>
                <span className={styles.infoCardLabel}>Location</span>
                <span className={styles.infoCardValue}>{event.location || '—'}</span>
              </div>
            </div>
          </div>

          <div className={styles.attendanceBox}>
            <span className={styles.attendanceNumber}>{event.attendeesCount}</span>
            <span className={styles.attendanceLabel}>Expected Attendance</span>
          </div>

          <div className={styles.descriptionSection}>
            <h3 className={styles.descriptionHeading}>
              <img src={imgIconDescription} alt="" className={styles.descriptionIcon} />
              Event Description
            </h3>
            <div className={styles.descriptionBox}>
              <p className={styles.descriptionText}>
                {event.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {isUpcoming && (
            <div className={styles.footerButtons}>
              <button
                className={styles.reminderButton}
                onClick={handleSendReminder}
                disabled={reminderSending || reminderSent}
              >
                <img src={imgIconMail} alt="" className={styles.reminderButtonIcon} />
                <span>
                  {reminderSending ? 'Sending...' : reminderSent ? 'Sent!' : 'Send Reminder'}
                </span>
              </button>
              <button className={styles.editButton} onClick={handleEdit}>
                <img src={imgIconEdit} alt="" className={styles.editButtonIcon} />
                <span>Edit Event</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
