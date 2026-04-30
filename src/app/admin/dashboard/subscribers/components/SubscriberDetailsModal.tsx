'use client';

import { useEffect } from 'react';
import styles from './SubscriberDetailsModal.module.css';

interface Subscriber {
  id: string;
  email: string;
  displayName: string;
  subscribedDate: string;
  initial: string;
  notificationEnabled: boolean;
}

interface SubscriberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: Subscriber | null;
}

export default function SubscriberDetailsModal({ isOpen, onClose, subscriber }: SubscriberDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !subscriber) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Subscriber Details</h2>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.readOnlyInput}>
              {subscriber.email}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Subscription Date</label>
            <div className={styles.readOnlyInput}>
              {subscriber.subscribedDate}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}








