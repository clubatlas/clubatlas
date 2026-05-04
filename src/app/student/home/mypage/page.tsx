'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './MyPage.module.css';
import Header from '../components/Header';
import { getMySubscriptions, subscribeToClub, unsubscribeFromClub, updateNotificationSettings, Subscription } from '@/lib/api/subscriptions';
import { getClub, Club } from '@/lib/api/clubs';
import { getMyAttendanceHistory, getMyCalendarEvents, AttendanceRecord, AttendanceStats, Event } from '@/lib/api/events';
import { getMyBookmarks, deleteBookmark, createBookmark, BookmarkedClub } from '@/lib/api/bookmarks';
import { getRecommendations, ClubRecommendation } from '@/lib/api/recommendations';
import { fetchMyProfile, UserProfile, deleteMyAccount, updateNotificationPreferences } from '@/lib/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/firebase/auth';
import EditProfileModal from '@/components/EditProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

const overviewIcon = "/images/icons/mypage/overview.svg";
const subscribeIcon = "/images/icons/mypage/subscribed.svg";
const historyIcon = "/images/icons/mypage/history.svg";
const savedIcon = "/images/icons/mypage/saved.svg";
const settingsIcon = "/images/icons/mypage/settings.svg";
const clubsFollowingIcon = "/images/icons/mypage/clubs-following.svg";
const upcomingEventsIcon = "/images/icons/mypage/upcoming-events.svg";
const eventsAttendedIcon = "/images/icons/mypage/events-attended.svg";
const savedClubsIcon = "/images/icons/mypage/saved-clubs.svg";
const calendarIconBlue = "/images/icons/mypage/calendar-blue.svg";
const clockIcon = "/images/icons/mypage/calendar-small.svg";
const heartIcon = "/images/icons/mypage/bookmark.svg";
const heartIconFilled = "/images/icons/mypage/bookmark-filled.svg";

const checkIcon = "/images/icons/mypage/check-circle.svg";
const notificationIcon = "/images/icons/mypage/notification.svg";

const eventsAttendedIconGreen = "/images/icons/mypage/events-attended-green.svg";
const eventsMissedIconRed = "/images/icons/mypage/events-missed-red.svg";
const attendanceRateIconBlue = "/images/icons/mypage/attendance-rate-blue.svg";
const eventCheckIcon = "/images/icons/mypage/event-check.svg";
const eventXIcon = "/images/icons/mypage/event-x.svg";

const removeIcon = "/images/icons/mypage/remove.svg";
const computerScienceImage = "/images/default-club.svg";

const passwordIcon = "/images/icons/mypage/password.svg";

const roboticsImage = "https://www.figma.com/api/mcp/asset/4ba38dbe-026b-4fd0-bc00-b3d0131f693c";
const photographyImage = "https://www.figma.com/api/mcp/asset/a186a9fb-03e2-4ba0-aa24-2ce436bc6074";
const debateImage = "https://www.figma.com/api/mcp/asset/8e892fbd-ccf1-4c07-b2a8-e86e1e877f61";

const roboticsImageLarge = "https://www.figma.com/api/mcp/asset/2ea62fac-3b99-4b23-8a29-b749e4db2b63";
const photographyImageLarge = "https://www.figma.com/api/mcp/asset/cad04e6a-4e92-4d32-a266-af8cb40da6b0";
const debateImageLarge = "https://www.figma.com/api/mcp/asset/21474162-77bc-4f7c-90a2-637ab7563087";

interface SubscribedClubData extends Subscription {
  clubDetails?: Club;
}

