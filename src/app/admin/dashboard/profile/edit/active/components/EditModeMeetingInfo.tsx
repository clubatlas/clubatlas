'use client';

import { useState } from 'react';
import styles from './EditModeMeetingInfo.module.css';

export default function EditModeMeetingInfo() {
  const [meetingTime, setMeetingTime] = useState('4:00 PM - 6:00 PM');
  const [location, setLocation] = useState('Engineering Building, Room 201');

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Meeting Information</h2>

      <div className={styles.threeColumnRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Meeting Day</label>
          <select className={styles.dropdown}>
            <option value="">Select day</option>
            <option value="monday">Monday</option>
            <option value="tuesday">Tuesday</option>
            <option value="wednesday">Wednesday</option>
            <option value="thursday">Thursday</option>
            <option value="friday">Friday</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Meeting Time</label>
          <input
            type="text"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            className={styles.input}
            placeholder="4:00 PM - 6:00 PM"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
            placeholder="Engineering Building, Room 201"
          />
        </div>
      </div>
    </div>
  );
}








