'use client';

import { useState, useRef } from 'react';
import styles from './CreateEventModal.module.css';
import DatePicker from './DatePicker';

const imgIconAdd = "/images/icons/dashboard/icon-plus.svg";
const imgIconCalendar = "/images/icons/dashboard/icon-calendar.svg";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: EventFormData) => void;
}

export interface EventFormData {
  title: string;
  dateTime: string;
  location: string;
  description: string;
}

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function getDatePart(dateTime: string): string {
  if (!dateTime) return '';
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTimePart(dateTime: string): string {
  if (!dateTime) return '16:00';
  const d = new Date(dateTime);
  if (isNaN(d.getTime())) return '16:00';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const dateInputRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    dateTime: '',
    location: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent(formData);
    // Reset form
    setFormData({
      title: '',
      dateTime: '',
      location: '',
      description: '',
    });
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      dateTime: '',
      location: '',
      description: '',
    });
    setShowDatePicker(false);
    onClose();
  };

  const handleDateSelect = (dateStr: string) => {
    const time = getTimePart(formData.dateTime);
    setFormData({ ...formData, dateTime: `${dateStr}T${time}` });
    setShowDatePicker(false);
  };

  const handleTimeChange = (timeStr: string) => {
    const date = formData.dateTime ? getDatePart(formData.dateTime) : new Date().toISOString().slice(0, 10);
    setFormData({ ...formData, dateTime: `${date}T${timeStr}` });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <h2 className={styles.title}>Create New Event</h2>
          
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
                <div className={styles.dateTimeRow}>
                  <div
                    ref={dateInputRef}
                    className={styles.dateInputWrapper}
                  >
                    <input
                      type="text"
                      readOnly
                      placeholder="mm/dd/yyyy"
                      value={formatDateForDisplay(formData.dateTime)}
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={styles.input}
                      required
                    />
                    <img src={imgIconCalendar} alt="" className={styles.dateIcon} />
                    {showDatePicker && (
                      <DatePicker
                        selectedDate={getDatePart(formData.dateTime) || new Date().toISOString().slice(0, 10)}
                        onDateSelect={handleDateSelect}
                        onClose={() => setShowDatePicker(false)}
                        anchorRef={dateInputRef}
                      />
                    )}
                  </div>
                  <input
                    type="time"
                    value={getTimePart(formData.dateTime)}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={styles.timeInput}
                    required
                  />
                </div>
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
                <img src={imgIconAdd} alt="" className={styles.buttonIcon} />
                <span>Create Event</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}