export default function MyPagePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscribedClubData[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [unsubscribingClubId, setUnsubscribingClubId] = useState<string | null>(null);
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'attended' | 'missed'>('all');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const HISTORY_PAGE_SIZE = 5;
  
  const [bookmarkedClubs, setBookmarkedClubs] = useState<BookmarkedClub[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [removingBookmarkId, setRemovingBookmarkId] = useState<string | null>(null);
  const [subscribingFromBookmark, setSubscribingFromBookmark] = useState<string | null>(null);
  
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    eventReminders: true,
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  const [recommendations, setRecommendations] = useState<ClubRecommendation[]>([]);
  const [recommendedClubsData, setRecommendedClubsData] = useState<Club[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [savingBookmarkId, setSavingBookmarkId] = useState<string | null>(null);
  const [fullUserProfile, setFullUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (activeTab === 'subscribed' || activeTab === 'overview' || activeTab === 'saved') {
      loadSubscribedClubs();
    }
    if (activeTab === 'history') {
      loadAttendanceHistory();
    }
    if (activeTab === 'saved' || activeTab === 'overview') {
      loadBookmarkedClubs();
    }
    if (activeTab === 'overview') {
      loadAttendanceHistory();
      loadUpcomingEvents();
      loadRecommendations();
    }
    if (activeTab === 'settings') {
      loadFullUserProfile();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryPage(1);
      loadAttendanceHistory();
    }
  }, [historyFilter]);

  const loadFullUserProfile = async () => {
    try {
      const response = await fetchMyProfile();
      if (response.data) {
        setFullUserProfile(response.data);
        if (response.data.notification_preferences) {
          setNotificationSettings({
            emailNotifications: response.data.notification_preferences.email_notifications,
            eventReminders: response.data.notification_preferences.event_reminders,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const loadSubscribedClubs = async () => {
    setIsLoadingSubscriptions(true);
    setSubscriptionError(null);

    try {
      const response = await getMySubscriptions();
      
      if (response.error) {
        setSubscriptionError(response.error);
        return;
      }

      if (response.data) {
        const subscriptionsData = response.data.subscriptions;
        
        const subscriptionsWithDetails = await Promise.all(
          subscriptionsData.map(async (sub) => {
            try {
              const clubResponse = await getClub(sub.club_id);
              return {
                ...sub,
                clubDetails: clubResponse.data
              };
            } catch (err) {
              console.error(`Failed to load club ${sub.club_id}:`, err);
              return {
                ...sub,
                clubDetails: undefined
              };
            }
          })
        );

        setSubscriptions(subscriptionsWithDetails);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      setSubscriptionError('Failed to load subscriptions');
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const loadAttendanceHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const response = await getMyAttendanceHistory({
        status_filter: historyFilter
      });

      if (response.error) {
        setHistoryError(response.error);
        return;
      }

      if (response.data) {
        setAttendanceRecords(response.data.records);
        setAttendanceStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err);
      setHistoryError('Failed to load attendance history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadBookmarkedClubs = async () => {
    setIsLoadingBookmarks(true);
    setBookmarksError(null);

    try {
      const response = await getMyBookmarks();

      if (response.error) {
        setBookmarksError(response.error);
        return;
      }

      if (response.data) {
        setBookmarkedClubs(response.data.bookmarks);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setBookmarksError('Failed to load bookmarks');
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const handleRemoveBookmark = async (clubId: string) => {
    if (removingBookmarkId) return;

    if (!confirm('Are you sure you want to remove this club from your saved list?')) {
      return;
    }

    setRemovingBookmarkId(clubId);

    try {
      const response = await deleteBookmark(clubId);

      if (response.error) {
        alert(response.error || 'Failed to remove bookmark');
        return;
      }

      setBookmarkedClubs(prev => prev.filter(club => club.club_id !== clubId));
    } catch (err) {
      console.error('Remove bookmark error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setRemovingBookmarkId(null);
    }
  };

  const handleSubscribeFromBookmark = async (clubId: string) => {
    if (subscribingFromBookmark) return;

    setSubscribingFromBookmark(clubId);

    try {
      const response = await subscribeToClub(clubId);

      if (response.error) {
        alert(response.error || 'Failed to subscribe');
        return;
      }

      alert('Successfully subscribed to the club!');
      await loadSubscribedClubs();
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubscribingFromBookmark(null);
    }
  };

  const loadUpcomingEvents = async () => {
    setIsLoadingEvents(true);
    setEventsError(null);

    try {
      const now = new Date();
      const weekLater = new Date();
      weekLater.setDate(now.getDate() + 7);

      const response = await getMyCalendarEvents({
        start_date: now.toISOString(),
        end_date: weekLater.toISOString()
      });

      if (response.error) {
        setEventsError(response.error);
        return;
      }

      if (response.data) {
        setUpcomingEvents(response.data.events.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load upcoming events:', err);
      setEventsError('Failed to load upcoming events');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      const response = await getRecommendations({ limit: 4 });

      if (response.error) {
        setRecommendationsError(response.error);
        return;
      }

      if (response.data) {
        setRecommendations(response.data.recommendations);

        const clubDataPromises = response.data.recommendations.map(rec => 
          getClub(rec.club_id)
        );
        const clubResponses = await Promise.all(clubDataPromises);

        const clubs: Club[] = [];
        clubResponses.forEach(clubResp => {
          if (clubResp.data && !clubResp.error) {
            clubs.push(clubResp.data);
          }
        });

        setRecommendedClubsData(clubs);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setRecommendationsError('Failed to load recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleSaveRecommendation = async (clubId: string) => {
    setSavingBookmarkId(clubId);
    const isAlreadySaved = bookmarkedClubs.some(b => b.club_id === clubId);
    try {
      if (isAlreadySaved) {
        const response = await deleteBookmark(clubId);
        if (response.error) {
          alert(response.error);
          return;
        }
      } else {
        const response = await createBookmark(clubId);
        if (response.error) {
          alert(response.error);
          return;
        }
      }
      await loadBookmarkedClubs();
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setSavingBookmarkId(null);
    }
  };

  const handleToggleNotification = async (type: 'emailNotifications' | 'eventReminders') => {
    const next = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    };
    setNotificationSettings(next);
    try {
      await updateNotificationPreferences({
        email_notifications: next.emailNotifications,
        event_reminders: next.eventReminders,
      });
    } catch (err) {
      console.error('Failed to update notification preferences:', err);
      setNotificationSettings(notificationSettings);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteMyAccount();
      if (response.error) {
        alert(response.error);
        return;
      }
      await logout();
      router.push('/welcome');
    } catch (err) {
      console.error('Delete account error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleUnsubscribe = async (clubId: string) => {
    if (unsubscribingClubId) return;
    
    if (!confirm('Are you sure you want to unsubscribe from this club?')) {
      return;
    }

    setUnsubscribingClubId(clubId);

    try {
      const response = await unsubscribeFromClub(clubId);
      
      if (response.error) {
        alert(response.error || 'Failed to unsubscribe');
        return;
      }

      setSubscriptions(prev => prev.filter(sub => sub.club_id !== clubId));
    } catch (err) {
      console.error('Unsubscribe error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setUnsubscribingClubId(null);
    }
  };

  const handleToggleNotifications = async (clubId: string, currentEnabled: boolean) => {
    try {
      const response = await updateNotificationSettings(clubId, !currentEnabled);
      
      if (response.error) {
        alert(response.error || 'Failed to update notifications');
        return;
      }

      setSubscriptions(prev => prev.map(sub => 
        sub.club_id === clubId 
          ? { ...sub, notification_enabled: !currentEnabled }
          : sub
      ));
    } catch (err) {
      console.error('Toggle notifications error:', err);
      alert('An error occurred. Please try again.');
    }
  };

  const getMeetingScheduleText = (club: Club) => {
    if (club.meeting_schedule && club.meeting_schedule.length > 0) {
      const schedule = club.meeting_schedule[0];
      const timeSlot = schedule.time_slots && schedule.time_slots.length > 0 
        ? schedule.time_slots[0] 
        : 'TBD';
      return `${schedule.day}, ${timeSlot}`;
    }
    return 'TBD';
  };

  const formatSubscribedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.clubDetails);
  const subscribedCount = activeSubscriptions.length;

  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* Main Content */}
      <main className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileContent}>
              <div className={styles.avatar}>
                <span>{userProfile?.display_name?.substring(0, 2).toUpperCase() || 'JD'}</span>
              </div>
              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>{userProfile?.display_name || 'User'}</h1>
                <p className={styles.profileDetails}>
                  {userProfile?.email || 'user@email.edu'} • Computer Science • Class of 2026
                </p>
                <div className={styles.profileStats}>
                  <div className={styles.statTag} style={{ background: '#eff6ff' }}>
                    <span className={styles.statLabel}>Subscribed:</span>
                    <span className={styles.statValue} style={{ color: '#155dfc' }}>
                      {subscribedCount} clubs
                    </span>
                  </div>
                  <div className={styles.statTag} style={{ background: '#f0fdf4' }}>
                    <span className={styles.statLabel}>Events:</span>
                    <span className={styles.statValue} style={{ color: '#00a63e' }}>
                      {attendanceStats ? `${attendanceStats.attended} attended` : '0 attended'}
                    </span>
                  </div>
                  <div className={styles.statTag} style={{ background: '#faf5ff' }}>
                    <span className={styles.statLabel}>Member since:</span>
                    <span className={styles.statValue} style={{ color: '#9810fa' }}>
                      {user?.metadata?.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={styles.tabNavigation}>
            <button 
              className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <img src={overviewIcon} alt="" />
              <span>Overview</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'subscribed' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('subscribed')}
            >
              <img src={subscribeIcon} alt="" />
              <span>Subscribed ({subscribedCount})</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <img src={historyIcon} alt="" />
              <span>History</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'saved' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <img src={savedIcon} alt="" />
              <span>Saved ({bookmarkedClubs.length})</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <img src={settingsIcon} alt="" />
              <span>Settings</span>
            </button>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className={styles.overviewContent}>
              {/* Stats Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statIconBlue}>
                      <img src={clubsFollowingIcon} alt="" />
                    </div>
                    <span className={styles.statNumber}>
                      {isLoadingSubscriptions ? '-' : subscribedCount}
                    </span>
                  </div>
                  <p className={styles.statLabel}>Clubs Subscribed</p>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statIconGreen}>
                      <img src={upcomingEventsIcon} alt="" />
                    </div>
                    <span className={styles.statNumber}>
                      {isLoadingEvents ? '-' : upcomingEvents.length}
                    </span>
                  </div>
                  <p className={styles.statLabel}>Upcoming Events</p>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statIconPurple}>
                      <img src={eventsAttendedIcon} alt="" />
                    </div>
                    <span className={styles.statNumber}>
                      {attendanceStats?.attended || 0}
                    </span>
                  </div>
                  <p className={styles.statLabel}>Events Attended</p>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statIconOrange}>
                      <img src={savedClubsIcon} alt="" />
                    </div>
                    <span className={styles.statNumber}>
                      {isLoadingBookmarks ? '-' : bookmarkedClubs.length}
                    </span>
                  </div>
                  <p className={styles.statLabel}>Saved Clubs</p>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className={styles.twoColumnGrid}>
                {/* My Subscribed Clubs */}
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2>My Subscribed Clubs</h2>
                    <Link href="/student/home/clubs" className={styles.sectionLink}>
                      Browse More →
                    </Link>
                  </div>
                  
                  {isLoadingSubscriptions ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      Loading...
                    </div>
                  ) : activeSubscriptions.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      <p>No subscribed clubs yet.</p>
                    </div>
                  ) : (
                    <div className={styles.clubsList}>
                      {activeSubscriptions.slice(0, 3).map((subscription) => {
                        const club = subscription.clubDetails!;
                        const displayImage = club.logo_url || club.banner_url || roboticsImage;
                        const mainCategory = club.categories && club.categories.length > 0 
                          ? club.categories[0].toUpperCase() 
                          : 'GENERAL';
                        const nextEvent = getMeetingScheduleText(club);

                        return (
                          <div key={subscription.id} className={styles.subscribedClubCard}>
                            <div className={styles.clubCardContent}>
                              <img src={displayImage} alt={club.name} className={styles.clubImage} />
                              <div className={styles.clubInfo}>
                                <span className={styles.clubCategory}>{mainCategory}</span>
                                <h3 className={styles.clubName}>{club.name}</h3>
                                <div className={styles.clubNextEvent}>
                                  <img src={clockIcon} alt="" />
                                  <span>Next: {nextEvent}</span>
                                </div>
                              </div>
                            </div>
                            <Link 
                              href={`/student/home/clubs/${club.id}`}
                              className={styles.viewProfileButton}
                            >
                              View Profile
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h2>Upcoming Events</h2>
                    <Link href="/student/home/calendar" className={styles.sectionLink}>
                      Full Calendar →
                    </Link>
                  </div>
                  
                  {isLoadingEvents ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      Loading...
                    </div>
                  ) : upcomingEvents.length === 0 ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                      <p>No upcoming events in the next 7 days.</p>
                    </div>
                  ) : (
                    <div className={styles.eventsList}>
                      {upcomingEvents.map((event) => {
                        const clubSub = subscriptions.find(sub => sub.club_id === event.club_id);
                        const clubName = clubSub?.clubDetails?.name || 'Unknown Club';
                        const eventDate = new Date(event.start_datetime);
                        const formattedDate = eventDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });

                        return (
                          <div key={event.id} className={styles.eventCard}>
                            <div className={styles.eventContent}>
                              <div className={styles.eventIconBlue}>
                                <img src={calendarIconBlue} alt="" />
                              </div>
                              <div className={styles.eventInfo}>
                                <p className={styles.eventClub}>{clubName}</p>
                                <h3 className={styles.eventTitle}>{event.title}</h3>
                                <p className={styles.eventDate}>{formattedDate}</p>
                              </div>
                            </div>
                            <div className={styles.eventActions}>
                              <Link 
                                href="/student/home/calendar" 
                                className={styles.viewDetailsButton}
                              >
                                View Details
                              </Link>
                              <Link 
                                href="/student/home/calendar" 
                                className={styles.addToCalendarButton}
                              >
                                Add to Calendar
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended for You */}
              <div className={styles.recommendedSection}>
                <div className={styles.sectionHeader}>
                  <h2>Recommended for You</h2>
                  <Link href="/student/home/ai-recommendations" className={styles.sectionLink}>
                    Get More Recommendations →
                  </Link>
                </div>
                
                {isLoadingRecommendations ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                    Loading recommendations...
                  </div>
                ) : recommendationsError ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#e74c3c' }}>
                    <p>{recommendationsError}</p>
                    {recommendationsError.toLowerCase().includes('preference') && (
                      <Link 
                        href="/student/home/ai-recommendations" 
                        style={{ 
                          display: 'inline-block', 
                          marginTop: '10px', 
                          color: '#007bff', 
                          textDecoration: 'underline' 
                        }}
                      >
                        Set your preferences now
                      </Link>
                    )}
                  </div>
                ) : recommendedClubsData.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                    <p>No recommendations available.</p>
                    <Link 
                      href="/student/home/ai-recommendations" 
                      style={{ 
                        display: 'inline-block', 
                        marginTop: '10px', 
                        color: '#007bff', 
                        textDecoration: 'underline' 
                      }}
                    >
                      Set your preferences
                    </Link>
                  </div>
                ) : (
                  <div className={styles.recommendedGrid}>
                    {recommendedClubsData
                      .filter(club => !activeSubscriptions.some(sub => sub.club_id === club.id))
                      .slice(0, 3)
                      .map((club) => {
                      const recommendation = recommendations.find(r => r.club_id === club.id);
                      const matchScore = recommendation ? Math.round((recommendation.score / 13.5) * 100) : 0;
                      
                      return (
                        <div key={club.id} className={styles.recommendedCard}>
                          <img 
                            src={club.logo_url || '/default-club-logo.png'} 
                            alt={club.name} 
                            className={styles.recommendedImage} 
                          />
                          <span className={styles.matchBadge}>{matchScore}% Match</span>
                          <h3 className={styles.recommendedName}>{club.name}</h3>
                          <div className={styles.recommendedActions}>
                            <Link href={`/student/home/clubs/${club.id}`} className={styles.viewButton}>
                              View
                            </Link>
                            <button 
                              className={styles.heartButton}
                              onClick={() => handleSaveRecommendation(club.id)}
                              disabled={savingBookmarkId === club.id}
                            >
                              <img
                                src={bookmarkedClubs.some(b => b.club_id === club.id) ? heartIconFilled : heartIcon}
                                alt="Save"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscribed Tab Content */}
          {activeTab === 'subscribed' && (
            <div className={styles.subscribedContent}>
              {/* Header with Browse More Clubs Button */}
              <div className={styles.subscribedHeader}>
                <div></div>
                <Link href="/student/home/clubs" className={styles.browseMoreButton}>
                  Browse More Clubs
                </Link>
              </div>

              {/* Loading State */}
              {isLoadingSubscriptions && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#666' }}>
                  Loading your subscribed clubs...
                </div>
              )}

              {/* Error State */}
              {subscriptionError && !isLoadingSubscriptions && (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ef4444',
                  backgroundColor: '#fee',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  {subscriptionError}
                </div>
              )}

              {/* Empty State */}
              {!isLoadingSubscriptions && !subscriptionError && activeSubscriptions.length === 0 && (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <p style={{ marginBottom: '20px' }}>You haven't subscribed to any clubs yet.</p>
                  <Link href="/student/home/clubs" className={styles.browseMoreButton}>
                    Browse Clubs
                  </Link>
                </div>
              )}

              {/* Subscribed Clubs List */}
              {!isLoadingSubscriptions && !subscriptionError && activeSubscriptions.length > 0 && (
                <div className={styles.subscribedClubsList}>
                  {activeSubscriptions.map((subscription) => {
                    const club = subscription.clubDetails!;
                    const displayImage = club.banner_url || club.logo_url || roboticsImageLarge;
                    const mainCategory = club.categories && club.categories.length > 0 
                      ? club.categories[0].toUpperCase() 
                      : 'GENERAL';
                    const nextMeeting = getMeetingScheduleText(club);
                    const isUnsubscribing = unsubscribingClubId === club.id;

                    return (
                      <div key={subscription.id} className={styles.subscribedClubCard}>
                        <div className={styles.subscribedClubContent}>
                          <img src={displayImage} alt={club.name} className={styles.subscribedClubImage} />
                          <div className={styles.subscribedClubInfo}>
                            <div className={styles.subscribedClubTags}>
                              <span className={styles.categoryTag}>{mainCategory}</span>
                              <span className={styles.subscribedTag}>Subscribed ✓</span>
                            </div>
                            <h3 className={styles.subscribedClubName}>{club.name}</h3>
                            <p className={styles.subscribedClubDescription}>
                              {club.tagline || club.description}
                            </p>
                            
                            <div className={styles.clubDetailsGrid}>
                              <div className={styles.clubDetail}>
                                <p className={styles.detailLabel}>Next Meeting</p>
                                <p className={styles.detailValue}>{nextMeeting}</p>
                              </div>
                              <div className={styles.clubDetail}>
                                <p className={styles.detailLabel}>Email Notifications</p>
                                <div className={styles.detailValueWithIcon}>
                                  <img src={checkIcon} alt="" className={styles.checkIcon} />
                                  <p className={subscription.notification_enabled ? styles.detailValueEnabled : styles.detailValue}>
                                    {subscription.notification_enabled ? 'Enabled' : 'Disabled'}
                                  </p>
                                </div>
                              </div>
                              <div className={styles.clubDetail}>
                                <p className={styles.detailLabel}>Member Since</p>
                                <p className={styles.detailValue}>
                                  {formatSubscribedDate(subscription.subscribed_at)}
                                </p>
                              </div>
                            </div>

                            <div className={styles.clubActions}>
                              <Link 
                                href={`/student/home/clubs/${club.id}`} 
                                className={styles.viewClubProfileButton}
                              >
                                View Club Profile
                              </Link>
                              <button 
                                className={styles.manageNotificationsButton}
                                onClick={() => handleToggleNotifications(club.id, subscription.notification_enabled)}
                              >
                                <img src={notificationIcon} alt="" />
                                <span>
                                  {subscription.notification_enabled ? 'Disable' : 'Enable'} Notifications
                                </span>
                              </button>
                              <button 
                                className={styles.unsubscribeButton}
                                onClick={() => handleUnsubscribe(club.id)}
                                disabled={isUnsubscribing}
                              >
                                {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* History Tab Content */}
          {activeTab === 'history' && (
            <div className={styles.historyContent}>
              {/* Filter Buttons */}
              <div className={styles.historyHeader}>
                <div className={styles.historyFilters}>
                  <button 
                    className={historyFilter === 'all' ? styles.filterButtonActive : styles.filterButton}
                    onClick={() => setHistoryFilter('all')}
                  >
                    All ({attendanceStats?.total_events || 0})
                  </button>
                  <button 
                    className={historyFilter === 'attended' ? styles.filterButtonActive : styles.filterButton}
                    onClick={() => setHistoryFilter('attended')}
                  >
                    Attended
                  </button>
                  <button 
                    className={historyFilter === 'missed' ? styles.filterButtonActive : styles.filterButton}
                    onClick={() => setHistoryFilter('missed')}
                  >
                    Missed
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              {attendanceStats && (
                <div className={styles.historyStatsGrid}>
                  <div className={styles.historyStatCard}>
                    <div className={styles.historyStatHeader}>
                      <div className={styles.historyStatIconGreen}>
                        <img src={eventsAttendedIconGreen} alt="" />
                      </div>
                      <span className={styles.historyStatNumber}>{attendanceStats.attended}</span>
                    </div>
                    <p className={styles.historyStatLabel}>Events Attended</p>
                  </div>

                  <div className={styles.historyStatCard}>
                    <div className={styles.historyStatHeader}>
                      <div className={styles.historyStatIconRed}>
                        <img src={eventsMissedIconRed} alt="" />
                      </div>
                      <span className={styles.historyStatNumber}>{attendanceStats.missed}</span>
                    </div>
                    <p className={styles.historyStatLabel}>Events Missed</p>
                  </div>

                  <div className={styles.historyStatCard}>
                    <div className={styles.historyStatHeader}>
                      <div className={styles.historyStatIconBlue}>
                        <img src={attendanceRateIconBlue} alt="" />
                      </div>
                      <span className={styles.historyStatNumber}>{Math.round(attendanceStats.attendance_rate)}%</span>
                    </div>
                    <p className={styles.historyStatLabel}>Attendance Rate</p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoadingHistory && (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  Loading attendance history...
                </div>
              )}

              {/* Error State */}
              {historyError && !isLoadingHistory && (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ef4444',
                  backgroundColor: '#fee',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  {historyError}
                </div>
              )}

              {/* Event Timeline */}
              {!isLoadingHistory && !historyError && (
                <div className={styles.eventTimeline}>
                  <h2 className={styles.eventTimelineTitle}>Event Timeline</h2>
                  
                  {attendanceRecords.length === 0 ? (
                    <div style={{ 
                      padding: '60px 20px', 
                      textAlign: 'center', 
                      color: '#666' 
                    }}>
                      No event history found.
                    </div>
                  ) : (() => {
                    const totalPages = Math.ceil(attendanceRecords.length / HISTORY_PAGE_SIZE);
                    const pagedRecords = attendanceRecords.slice(
                      (historyPage - 1) * HISTORY_PAGE_SIZE,
                      historyPage * HISTORY_PAGE_SIZE
                    );

                    return (
                      <>
                        <div className={styles.eventTimelineList}>
                          {pagedRecords.map((record, index) => {
                            const isAttended = record.status === 'attended';
                            const eventDate = new Date(record.event.end_datetime);
                            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            });

                            return (
                              <div
                                key={index}
                                className={isAttended ? styles.eventItemAttended : styles.eventItemMissed}
                              >
                                <div className={styles.eventItemContent}>
                                  <div className={isAttended ? styles.eventIconAttended : styles.eventIconMissed}>
                                    <img src={isAttended ? eventCheckIcon : eventXIcon} alt="" />
                                  </div>
                                  <div className={styles.eventItemInfo}>
                                    <p className={styles.eventItemClub}>{record.club_name}</p>
                                    <h3 className={styles.eventItemEvent}>{record.event.title}</h3>
                                    <p className={styles.eventItemDate}>{formattedDate}</p>
                                  </div>
                                </div>
                                <div className={isAttended ? styles.eventStatusAttended : styles.eventStatusMissed}>
                                  {isAttended ? 'Attended' : 'Missed'}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {totalPages > 1 && (
                          <div className={styles.pagination}>
                            <button
                              className={styles.pageButton}
                              onClick={() => setHistoryPage(p => p - 1)}
                              disabled={historyPage === 1}
                            >
                              ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                className={`${styles.pageButton} ${historyPage === page ? styles.pageButtonActive : ''}`}
                                onClick={() => setHistoryPage(page)}
                              >
                                {page}
                              </button>
                            ))}
                            <button
                              className={styles.pageButton}
                              onClick={() => setHistoryPage(p => p + 1)}
                              disabled={historyPage === totalPages}
                            >
                              ›
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab Content */}
          {activeTab === 'saved' && (
            <div className={styles.savedContent}>
              {/* Header with Get More Recommendations Button */}
              <div className={styles.savedHeader}>
                <div></div>
                <Link href="/student/home/ai-recommendations" className={styles.getRecommendationsButton}>
                  Get More Recommendations
                </Link>
              </div>

              {/* Loading State */}
              {isLoadingBookmarks && (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  color: '#666' 
                }}>
                  Loading saved clubs...
                </div>
              )}

              {/* Error State */}
              {bookmarksError && !isLoadingBookmarks && (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#ef4444',
                  backgroundColor: '#fee',
                  borderRadius: '8px',
                  margin: '20px 0'
                }}>
                  {bookmarksError}
                </div>
              )}

              {/* Empty State */}
              {!isLoadingBookmarks && !bookmarksError && bookmarkedClubs.length === 0 && (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <p style={{ marginBottom: '20px' }}>You haven't saved any clubs yet.</p>
                  <Link href="/student/home/clubs" className={styles.getRecommendationsButton}>
                    Browse Clubs
                  </Link>
                </div>
              )}

              {/* Saved Clubs Card */}
              {!isLoadingBookmarks && !bookmarksError && bookmarkedClubs.length > 0 && (
                <div className={styles.savedClubsCard}>
                  <h2 className={styles.savedClubsTitle}>Saved Clubs</h2>
                  <div className={styles.savedClubsList}>
                    {bookmarkedClubs.map((club) => {
                      const displayImage = club.banner_url || club.logo_url || computerScienceImage;
                      const mainCategory = club.categories && club.categories.length > 0 
                        ? club.categories[0].toUpperCase() 
                        : 'GENERAL';
                      const matchText = club.match_score 
                        ? `${Math.round(club.match_score)}% Match` 
                        : null;
                      const description = club.match_reason || club.club_tagline || club.club_description;
                      const isRemoving = removingBookmarkId === club.club_id;
                      const isSubscribing = subscribingFromBookmark === club.club_id;
                      const isAlreadySubscribed = subscriptions.some(sub => sub.club_id === club.club_id);
                      const isUnsubscribing = unsubscribingClubId === club.club_id;

                      return (
                        <div key={club.bookmark_id} className={styles.savedClubItem}>
                          <div className={styles.savedClubItemContent}>
                            <img src={displayImage} alt={club.club_name} className={styles.savedClubItemImage} />
                            <div className={styles.savedClubItemInfo}>
                              <div className={styles.savedClubItemTags}>
                                <span className={styles.savedClubItemCategory}>{mainCategory}</span>
                                {matchText && (
                                  <span className={styles.savedClubItemMatch}>{matchText}</span>
                                )}
                              </div>
                              <h3 className={styles.savedClubItemName}>{club.club_name}</h3>
                              <p className={styles.savedClubItemDescription}>{description}</p>
                              <div className={styles.savedClubItemActions}>
                                <Link 
                                  href={`/student/home/clubs/${club.club_id}`} 
                                  className={styles.viewProfileButtonBlue}
                                >
                                  View Profile
                                </Link>
                                {isAlreadySubscribed ? (
                                  <button
                                    className={styles.unsubscribeButton}
                                    onClick={() => handleUnsubscribe(club.club_id)}
                                    disabled={isUnsubscribing}
                                  >
                                    {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe'}
                                  </button>
                                ) : (
                                  <button 
                                    className={styles.subscribeButton}
                                    onClick={() => handleSubscribeFromBookmark(club.club_id)}
                                    disabled={isSubscribing}
                                  >
                                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            className={styles.removeButton}
                            onClick={() => handleRemoveBookmark(club.club_id)}
                            disabled={isRemoving}
                            style={{ opacity: isRemoving ? 0.5 : 1 }}
                          >
                            <img src={removeIcon} alt="Remove" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className={styles.settingsContent}>
              {/* Account Information */}
              <div className={styles.settingsSection}>
                <h2 className={styles.settingsSectionTitle}>Account Information</h2>
                <div className={styles.accountInfoForm}>
                  <div className={styles.formNameRow}>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>First Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={fullUserProfile?.first_name || ''}
                        readOnly
                      />
                    </div>
                    <div className={styles.formField}>
                      <label className={styles.formLabel}>Last Name</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={fullUserProfile?.last_name || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={fullUserProfile?.email || userProfile?.email || ''}
                      readOnly
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Student ID</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={fullUserProfile?.student_id || ''}
                      readOnly
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Role</label>
                    <input
                      type="text"
                      className={`${styles.formInput} ${styles.formInputDisabled}`}
                      value={userProfile?.role === 'student' ? 'Student' : userProfile?.role || 'Student'}
                      disabled
                    />
                  </div>
                  <div className={styles.formActions}>
                    <button 
                      className={styles.saveChangesButton}
                      onClick={() => setShowEditProfileModal(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Password & Security */}
              <div className={styles.settingsSection}>
                <h2 className={styles.settingsSectionTitle}>Password & Security</h2>
                <div className={styles.passwordSection}>
                  <div className={styles.passwordInfo}>
                    <div className={styles.passwordIconWrapper}>
                      <img src={passwordIcon} alt="Password" />
                    </div>
                    <div className={styles.passwordDetails}>
                      <p className={styles.passwordTitle}>Password</p>
                      <p className={styles.passwordDate}>••••••••</p>
                    </div>
                  </div>
                  <button 
                    className={styles.changePasswordButton}
                    onClick={() => setShowChangePasswordModal(true)}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className={styles.settingsSection}>
                <h2 className={styles.settingsSectionTitle}>Notification Preferences</h2>
                <div className={styles.notificationsList}>
                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <p className={styles.notificationTitle}>Email Notifications</p>
                      <p className={styles.notificationDescription}>Receive updates about subscribed clubs</p>
                    </div>
                    <button 
                      className={notificationSettings.emailNotifications ? styles.notificationButtonEnabled : styles.notificationButtonDisabled}
                      onClick={() => handleToggleNotification('emailNotifications')}
                    >
                      {notificationSettings.emailNotifications ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className={styles.notificationItem}>
                    <div className={styles.notificationInfo}>
                      <p className={styles.notificationTitle}>Event Reminders</p>
                      <p className={styles.notificationDescription}>Get reminded about upcoming events</p>
                    </div>
                    <button 
                      className={notificationSettings.eventReminders ? styles.notificationButtonEnabled : styles.notificationButtonDisabled}
                      onClick={() => handleToggleNotification('eventReminders')}
                    >
                      {notificationSettings.eventReminders ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className={styles.dangerZoneSection}>
                <h2 className={styles.dangerZoneTitle}>Danger Zone</h2>
                <div className={styles.dangerZoneContent}>
                  <div className={styles.dangerZoneInfo}>
                    <p className={styles.dangerZoneActionTitle}>Delete Account</p>
                    <p className={styles.dangerZoneActionDescription}>Permanently delete your account and all associated data</p>
                  </div>
                  <button 
                    className={styles.deleteAccountButton}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modals */}
          <EditProfileModal 
            isOpen={showEditProfileModal}
            onClose={() => setShowEditProfileModal(false)}
            onSuccess={() => {
              setShowEditProfileModal(false);
            }}
          />
          
          <ChangePasswordModal 
            isOpen={showChangePasswordModal}
            onClose={() => setShowChangePasswordModal(false)}
            onSuccess={() => {
              setShowChangePasswordModal(false);
              alert('Password changed successfully!');
            }}
          />

          {showDeleteModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.deleteModal}>
                <h2 className={styles.deleteModalTitle}>Delete Account</h2>
                <p className={styles.deleteModalMessage}>
                  Are you sure you want to permanently delete your account? This action cannot be undone.
                </p>
                <div className={styles.deleteModalActions}>
                  <button
                    className={styles.deleteModalCancel}
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.deleteModalConfirm}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 Concord Academy ClubAtlas. Connecting students with their perfect campus communities.</p>
        </div>
      </footer>
    </div>
  );
}

