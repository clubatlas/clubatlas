'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSelectedClub } from '@/contexts/SelectedClubContext';
import { logout } from '@/lib/firebase/auth';
import EditProfileModal from '@/components/EditProfileModal';
import { getUnreadCount, getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, NotificationResponse } from '@/lib/api/notifications';
import { getClub, Club } from '@/lib/api/clubs';
import styles from './DashboardHeader.module.css';

const imgIcon = "/images/icons/dashboard/leader-logo.svg";
const imgIcon1 = "/images/icons/dashboard/bell.svg";
const imgIcon2 = "/images/icons/dashboard/settings.svg";
const imgIcon3 = "/images/icons/dashboard/logout.svg";

export default function DashboardHeader() {
  const router = useRouter();
  const { userProfile, isAuthenticated } = useAuth();
  const { selectedClubId, setSelectedClubId } = useSelectedClub();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [managedClubs, setManagedClubs] = useState<Club[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const clubDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (clubDropdownRef.current && !clubDropdownRef.current.contains(event.target as Node)) {
        setShowClubDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (userProfile?.managed_club_ids && userProfile.managed_club_ids.length > 0) {
      loadManagedClubs(userProfile.managed_club_ids);
    }
  }, [userProfile]);

  const loadManagedClubs = async (clubIds: string[]) => {
    try {
      const responses = await Promise.all(clubIds.map(id => getClub(id)));
      const clubs = responses
        .filter(r => r.data && !r.error)
        .map(r => r.data!);
      setManagedClubs(clubs);
    } catch (err) {
      console.error('Failed to load managed clubs:', err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      if (response.data && !response.error) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await getMyNotifications({ limit: 10 });
      if (response.data && !response.error) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      await loadNotifications();
    }

    if (notification.link) {
      router.push(notification.link);
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleViewPublicSite = () => {
    router.push('/student/home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <img src={imgIcon} alt="ClubAtlas" className={styles.logoIcon} />
          </div>
        </div>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Leader Dashboard</h1>
          {managedClubs.length > 1 ? (
            <div className={styles.clubSwitcherContainer} ref={clubDropdownRef}>
              <button
                className={styles.subtitleButton}
                onClick={() => setShowClubDropdown(prev => !prev)}
              >
                <span>{managedClubs.find(c => c.id === selectedClubId)?.name ?? '...'}</span>
                <svg
                  className={`${styles.chevron} ${showClubDropdown ? styles.chevronOpen : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showClubDropdown && (
                <div className={styles.clubDropdown}>
                  {managedClubs.map(club => (
                    <button
                      key={club.id}
                      className={`${styles.clubDropdownItem} ${club.id === selectedClubId ? styles.clubDropdownItemActive : ''}`}
                      onClick={() => {
                        setSelectedClubId(club.id);
                        setShowClubDropdown(false);
                      }}
                    >
                      {club.id === selectedClubId && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={styles.checkIcon}>
                          <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      {club.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className={styles.subtitle}>
              {managedClubs.find(c => c.id === selectedClubId)?.name ?? '...'}
            </p>
          )}
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.notificationContainer} ref={notificationRef}>
          <button className={styles.iconButton} onClick={toggleNotifications}>
            <img src={imgIcon1} alt="Notifications" className={styles.icon} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.notificationHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    className={styles.markAllReadButton}
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifications}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`${styles.notificationItem} ${!notification.is_read ? styles.unread : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={styles.notificationContent}>
                        <p className={styles.notificationTitle}>{notification.title}</p>
                        <p className={styles.notificationText}>{notification.content}</p>
                        {notification.club_name && (
                          <span className={styles.notificationClub}>{notification.club_name}</span>
                        )}
                      </div>
                      <div className={styles.notificationTime}>
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <button className={styles.textButton} onClick={handleViewPublicSite}>View Public Site</button>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {userProfile?.display_name?.substring(0, 2).toUpperCase() || 'SJ'}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{userProfile?.display_name || 'Club Leader'}</p>
            <p className={styles.userRole}>President</p>
          </div>
        </div>
        <button className={styles.iconButton} onClick={() => setShowEditModal(true)} title="Settings">
          <img src={imgIcon2} alt="Settings" className={styles.icon} />
        </button>
        <button className={styles.iconButton} onClick={handleLogout} title="Logout">
          <img src={imgIcon3} alt="Logout" className={styles.icon} />
        </button>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}










