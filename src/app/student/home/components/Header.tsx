'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/firebase/auth';
import { getMyNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, NotificationResponse } from '@/lib/api/notifications';
import { getClubs, Club } from '@/lib/api/clubs';
import { getEvents, Event } from '@/lib/api/events';
import styles from './Header.module.css';

const logoIcon = "/images/icons/logo.svg";
const searchIcon = "/images/icons/search.svg";
const bellIcon = "/images/icons/bell.svg";
const profileIcon = "/images/icons/profile.svg";
const logoutIcon = "/images/icons/mypage/logout.svg";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { userProfile, isAuthenticated, isClubLeader } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ clubs: Club[]; events: Event[] }>({ clubs: [], events: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
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

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery('');
      setSearchResults({ clubs: [], events: [] });
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults({ clubs: [], events: [] });
      return;
    }

    setIsSearching(true);

    try {
      const [clubsResponse, eventsResponse] = await Promise.all([
        getClubs({ page_size: 50 }),
        getEvents({ limit: 50 })
      ]);

      const queryLower = query.toLowerCase();

      const filteredClubs = clubsResponse.data?.clubs.filter(club =>
        club.name.toLowerCase().includes(queryLower) ||
        club.description.toLowerCase().includes(queryLower) ||
        club.categories.some(cat => cat.toLowerCase().includes(queryLower))
      ) || [];

      const filteredEvents = eventsResponse.data?.events.filter(event =>
        event.title.toLowerCase().includes(queryLower) ||
        event.description?.toLowerCase().includes(queryLower)
      ) || [];

      setSearchResults({
        clubs: filteredClubs.slice(0, 5),
        events: filteredEvents.slice(0, 5)
      });
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (type: 'club' | 'event', id: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults({ clubs: [], events: [] });

    if (type === 'club') {
      router.push(`/student/home/clubs/${id}`);
    } else {
      router.push('/student/home/calendar');
    }
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
    <header className={styles.header} ref={mobileMenuRef}>
      <div className={styles.container}>
        <Link href="/student/home" className={styles.logoContainer}>
          <div className={styles.logoIcon}>
            <img src={logoIcon} alt="ClubAtlas" />
          </div>
          <span className={styles.logoText}>ClubAtlas</span>
        </Link>

        <nav className={styles.navigation}>
          <Link href="/student/home/clubs" className={`${styles.navLink} ${pathname.startsWith('/student/home/clubs') ? styles.navLinkActive : ''}`}>
            Browse Clubs
          </Link>
          <Link href="/student/home/calendar" className={`${styles.navLink} ${pathname.startsWith('/student/home/calendar') ? styles.navLinkActive : ''}`}>
            Calendar
          </Link>
          <Link href="/student/home/ai-recommendations" className={`${styles.navLink} ${pathname.startsWith('/student/home/ai-recommendations') ? styles.navLinkActive : ''}`}>
            AI Recommendations
          </Link>
          <Link href="/student/home/mypage" className={`${styles.navLink} ${pathname.startsWith('/student/home/mypage') ? styles.navLinkActive : ''}`}>
            My Page
          </Link>
        </nav>

        <div className={styles.actions}>
          <div className={styles.searchContainer} ref={searchRef}>
            <button 
              className={styles.iconButton} 
              aria-label="Search"
              onClick={toggleSearch}
            >
              <img src={searchIcon} alt="Search" />
            </button>
            {showSearch && (
              <div className={styles.searchDropdown}>
                <div className={styles.searchInputContainer}>
                  <img src={searchIcon} alt="" className={styles.searchInputIcon} />
                  <input
                    type="text"
                    placeholder="Search clubs or events..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {isSearching ? (
                  <div className={styles.searchLoading}>Searching...</div>
                ) : searchQuery.length > 0 ? (
                  <div className={styles.searchResults}>
                    {searchResults.clubs.length > 0 && (
                      <div className={styles.searchSection}>
                        <h4 className={styles.searchSectionTitle}>Clubs</h4>
                        {searchResults.clubs.map((club) => (
                          <div
                            key={club.id}
                            className={styles.searchResultItem}
                            onClick={() => handleSearchResultClick('club', club.id)}
                          >
                            <div className={styles.searchResultContent}>
                              <p className={styles.searchResultTitle}>{club.name}</p>
                              <p className={styles.searchResultSubtitle}>
                                {club.categories.slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.events.length > 0 && (
                      <div className={styles.searchSection}>
                        <h4 className={styles.searchSectionTitle}>Events</h4>
                        {searchResults.events.map((event) => (
                          <div
                            key={event.id}
                            className={styles.searchResultItem}
                            onClick={() => handleSearchResultClick('event', event.id || '')}
                          >
                            <div className={styles.searchResultContent}>
                              <p className={styles.searchResultTitle}>{event.title}</p>
                              <p className={styles.searchResultSubtitle}>
                                {new Date(event.start_datetime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.clubs.length === 0 && searchResults.events.length === 0 && (
                      <div className={styles.searchEmpty}>
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.searchHint}>
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.notificationMenuContainer} ref={notificationRef}>
            <button 
              className={styles.iconButton} 
              aria-label="Notifications"
              onClick={toggleNotifications}
            >
              <img src={bellIcon} alt="Notifications" />
              {unreadCount > 0 && (
                <span className={styles.notificationDot}>{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className={styles.notificationMenu}>
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
          <div className={styles.profileMenuContainer} ref={menuRef}>
            <button 
              className={styles.profileButton} 
              aria-label="Profile"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <img src={profileIcon} alt="Profile" />
            </button>
            {showProfileMenu && (
              <div className={styles.profileMenu}>
                <div className={styles.profileMenuHeader}>
                  <p className={styles.profileMenuName}>
                    {userProfile?.display_name || 'Student'}
                  </p>
                  <p className={styles.profileMenuEmail}>
                    {userProfile?.email || ''}
                  </p>
                </div>
                <div className={styles.profileMenuDivider}></div>
                <Link 
                  href="/student/home/mypage" 
                  className={styles.profileMenuItem}
                  onClick={() => setShowProfileMenu(false)}
                >
                  My Profile
                </Link>
                {isClubLeader && (
                  <Link 
                    href="/admin/dashboard" 
                    className={styles.profileMenuItem}
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  className={styles.profileMenuItem}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          <button
            className={styles.iconButton}
            aria-label="Logout"
            onClick={handleLogout}
          >
            <img src={logoutIcon} alt="Logout" />
          </button>

          <button
            className={styles.hamburgerButton}
            aria-label="Menu"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hamburgerLineOpen1 : ''}`} />
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hamburgerLineOpen2 : ''}`} />
            <span className={`${styles.hamburgerLine} ${showMobileMenu ? styles.hamburgerLineOpen3 : ''}`} />
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <nav className={styles.mobileMenu}>
          <Link
            href="/student/home/clubs"
            className={`${styles.mobileNavLink} ${pathname.startsWith('/student/home/clubs') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Browse Clubs
          </Link>
          <Link
            href="/student/home/calendar"
            className={`${styles.mobileNavLink} ${pathname.startsWith('/student/home/calendar') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            Calendar
          </Link>
          <Link
            href="/student/home/ai-recommendations"
            className={`${styles.mobileNavLink} ${pathname.startsWith('/student/home/ai-recommendations') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            AI Recommendations
          </Link>
          <Link
            href="/student/home/mypage"
            className={`${styles.mobileNavLink} ${pathname.startsWith('/student/home/mypage') ? styles.mobileNavLinkActive : ''}`}
            onClick={() => setShowMobileMenu(false)}
          >
            My Page
          </Link>
        </nav>
      )}
    </header>
  );
}

