'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getClub, Club } from '@/lib/api/clubs';
import { getEvents, Event } from '@/lib/api/events';
import { getMySubscriptions, subscribeToClub, unsubscribeFromClub } from '@/lib/api/subscriptions';
import { createBookmark, deleteBookmark } from '@/lib/api/bookmarks';
import styles from './ClubProfile.module.css';

const logoIcon = "/images/icons/logo.svg";
const backArrowIcon = "/images/icons/club-detail/back-arrow.svg";
const usersIcon = "/images/icons/club-detail/users.svg";
const calendarBadgeIcon = "/images/icons/club-detail/calendar-badge.svg";
const subscribeIcon = "/images/icons/club-detail/subscribe.svg";
const emailSmallIcon = "/images/icons/club-detail/email-small.svg";
const calendarIcon = "/images/icons/club-detail/calendar.svg";
const arrowRightIcon = "/images/icons/club-detail/arrow-right.svg";
const locationIcon = "/images/icons/club-detail/location.svg";
const attendeesIcon = "/images/icons/club-detail/attendees.svg";
const usersRedIcon = "/images/icons/club-detail/users-red.svg";
const clockBlueIcon = "/images/icons/club-detail/clock-blue.svg";
const contactGreenIcon = "/images/icons/club-detail/contact-green.svg";
const bellIcon = "/images/icons/club-detail/bell.svg";
const emailIcon = "/images/icons/club-detail/email.svg";


