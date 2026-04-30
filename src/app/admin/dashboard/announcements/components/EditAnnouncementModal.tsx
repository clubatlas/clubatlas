'use client';

import { useState, useEffect } from 'react';
import styles from './CreateAnnouncementModal.module.css';

const imgIconSave = "/images/icons/dashboard/icon-save.svg";

export interface EditAnnouncementFormData {
  id: string;
  title: string;
  content: string;
}

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateAnnouncement: (data: EditAnnouncementFormData) => void;
  announcementData: EditAnnouncementFormData | null;
}

export default function EditAnnouncementModal({
  isOpen,
  onClose,
  onUpdateAnnouncement,
  announcementData,
}: EditAnnouncementModalProps) {
  const [formData, setFormData] = useState<EditAnnouncementFormData>({
    id: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    if (announcementData) {
      setFormData(announcementData);
    }
  }, [announcementData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAnnouncement(formData);
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !announcementData) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <h2 className={styles.title}>Edit Announcement</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldLarge}>
                <label className={styles.label}>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={styles.textareaLarge}
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" onClick={handleCancel} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" className={styles.createButton}>
                <img src={imgIconSave} alt="" className={styles.buttonIcon} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
