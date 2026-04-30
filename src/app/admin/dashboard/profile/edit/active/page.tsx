'use client';

import styles from './EditModeActive.module.css';
import EditModeHeader from './components/EditModeHeader';
import EditModeBanner from './components/EditModeBanner';
import EditModeBasicInfo from './components/EditModeBasicInfo';
import EditModeMeetingInfo from './components/EditModeMeetingInfo';
import EditModeContactInfo from './components/EditModeContactInfo';
import EditModeLeadership from './components/EditModeLeadership';
import EditModePhotoGallery from './components/EditModePhotoGallery';
import SaveChangesBanner from './components/SaveChangesBanner';

export default function EditModeActivePage() {
  return (
    <div className={styles.container}>
      <EditModeHeader />
      <div className={styles.content}>
        <div className={styles.formContainer}>
          <EditModeBanner />
          <div className={styles.sections}>
            <EditModeBasicInfo />
            <EditModeMeetingInfo />
            <EditModeContactInfo />
            <EditModeLeadership />
            <EditModePhotoGallery />
            <SaveChangesBanner />
          </div>
        </div>
      </div>
    </div>
  );
}








