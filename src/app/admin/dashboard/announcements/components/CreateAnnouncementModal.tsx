'use client';

import { useState } from 'react';
import styles from './CreateAnnouncementModal.module.css';

const imgIconAdd = "/images/icons/dashboard/icon-plus.svg";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAnnouncement: (announcementData: AnnouncementFormData) => void;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
}

export default function CreateAnnouncementModal({ isOpen, onClose, onCreateAnnouncement }: CreateAnnouncementModalProps) {
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAnnouncement(formData);
    // Reset form
    setFormData({
      title: '',
      content: '',
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      title: '',
      content: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <h2 className={styles.title}>Create New Announcement</h2>
          
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
                <img src={imgIconAdd} alt="" className={styles.buttonIcon} />
                <span>Create Announcement</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}