interface ClubProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function ClubProfilePage({ params }: ClubProfilePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, userProfile } = useAuth();
  
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClubData();
    if (isAuthenticated) {
      checkSubscriptionStatus();
    }
  }, [id, isAuthenticated]);

  const loadClubData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [clubResponse, eventsResponse] = await Promise.all([
        getClub(id),
        getEvents({ club_id: id, limit: 10 })
      ]);

      if (clubResponse.error || !clubResponse.data) {
        setError('Club not found.');
        return;
      }

      setClub(clubResponse.data);
      
      if (eventsResponse.data) {
        const now = new Date();
        const pastEvents = eventsResponse.data.events.filter(
          event => new Date(event.end_datetime) < now
        ).sort((a, b) => new Date(b.end_datetime).getTime() - new Date(a.end_datetime).getTime());
        setEvents(pastEvents);
      }
    } catch (err) {
      console.error('Failed to load club data:', err);
      setError('Failed to load club data.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await getMySubscriptions();
      if (response.data) {
        const subscribed = response.data.subscriptions.some(
          sub => sub.club_id === id && sub.is_active
        );
        setIsSubscribed(subscribed);
      }
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/student/login');
      return;
    }

    if (isSubscribing) return;

    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        const response = await unsubscribeFromClub(id);
        
        if (response.error) {
          alert(response.error);
          return;
        }

        setIsSubscribed(false);
        alert('Successfully unsubscribed.');
        loadClubData();
      } else {
        const response = await subscribeToClub(id);
        
        if (response.error) {
          alert(response.error);
          return;
        }

        setIsSubscribed(true);
        alert('Successfully subscribed!');
        loadClubData();
      }
    } catch (err) {
      console.error('Subscribe/Unsubscribe failed:', err);
      alert(isSubscribed ? 'Failed to unsubscribe. Please try again.' : 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (error || !club) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <p>{error || 'Club not found.'}</p>
        <button onClick={() => router.back()} style={{ marginTop: '20px', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          ← Back
        </button>
      </div>
    );
  }

  const mainCategory = club.categories?.[0] || 'General';
  const secondaryCategory = club.categories?.[1];
  const firstSchedule = club.meeting_schedule?.[0];
  const dayName = firstSchedule?.day || 'TBA';
  const timeSlot = firstSchedule?.time_slots?.[0] || 'TBA';
  const location = firstSchedule?.location || 'TBA';

  return (
    <div className={styles.pageWrapper}>
      {/* Fixed Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/student/home" className={styles.logo}>
            <div className={styles.logoIcon}>
              <img src={logoIcon} alt="ClubAtlas" width="24" height="24" />
            </div>
            <span className={styles.logoText}>ClubAtlas</span>
          </Link>
          <button onClick={() => router.back()} className={styles.backButton}>
            <img src={backArrowIcon} alt="" width="16" height="16" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Hero Section */}
          <div className={styles.heroCard}>
            <div className={styles.heroBanner}>
              <img 
                src={club.banner_url || club.logo_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=320&fit=crop"} 
                alt={`${club.name} Banner`} 
                className={styles.bannerImage}
              />
              <div className={styles.bannerOverlay}></div>
            </div>
            <div className={styles.heroInfo}>
              <div className={styles.heroLeft}>
                <div className={styles.clubIcon}>
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                  ) : (
                    club.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className={styles.heroDetails}>
                  <div className={styles.categoryTags}>
                    <span className={styles.categoryTagRed}>{mainCategory.toUpperCase()}</span>
                    {secondaryCategory && (
                      <span className={styles.categoryTagBlue}>{secondaryCategory.toUpperCase()}</span>
                    )}
                  </div>
                  <h1 className={styles.clubName}>{club.name}</h1>
                  <p className={styles.clubTagline}>{club.tagline || club.description.substring(0, 60) + '...'}</p>
                  <div className={styles.quickMeta}>
                    <div className={styles.metaItem}>
                      <img src={usersIcon} alt="" width="20" height="20" />
                      <span>{club.stats?.total_subscribers || 0} members</span>
                    </div>
                    {club.stats?.established_date && (
                      <div className={styles.metaItem}>
                        <img src={calendarBadgeIcon} alt="" width="20" height="20" />
                        <span>Est. {club.stats.established_date}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.heroActions}>
                <button 
                  className={styles.subscribeButton}
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                >
                  <img src={subscribeIcon} alt="" width="20" height="20" />
                  {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className={styles.contentGrid}>
            {/* Left Column */}
            <div className={styles.leftColumn}>
              {/* Overview Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Overview</h2>
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>
                      <span className={styles.titleDot}></span>
                      Mission & Purpose
                    </h3>
                    <p className={styles.paragraph}>
                      {club.description}
                    </p>
                    {club.tags && club.tags.length > 0 && (
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {club.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '16px',
                              fontSize: '14px',
                              color: '#666'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {club.leaders && club.leaders.length > 0 && (
                    <div className={styles.subsection}>
                      <h3 className={styles.subsectionTitle}>
                        <span className={styles.titleDot}></span>
                        Leadership Team
                      </h3>
                      <div className={styles.leadershipGrid}>
                        {club.leaders.map((leader, idx) => (
                          <div key={idx} className={styles.leaderCard}>
                            <div className={styles.leaderAvatar}>
                              {leader.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={styles.leaderName}>{leader.name}</div>
                            <div className={styles.leaderRole}>{leader.role}</div>
                            {leader.email && (
                              <div className={styles.leaderEmail}>
                                <img src={emailSmallIcon} alt="" width="12" height="12" />
                                {leader.email}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Meeting Information Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Meeting Information</h2>
                </div>
                <div className={styles.meetingCards}>
                  <div className={styles.meetingCardBlue}>
                    <h3 className={styles.meetingCardTitle}>
                      <img src={calendarIcon} alt="" width="20" height="20" />
                      Regular Schedule
                    </h3>
                    <div className={styles.meetingInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Day:</span>
                        <span className={styles.infoValue}>
                          {firstSchedule ? `Every ${dayName}` : 'TBA'}
                        </span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Time:</span>
                        <span className={styles.infoValue}>{timeSlot}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Type:</span>
                        <span className={styles.infoValue}>
                          {Array.isArray(club.activity_type) 
                            ? club.activity_type.join(', ') 
                            : club.activity_type}
                        </span>
                      </div>
                    </div>
                    <Link href="/student/home/calendar" className={styles.meetingButton}>
                      View on Calendar
                      <img src={arrowRightIcon} alt="" width="16" height="16" />
                    </Link>
                  </div>

                  <div className={styles.meetingCardGreen}>
                    <h3 className={styles.meetingCardTitle}>
                      <img src={locationIcon} alt="" width="20" height="20" />
                      Meeting Location
                    </h3>
                    <div className={styles.meetingInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Location:</span>
                        <span className={styles.infoValue}>{location}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Contact:</span>
                        <span className={styles.infoValue}>
                          {club.contact_email || 'Not provided'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Past Activities Section */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2>Past Activities & Events</h2>
                </div>
                <div className={styles.activitiesList}>
                  {events.length === 0 ? (
                    <p className={styles.paragraph} style={{ color: '#666', textAlign: 'center', padding: '40px 20px' }}>
                      No past events yet. Check back soon!
                    </p>
                  ) : (
                    events.map((event) => {
                      const eventDate = new Date(event.end_datetime);
                      const formattedDate = eventDate.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      });

                      return (
                        <div key={event.id} className={styles.activityCard}>
                          <div className={styles.activityImage}></div>
                          <div className={styles.activityContent}>
                            <div className={styles.activityDate}>{formattedDate}</div>
                            <h4 className={styles.activityTitle}>{event.title}</h4>
                            <p className={styles.activityDescription}>{event.description}</p>
                            <div className={styles.activityAttendees}>
                              <img src={attendeesIcon} alt="" width="16" height="16" />
                              {event.attendees?.length || 0} attendees
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Media Gallery Section */}
              {club.media_urls && club.media_urls.length > 0 && (
                <section className={styles.section}>
                  <div className={styles.sectionHeaderOptional}>
                    <h2>Media Gallery</h2>
                    <span className={styles.optionalBadge}>Optional</span>
                  </div>
                  <div className={styles.sectionContent}>
                    <p className={styles.gallerySubtitle}>Photos, posters, and video thumbnails from club activities</p>
                    <div className={styles.galleryGrid}>
                      {club.media_urls.slice(0, 9).map((url, idx) => (
                        <div key={idx} className={styles.galleryItem}>
                          <img 
                            src={url} 
                            alt={`${club.name} media ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                    {club.media_urls.length > 9 && (
                      <button className={styles.viewAllButton}>
                        View All Photos ({club.media_urls.length})
                      </button>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className={styles.rightColumn}>
              {/* Quick Info */}
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Quick Info</h3>
                <div className={styles.quickInfoList}>
                  <div className={styles.quickInfoItem}>
                    <div className={styles.quickInfoIconRed}>
                      <img src={usersRedIcon} alt="" width="20" height="20" />
                    </div>
                    <div className={styles.quickInfoContent}>
                      <div className={styles.quickInfoLabel}>Members</div>
                      <div className={styles.quickInfoValue}>
                        {club.stats?.total_subscribers || 0} active members
                      </div>
                    </div>
                  </div>
                  {club.stats?.established_date && (
                    <div className={styles.quickInfoItem}>
                      <div className={styles.quickInfoIconBlue}>
                        <img src={clockBlueIcon} alt="" width="20" height="20" />
                      </div>
                      <div className={styles.quickInfoContent}>
                        <div className={styles.quickInfoLabel}>Established</div>
                        <div className={styles.quickInfoValue}>{club.stats.established_date}</div>
                      </div>
                    </div>
                  )}
                  {club.contact_email && (
                    <div className={styles.quickInfoItem}>
                      <div className={styles.quickInfoIconGreen}>
                        <img src={contactGreenIcon} alt="" width="20" height="20" />
                      </div>
                      <div className={styles.quickInfoContent}>
                        <div className={styles.quickInfoLabel}>Contact</div>
                        <div className={styles.quickInfoValue}>{club.contact_email}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Get Updates */}
              <div className={styles.updatesCard}>
                <div className={styles.updatesHeader}>
                  <img src={bellIcon} alt="" width="20" height="20" />
                  Get Updates
                </div>
                <div className={styles.updatesContent}>
                  <p className={styles.updatesDescription}>
                    Subscribe to receive email notifications about meetings, events, and club announcements.
                  </p>
                  <div className={styles.updatesForm}>
                    <button 
                      className={styles.subscribeButtonSidebar}
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                    >
                      <img src={emailIcon} alt="" width="16" height="16" />
                      {isSubscribed ? 'Unsubscribe' : 'Subscribe to Updates'}
                    </button>
                  </div>
                  <p className={styles.updatesFootnote}>
                    Club-specific subscription • Unsubscribe anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2026 Concord Academy ClubAtlas. Connecting students with their perfect campus communities.</p>
        </div>
      </footer>
    </div>
  );
}

