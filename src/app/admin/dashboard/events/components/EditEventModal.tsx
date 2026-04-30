'use client';

import { useState, useEffect } from 'react';
import styles from './CreateEventModal.module.css';

const imgIconUpdate = "/images/icons/dashboard/icon-save.svg";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (eventData: EventFormData) => void;
  eventData: EventFormData | null;
}

export interface EventFormData {
  id: string;
  title: string;
  dateTime: string;
  location: string;
  description: string;
}

export default function EditEventModal({ isOpen, onClose, onUpdateEvent, eventData }: EditEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    id: '',
    title: '',
    dateTime: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (eventData) {
      setFormData(eventData);
    }
  }, [eventData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent(formData);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <h2 className={styles.title}>Edit Event</h2>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label className={styles.label}>Event Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.createButton}>
                <img src={imgIconUpdate} alt="" className={styles.buttonIcon} />
                <span>Update Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}








