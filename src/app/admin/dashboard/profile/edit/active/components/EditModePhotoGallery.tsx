'use client';

import styles from './EditModePhotoGallery.module.css';

const imgIconUpload = "https://www.figma.com/api/mcp/asset/e57f7a78-121e-402e-bc66-7414a46c9bfa";
const imgIconImage = "https://www.figma.com/api/mcp/asset/624f42cd-abaa-45ce-bf7c-9803ec9ba0de";
const imgIconDelete = "https://www.figma.com/api/mcp/asset/330976b7-d9aa-4efe-87b9-7ad9e32f8fc9";

function PhotoSlot({ hasImage }: { hasImage?: boolean }) {
  return (
    <div className={styles.photoSlot}>
      <div className={styles.photoContainer}>
        <img src={imgIconImage} alt="" className={styles.photoIcon} />
      </div>
      {hasImage && (
        <button className={styles.deleteButton}>
          <img src={imgIconDelete} alt="Delete" className={styles.deleteIcon} />
        </button>
      )}
    </div>
  );
}

export default function EditModePhotoGallery() {
  const handleUploadPhotos = () => {
    console.log('Upload photos');
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Photo Gallery</h2>
        <button className={styles.uploadButton} onClick={handleUploadPhotos}>
          <img src={imgIconUpload} alt="" className={styles.uploadIcon} />
          Upload Photos
        </button>
      </div>

      <div className={styles.galleryGrid}>
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
        <PhotoSlot />
      </div>
    </div>
  );
}








