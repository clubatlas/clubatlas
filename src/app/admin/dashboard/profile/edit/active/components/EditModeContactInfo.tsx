'use client';

import { useState } from 'react';
import styles from './EditModeContactInfo.module.css';

export default function EditModeContactInfo() {
  const [email, setEmail] = useState('robotics@campus.edu');
  const [website, setWebsite] = useState('campus.edu/robotics');
  const [socialMedia, setSocialMedia] = useState('@robotics_club');

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Contact Information</h2>

      <div className={styles.threeColumnRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="robotics@campus.edu"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={styles.input}
            placeholder="campus.edu/robotics"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Social Media</label>
          <input
            type="text"
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            className={styles.input}
            placeholder="@robotics_club"
          />
        </div>
      </div>
    </div>
  );
}








