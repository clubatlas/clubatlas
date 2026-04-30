'use client';

import { useState } from 'react';
import styles from './EditModeBasicInfo.module.css';

const imgIconUpload = "https://www.figma.com/api/mcp/asset/bfb52e67-aae7-4eab-b2c1-a160f1a85446";

export default function EditModeBasicInfo() {
  const [clubName, setClubName] = useState('Robotics Club');
  const [tagline, setTagline] = useState('Building the future, one robot at a time');
  const [subCategory, setSubCategory] = useState('STEM');
  const [missionStatement, setMissionStatement] = useState('');

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Basic Information</h2>

      <div className={styles.imagesRow}>
        <div className={styles.logoColumn}>
          <label className={styles.label}>Club Logo</label>
          <div className={styles.logoUploadArea}>
            <img src={imgIconUpload} alt="" className={styles.uploadIcon} />
          </div>
        </div>

        <div className={styles.coverColumn}>
          <label className={styles.label}>Cover Image</label>
          <div className={styles.coverUploadArea}></div>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Club Name *</label>
        <input
          type="text"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Tagline</label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className={styles.input}
          placeholder="Building the future, one robot at a time"
        />
      </div>

      <div className={styles.twoColumnRow}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Primary Category *</label>
          <select className={styles.dropdown}>
            <option value="">Select category</option>
            <option value="academic">Academic</option>
            <option value="arts">Arts</option>
            <option value="sports">Sports</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Sub-Category</label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className={styles.input}
            placeholder="STEM"
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mission Statement *</label>
        <textarea
          value={missionStatement}
          onChange={(e) => setMissionStatement(e.target.value)}
          className={styles.textarea}
          placeholder="Describe your club's mission and goals"
          rows={6}
        />
      </div>
    </div>
  );
}








