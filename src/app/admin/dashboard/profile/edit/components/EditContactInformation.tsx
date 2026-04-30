'use client';

import styles from './EditContactInformation.module.css';

interface EditContactInformationProps {
  email: string;
  setEmail: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  socialMedia: string;
  setSocialMedia: (value: string) => void;
}

export default function EditContactInformation({
  email,
  setEmail,
  website,
  setWebsite,
  socialMedia,
  setSocialMedia
}: EditContactInformationProps) {
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
            placeholder="club@email.com"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={styles.input}
            placeholder="example.com/club"
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Social Media</label>
          <input
            type="text"
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            className={styles.input}
            placeholder="@club_handle"
          />
        </div>
      </div>
    </div>
  );
}
