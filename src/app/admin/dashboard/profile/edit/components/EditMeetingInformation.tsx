'use client';

import styles from './EditMeetingInformation.module.css';
import { MeetingSchedule } from '@/lib/api/clubs';

const MEETING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MEETING_TIMES = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00'
];

interface EditMeetingInformationProps {
  meetingSchedule: MeetingSchedule[];
  setMeetingSchedule: (value: MeetingSchedule[]) => void;
}

export default function EditMeetingInformation({
  meetingSchedule,
  setMeetingSchedule
}: EditMeetingInformationProps) {
  // Extract selected days and times from meeting schedule (filter out empty days)
  const validSchedule = meetingSchedule.filter(s => s.day && s.day.trim() !== '');
  const selectedDays = validSchedule.map(s => s.day);
  const selectedTimes = Array.from(new Set(
    validSchedule.flatMap(s => s.time_slots || [])
  )).filter(t => t && t.trim() !== '');
  const location = validSchedule[0]?.location || '';

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      // Remove this day
      setMeetingSchedule(meetingSchedule.filter(s => s.day !== day));
    } else {
      // Add this day with current times and location
      setMeetingSchedule([
        ...meetingSchedule,
        { day, time_slots: selectedTimes, location }
      ]);
    }
  };

  const toggleTime = (time: string) => {
    let newTimes: string[];
    if (selectedTimes.includes(time)) {
      newTimes = selectedTimes.filter(t => t !== time);
    } else {
      newTimes = [...selectedTimes, time];
    }
    
    // Update all schedules with new times
    setMeetingSchedule(
      meetingSchedule.map(s => ({
        ...s,
        time_slots: newTimes
      }))
    );
  };

  const handleLocationChange = (value: string) => {
    // Update location for all schedules
    if (meetingSchedule.length === 0) {
      setMeetingSchedule([{ day: '', time_slots: [], location: value }]);
    } else {
      setMeetingSchedule(
        meetingSchedule.map(s => ({
          ...s,
          location: value
        }))
      );
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Meeting Information</h2>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Meeting Days * (Select all that apply)</label>
        <div className={styles.checkboxGroup}>
          {MEETING_DAYS.map((day) => (
            <label key={day} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedDays.includes(day)}
                onChange={() => toggleDay(day)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Meeting Times * (Select all that apply)</label>
        <div className={styles.checkboxGrid}>
          {MEETING_TIMES.map((time) => (
            <label key={time} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedTimes.includes(time)}
                onChange={() => toggleTime(time)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{time}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className={styles.input}
          placeholder="e.g., Room 201, Main Building"
        />
      </div>
    </div>
  );
}








