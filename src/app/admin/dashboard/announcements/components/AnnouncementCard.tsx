'use client';

import styles from './AnnouncementCard.module.css';

const imgIconMail = "/images/icons/dashboard/icon-mail.svg";
const imgIconEye = "/images/icons/dashboard/icon-eye.svg";
const imgIconEdit = "/images/icons/dashboard/icon-edit.svg";
const imgIconDelete = "/images/icons/dashboard/icon-delete.svg";

interface Announcement {
  id: string;
  title: string;
  postedDate: string;
  sentTo: number;
  opens: number;
  openRate: number;
  content?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
}

export default function AnnouncementCard({ announcement, onEdit, onDelete }: AnnouncementCardProps) {
  const handleEdit = () => {
    if (onEdit) onEdit(announcement);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(announcement.id);
    }
  };

  return (
    <div className={styles.announcementCard}>
      <div className={styles.cardContent}>
        <div className={styles.leftSection}>
          <h3 className={styles.announcementTitle}>{announcement.title}</h3>
          
          <p className={styles.postedDate}>Posted {announcement.postedDate}</p>
          
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <img src={imgIconMail} alt="" className={styles.statIcon} />
              <span className={styles.statText}>
                Sent to {announcement.sentTo} subscribers
              </span>
            </div>
            <div className={styles.statItem}>
              <img src={imgIconEye} alt="" className={styles.statIcon} />
              <span className={styles.statText}>
                {announcement.opens} opens ({announcement.openRate}%)
              </span>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <button onClick={handleEdit} className={styles.iconButton}>
            <img src={imgIconEdit} alt="Edit" className={styles.buttonIcon} />
          </button>
          <button onClick={handleDelete} className={styles.iconButton}>
            <img src={imgIconDelete} alt="Delete" className={styles.buttonIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}








