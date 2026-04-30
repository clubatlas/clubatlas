'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './AnnouncementsSection.module.css';
import AnnouncementCard from './AnnouncementCard';
import CreateAnnouncementModal, { AnnouncementFormData } from './CreateAnnouncementModal';
import EditAnnouncementModal, { EditAnnouncementFormData } from './EditAnnouncementModal';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, Announcement as ApiAnnouncement, getClubSubscribers } from '@/lib/api';

const imgIconAdd = "/images/icons/dashboard/icon-plus.svg";

interface Announcement {
  id: string;
  title: string;
  postedDate: string;
  sentTo: number;
  opens: number;
  openRate: number;
  content?: string;
}

export default function AnnouncementsSection() {
  const { userProfile } = useAuth();
  const { selectedClubId } = useSelectedClub();
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    searchParams.get('openModal') === 'true'
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<EditAnnouncementFormData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    if (selectedClubId) {
      loadAnnouncements();
    }
  }, [selectedClubId]);

  const loadAnnouncements = async () => {
    if (!selectedClubId) {
      setAnnouncements([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [response, subscribersRes] = await Promise.all([
        getAnnouncements({ club_id: selectedClubId, limit: 100, status_filter: 'active' }),
        getClubSubscribers(selectedClubId),
      ]);

      if (subscribersRes.data) {
        setSubscriberCount(subscribersRes.data.total);
      }

      if (response.data) {
        const mappedAnnouncements: Announcement[] = response.data.announcements.map((apiAnnouncement: ApiAnnouncement) => {
          const sentTo = apiAnnouncement.sent_to || 0;
          const opens = apiAnnouncement.opens || 0;
          const openRate = sentTo > 0 ? Math.round((opens / sentTo) * 100) : 0;

          return {
            id: apiAnnouncement.id || '',
            title: apiAnnouncement.title,
            postedDate: new Date(apiAnnouncement.created_at || '').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            sentTo,
            opens,
            openRate,
            content: apiAnnouncement.content,
          };
        });

        setAnnouncements(mappedAnnouncements);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleAnnouncementCreate = async (announcementData: AnnouncementFormData) => {
    if (!selectedClubId) {
      alert('No managed clubs found');
      return;
    }

    try {
      const response = await createAnnouncement({
        club_id: selectedClubId,
        title: announcementData.title,
        content: announcementData.content,
      });

      if (response.data) {
        setIsCreateModalOpen(false);
        await loadAnnouncements();
      } else {
        alert(response.error || 'Failed to create announcement');
      }
    } catch (err) {
      console.error('Failed to create announcement:', err);
      alert('Failed to create announcement');
    }
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleAnnouncementUpdate = async (data: EditAnnouncementFormData) => {
    try {
      const response = await updateAnnouncement(data.id, {
        title: data.title,
        content: data.content,
      });

      if (response.data) {
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
        await loadAnnouncements();
      } else {
        alert(response.error || 'Failed to update announcement');
      }
    } catch (err) {
      console.error('Failed to update announcement:', err);
      alert('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const response = await deleteAnnouncement(announcementId);

      if (response.error) {
        alert(response.error || 'Failed to delete announcement');
      } else {
        await loadAnnouncements();
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  return (
    <>
      <div className={styles.announcementsSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>Announcements</h1>
          <button onClick={handleCreateAnnouncement} className={styles.createButton}>
            <img src={imgIconAdd} alt="" className={styles.buttonIcon} />
            <span>New Announcement</span>
          </button>
        </div>

        <div className={styles.infoBanner}>
          <img src="/images/icons/dashboard/icon-info.svg" alt="" className={styles.infoIcon} />
          <p className={styles.infoText}>
            Announcements are automatically sent to all{' '}
            <span className={styles.subscriberCount}>{subscriberCount} subscribers</span>{' '}
            via email and appear on your club profile page.
          </p>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading announcements...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : announcements.length === 0 ? (
          <div className={styles.empty}>No announcements yet. Create your first announcement!</div>
        ) : (
          <div className={styles.announcementsGrid}>
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onEdit={handleEditClick}
                onDelete={handleDeleteAnnouncement}
              />
            ))}
          </div>
        )}
      </div>

      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onCreateAnnouncement={handleAnnouncementCreate}
      />

      <EditAnnouncementModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onUpdateAnnouncement={handleAnnouncementUpdate}
        announcementData={editingAnnouncement}
      />
    </>
  );
}

