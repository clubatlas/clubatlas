'use client';

import { useState, useEffect } from 'react';
import styles from './SubscribersSection.module.css';
import StatCard from './StatCard';
import SubscriberRow from './SubscriberRow';
import SubscriberDetailsModal from './SubscriberDetailsModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { getClubSubscribers, Subscriber as ApiSubscriber } from '@/lib/api';

const imgIconSearch = "/images/icons/dashboard/icon-search.svg";

interface Subscriber {
  id: string;
  email: string;
  displayName: string;
  subscribedDate: string;
  initial: string;
  notificationEnabled: boolean;
}

export default function SubscribersSection() {
  const { userProfile } = useAuth();
  const { selectedClubId } = useSelectedClub();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);

  useEffect(() => {
    if (selectedClubId) {
      loadSubscribers();
    }
  }, [selectedClubId]);

  const loadSubscribers = async () => {
    if (!selectedClubId) {
      setSubscribers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getClubSubscribers(selectedClubId);

      if (response.data) {
        const mappedSubscribers: Subscriber[] = response.data.subscribers.map((apiSubscriber: ApiSubscriber) => {
          const email = apiSubscriber.user_email || 'N/A';
          const displayName = apiSubscriber.user_display_name || email.split('@')[0];
          const initial = displayName.charAt(0).toUpperCase();

          return {
            id: apiSubscriber.id,
            email,
            displayName,
            subscribedDate: new Date(apiSubscriber.subscribed_at).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            }),
            initial,
            notificationEnabled: apiSubscriber.notification_enabled
          };
        });

        setSubscribers(mappedSubscribers);
        setTotalSubscribers(response.data.total);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentCount = response.data.subscribers.filter(
          (s: ApiSubscriber) => new Date(s.subscribed_at) >= weekAgo
        ).length;
        setWeeklyGrowth(recentCount);
      }
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setError('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (subscriberId: string) => {
    const subscriber = subscribers.find(s => s.id === subscriberId);
    if (subscriber) {
      setSelectedSubscriber(subscriber);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSubscriber(null);
  };

  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subscriber.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className={styles.subscribersSection}>
        <h1 className={styles.title}>Subscribers</h1>

        {isLoading ? (
          <div className={styles.loading}>Loading subscribers...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <StatCard
                value={totalSubscribers.toString()}
                label="Total Subscribers"
                subtext={weeklyGrowth > 0 ? `+${weeklyGrowth} this week` : 'No new this week'}
                subtextColor={weeklyGrowth > 0 ? 'green' : 'gray'}
              />
            </div>

            <div className={styles.subscribersContainer}>
              <div className={styles.searchBar}>
                <div className={styles.searchInput}>
                  <img src={imgIconSearch} alt="" className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search subscribers by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <button type="button" className={styles.searchButton}>
                  Search
                </button>
              </div>

              {filteredSubscribers.length === 0 ? (
                <div className={styles.emptyState}>
                  {searchQuery ? 'No subscribers found matching your search' : 'No subscribers yet'}
                </div>
              ) : (
                <div className={styles.subscribersList}>
                  {filteredSubscribers.map((subscriber) => (
                    <SubscriberRow
                      key={subscriber.id}
                      subscriber={subscriber}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <SubscriberDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        subscriber={selectedSubscriber}
      />
    </>
  );
}

