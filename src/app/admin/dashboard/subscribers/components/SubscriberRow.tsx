'use client';

import styles from './SubscriberRow.module.css';

interface Subscriber {
  id: string;
  email: string;
  subscribedDate: string;
  initial: string;
}

interface SubscriberRowProps {
  subscriber: Subscriber;
  onViewDetails: (id: string) => void;
}

export default function SubscriberRow({ subscriber, onViewDetails }: SubscriberRowProps) {
  return (
    <div className={styles.subscriberRow}>
      <div className={styles.leftSection}>
        <div className={styles.avatar}>
          {subscriber.initial}
        </div>
        <div className={styles.info}>
          <div className={styles.email}>
            {(() => {
              const [local, domain] = subscriber.email.split('@');
              return (
                <>
                  <span className={styles.emailLocal}>{local}</span>
                  <span className={styles.emailDomain}>@{domain}</span>
                </>
              );
            })()}
          </div>
          <div className={styles.date}>Subscribed {subscriber.subscribedDate}</div>
        </div>
      </div>
      <button
        onClick={() => onViewDetails(subscriber.id)}
        className={styles.viewButton}
      >
        View Details
      </button>
    </div>
  );
}








