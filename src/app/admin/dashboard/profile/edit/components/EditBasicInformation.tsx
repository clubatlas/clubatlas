'use client';

import { useRef } from 'react';
import styles from './EditBasicInformation.module.css';

const imgIconUpload = "/images/icons/dashboard/icon-upload.svg";

const CATEGORIES = [
  'Student Leadership and Media',
  'Cultural Affinity Groups',
  'Community Service and Social Justice',
  'Gender Equity and Sexual Health',
  'Mental Wellness',
  'Stem Research and Olympiad',
  'Data Science and Engineering',
  'Finance and Economy',
  'Humanities',
  'Literature, Language, and Philiology',
  'Visual Arts',
  'Performing Arts',
  'Food, Cooking, Cuisine',
  'Sports and Recreations'
];

interface EditBasicInformationProps {
  clubName: string;
  setClubName: (value: string) => void;
  tagline: string;
  setTagline: (value: string) => void;
  activityTypes: string[];
  setActivityTypes: (value: string[]) => void;
  missionStatement: string;
  setMissionStatement: (value: string) => void;
  categories: string[];
  setCategories: (value: string[]) => void;
  logoUrl?: string;
  bannerUrl?: string;
  onLogoUpload: (file: File) => void;
  onBannerUpload: (file: File) => void;
}

const ACTIVITY_TYPES = ['Online', 'On-Campus', 'Off-Campus', 'Hybrid'];

export default function EditBasicInformation({
  clubName,
  setClubName,
  tagline,
  setTagline,
  activityTypes,
  setActivityTypes,
  missionStatement,
  setMissionStatement,
  categories,
  setCategories,
  logoUrl,
  bannerUrl,
  onLogoUpload,
  onBannerUpload
}: EditBasicInformationProps) {
  const toggleActivityType = (type: string) => {
    if (activityTypes.includes(type)) {
      setActivityTypes(activityTypes.filter(t => t !== type));
    } else {
      setActivityTypes([...activityTypes, type]);
    }
  };
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    logoInputRef.current?.click();
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBannerUpload(file);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Current Profile Preview</h2>

      <div className={styles.imagesRow}>
        <div className={styles.logoColumn}>
          <label className={styles.label}>Club Logo</label>
          <div className={styles.logoUploadArea} onClick={handleLogoClick}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className={styles.uploadedImage} />
            ) : (
              <img src={imgIconUpload} alt="" className={styles.uploadIcon} />
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className={styles.coverColumn}>
          <label className={styles.label}>Cover Image</label>
          <div className={styles.coverUploadArea} onClick={handleBannerClick}>
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className={styles.uploadedBanner} />
            ) : (
              <div className={styles.emptyBanner}>
                <img src={imgIconUpload} alt="" className={styles.uploadIcon} />
              </div>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              style={{ display: 'none' }}
            />
          </div>
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

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Activity Types * (Select all that apply)</label>
        <div className={styles.checkboxGroup}>
          {ACTIVITY_TYPES.map((type) => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={activityTypes.includes(type)}
                onChange={() => toggleActivityType(type)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Categories * (Select all that apply)</label>
        <div className={styles.checkboxGroup}>
          {CATEGORIES.map((category) => (
            <label key={category} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={categories.includes(category)}
                onChange={() => {
                  if (categories.includes(category)) {
                    setCategories(categories.filter(c => c !== category));
                  } else {
                    setCategories([...categories, category]);
                  }
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Mission Statement *</label>
        <textarea
          value={missionStatement}
          onChange={(e) => setMissionStatement(e.target.value)}
          className={styles.textarea}
          rows={4}
        />
      </div>
    </div>
  );
}








