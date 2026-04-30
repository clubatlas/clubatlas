'use client';

import { useState } from 'react';
import styles from './EventCard.module.css';
import { sendEventReminder } from '@/lib/api/events';

const imgIconCalendar = "/images/icons/dashboard/icon-calendar.svg";
const imgIconPeople = "/images/icons/dashboard/icon-people.svg";
const imgIconMail = "/images/icons/dashboard/icon-mail.svg";
const imgIconEdit = "/images/icons/dashboard/icon-edit.svg";
const imgIconDelete = "/images/icons/dashboard/icon-delete.svg";

interface Event {
  id: string;
  title: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  date: string;
  notificationsSent: number;
  attendeesCount: number;
  location?: string;
  description?: string;
}

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onViewDetails: (event: Event) => void;
}

export default function EventCard({ event, onEdit, onDelete, onViewDetails }: EventCardProps) {
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const handleViewDetails = () => {
    onViewDetails(event);
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

  const handleEdit = () => {
    onEdit(event);
  };

  const handleDelete = () => {
    onDelete(event);
  };

  const getStatusClassName = () => {
    switch (event.status) {
      case 'upcoming':
        return styles.statusUpcoming;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const getStatusLabel = () => {
    return event.status.toUpperCase();
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.cardContent}>
        <div className={styles.leftSection}>
          <div className={styles.titleRow}>
            <h3 className={styles.eventTitle}>{event.title}</h3>
            <span className={`${styles.statusBadge} ${getStatusClassName()}`}>
              {getStatusLabel()}
            </span>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <img src={imgIconCalendar} alt="" className={styles.infoIcon} />
              <span className={styles.infoText}>{event.date}</span>
            </div>
            <div className={styles.infoItem}>
              <img src={imgIconPeople} alt="" className={styles.infoIcon} />
              <span className={styles.infoText}>
                {event.notificationsSent} email notifications sent
              </span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button onClick={handleViewDetails} className={styles.viewButton}>
              View Details
            </button>
            {event.status === 'upcoming' && (
              <button
                onClick={handleSendReminder}
                className={styles.reminderButton}
                disabled={reminderSending || reminderSent}
              >
                <img src={imgIconMail} alt="" className={styles.actionIcon} />
                <span>
                  {reminderSending ? 'Sending...' : reminderSent ? 'Sent!' : 'Send Reminder'}
                </span>
              </button>
            )}
          </div>
        </div>

        {event.status === 'upcoming' && (
          <div className={styles.rightSection}>
            <button onClick={handleEdit} className={styles.iconButton}>
              <img src={imgIconEdit} alt="Edit" className={styles.buttonIcon} />
            </button>
            <button onClick={handleDelete} className={styles.iconButton}>
              <img src={imgIconDelete} alt="Delete" className={styles.buttonIcon} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

