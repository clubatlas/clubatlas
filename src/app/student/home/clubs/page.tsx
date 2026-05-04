'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './BrowseClubs.module.css';
import { getClubs, Club, MeetingSchedule } from '@/lib/api/clubs';
import { subscribeToClub, unsubscribeFromClub, getMySubscriptions } from '@/lib/api/subscriptions';
import Header from '../components/Header';

const searchIcon = "/images/icons/clubs/search.svg";
const filterIcon = "/images/icons/clubs/filter.svg";
const heartIcon = "/images/icons/clubs/heart.svg";
const clockIcon = "/images/icons/clubs/clock.svg";
const locationIcon = "/images/icons/clubs/location.svg";
const usersIcon1 = "/images/icons/clubs/users.svg";
const usersIcon2 = "/images/icons/clubs/users.svg";

export default function BrowseClubsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedActivityType, setSelectedActivityType] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All');
  const [selectedCommitment, setSelectedCommitment] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  
  const [clubs, setClubs] = useState<Club[]>([]);
  const [totalClubs, setTotalClubs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribedClubIds, setSubscribedClubIds] = useState<Set<string>>(new Set());
  const [subscribingClubId, setSubscribingClubId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  
  const PAGE_SIZE = 500;

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    loadClubs(1, true);
  }, [selectedCategory]);

  const loadSubscriptions = async () => {
    try {
      const response = await getMySubscriptions();
      if (response.data) {
        const clubIds = new Set(
          response.data.subscriptions.map(sub => sub.club_id)
        );
        setSubscribedClubIds(clubIds);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    }
  };

  const loadClubs = async (page: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
      setClubs([]);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const params: any = {
        page,
        page_size: PAGE_SIZE,
      };

      if (selectedCategory !== 'All') {
        params.categories = selectedCategory;
      }

      const response = await getClubs(params);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        if (reset) {
          setClubs(response.data.clubs);
        } else {
          setClubs(prev => [...prev, ...response.data!.clubs]);
        }
        setTotalClubs(response.data.total);
        setCurrentPage(page);
      }
    } catch (err) {
      setError('Failed to load clubs. Please try again.');
      console.error('Error loading clubs:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadClubs(currentPage + 1, false);
  };

  const handleSubscribeToggle = async (clubId: string) => {
    if (subscribingClubId) return;
    
    setSubscribingClubId(clubId);
    const isCurrentlySubscribed = subscribedClubIds.has(clubId);

    try {
      if (isCurrentlySubscribed) {
        const response = await unsubscribeFromClub(clubId);
        if (!response.error) {
          setSubscribedClubIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(clubId);
            return newSet;
          });
        } else {
          alert(response.error || 'Failed to unsubscribe');
        }
      } else {
        const response = await subscribeToClub(clubId);
        if (!response.error) {
          setSubscribedClubIds(prev => {
            const newSet = new Set(prev);
            newSet.add(clubId);
            return newSet;
          });
        } else {
          alert(response.error || 'Failed to subscribe');
        }
      }
    } catch (err) {
      console.error('Subscribe toggle error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubscribingClubId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedActivityType('All');
    setSelectedDay('All');
    setSelectedTime('All');
    setSelectedCommitment('All');
  };

  const hasActiveFilters = searchQuery !== '' || 
                          selectedCategory !== 'All' || 
                          selectedActivityType !== 'All' || 
                          selectedDay !== 'All' || 
                          selectedTime !== 'All' || 
                          selectedCommitment !== 'All';

  const filteredAndSortedClubs = clubs.filter(club => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
                         club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    // Activity Type filter
    const matchesActivityType = selectedActivityType === 'All' ||
      (Array.isArray(club.activity_type)
        ? club.activity_type.includes(selectedActivityType)
        : club.activity_type === selectedActivityType);
    
    // Day filter
    let matchesDay = true;
    if (selectedDay !== 'All') {
      const schedule = club.meeting_schedule;
      if (!schedule || schedule.length === 0) {
        matchesDay = false;
      } else {
        matchesDay = schedule.some(s => s.day === selectedDay);
      }
    }

    // Time filter
    let matchesTime = true;
    if (selectedTime !== 'All') {
      const schedule = club.meeting_schedule;
      if (!schedule || schedule.length === 0) {
        matchesTime = false;
      } else {
        matchesTime = schedule.some(s => {
          if (!s.time_slots || s.time_slots.length === 0) return false;
          const hour = parseInt(s.time_slots[0].split(':')[0]);
          if (selectedTime === 'Morning') return hour >= 6 && hour < 12;
          if (selectedTime === 'Afternoon') return hour >= 12 && hour < 17;
          if (selectedTime === 'Evening') return hour >= 17 && hour < 23;
          return false;
        });
      }
    }
    
    return matchesSearch && matchesActivityType && matchesDay && matchesTime;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'members') {
      return (b.stats?.total_subscribers ?? 0) - (a.stats?.total_subscribers ?? 0);
    }
    if (sortBy === 'recent') {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  const hasMore = clubs.length < totalClubs;

  const getMeetingInfo = (club: Club) => {
    if (club.meeting_schedule && club.meeting_schedule.length > 0) {
      const dayAbbreviations = club.meeting_schedule
        .map(s => s.day)
        .filter(Boolean)
        .map(day => day.charAt(0))
        .join(' / ');

      const allTimes = new Set<string>();
      club.meeting_schedule.forEach(s => {
        if (s.time_slots && s.time_slots.length > 0) {
          s.time_slots.forEach(t => allTimes.add(t));
        }
      });
      const sortedTimes = Array.from(allTimes).sort().join(', ');

      const location = club.meeting_schedule[0].location || 'TBD';
      
      return {
        day: dayAbbreviations || 'TBD',
        time: sortedTimes || 'TBD',
        location: location
      };
    }
    return { day: 'TBD', time: 'TBD', location: 'TBD' };
  };

  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* Main Content */}
      <div className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Browse Clubs</h1>
            <p className={styles.subtitle}>
              Discover your perfect campus community from {totalClubs} amazing clubs
            </p>
          </div>

          {/* Search and Filter Card */}
          <div className={styles.searchCard}>
            <div className={styles.searchRow}>
              <div className={styles.searchInputWrapper}>
                <img src={searchIcon} alt="" width="20" height="20" className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by club name, category, or interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button 
                className={styles.filterButton}
                onClick={() => setShowFilters(!showFilters)}
              >
                <img src={filterIcon} alt="" width="20" height="20" />
                Filters
              </button>
            </div>

            {showFilters && (
              <>
                <div className={styles.filterGrid}>
                  <div className={styles.filterItem}>
                    <label className={styles.filterLabel}>Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="All">All Categories</option>
                      <option value="Student Leadership and Media">Student Leadership and Media</option>
                      <option value="Cultural Affinity Groups">Cultural Affinity Groups</option>
                      <option value="Community Service and Social Justice">Community Service and Social Justice</option>
                      <option value="Gender Equity and Sexual Health">Gender Equity and Sexual Health</option>
                      <option value="Mental Wellness">Mental Wellness</option>
                      <option value="Stem Research and Olympiad">Stem Research and Olympiad</option>
                      <option value="Data Science and Engineering">Data Science and Engineering</option>
                      <option value="Finance and Economy">Finance and Economy</option>
                      <option value="Humanities">Humanities</option>
                      <option value="Literature, Language, and Philiology">Literature, Language, and Philiology</option>
                      <option value="Visual Arts">Visual Arts</option>
                      <option value="Performing Arts">Performing Arts</option>
                      <option value="Food, Cooking, Cuisine">Food, Cooking, Cuisine</option>
                      <option value="Sports and Recreations">Sports and Recreations</option>
                    </select>
                  </div>

                  <div className={styles.filterItem}>
                    <label className={styles.filterLabel}>Activity Type</label>
                    <select
                      value={selectedActivityType}
                      onChange={(e) => setSelectedActivityType(e.target.value)}
                      className={styles.filterSelectHighlight}
                    >
                      <option value="All">All Types</option>
                      <option value="Online">Online</option>
                      <option value="On-Campus">On-Campus</option>
                      <option value="Off-Campus">Off-Campus</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className={styles.filterItem}>
                    <label className={styles.filterLabel}>Meeting Day</label>
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="All">All Days</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                  </div>

                  <div className={styles.filterItem}>
                    <label className={styles.filterLabel}>Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="All">All Times</option>
                      <option value="Morning">Morning (6AM-12PM)</option>
                      <option value="Afternoon">Afternoon (12PM-5PM)</option>
                      <option value="Evening">Evening (5PM-11PM)</option>
                    </select>
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className={styles.filterActions}>
                    <button 
                      className={styles.clearFiltersButton}
                      onClick={handleClearFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {isLoading ? 'Loading...' : `${filteredAndSortedClubs.length} clubs found`}
            </p>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by: Name</option>
              <option value="members">Sort by: Members</option>
              <option value="recent">Sort by: Recently Added</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#ef4444',
              backgroundColor: '#fee',
              borderRadius: '8px',
              margin: '20px 0'
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center',
              color: '#666'
            }}>
              Loading clubs...
            </div>
          )}

          {/* Clubs Grid */}
          {!isLoading && !error && (
            <div className={styles.clubsGrid}>
              {filteredAndSortedClubs.map((club) => {
                const meetingInfo = getMeetingInfo(club);
                const displayImage = club.banner_url || club.logo_url || 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=192&fit=crop';
                const mainCategory = club.categories && club.categories.length > 0 ? club.categories[0] : 'General';
                const memberCount = club.stats?.total_subscribers || 0;
                const isSubscribed = subscribedClubIds.has(club.id);
                const isSubscribing = subscribingClubId === club.id;

                return (
                  <div key={club.id} className={styles.clubCard}>
                    <div className={styles.clubImageWrapper}>
                      <img src={displayImage} alt={club.name} className={styles.clubImage} />
                      <div className={styles.clubImageOverlay}></div>
                      <span className={styles.clubCategory}>{mainCategory}</span>
                      <h3 className={styles.clubName}>{club.name}</h3>
                    </div>

                    <div className={styles.clubContent}>
                      <p className={styles.clubDescription}>
                        {club.tagline || club.description}
                      </p>

                      <div className={styles.clubMeta}>
                        <div className={styles.metaRow}>
                          <img src={clockIcon} alt="" width="16" height="16" />
                          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: '600' }}>{meetingInfo.day}</span>
                            <span style={{ fontSize: '0.9em', color: '#666' }}>{meetingInfo.time}</span>
                          </span>
                        </div>
                        <div className={styles.metaRow}>
                          <img src={locationIcon} alt="" width="16" height="16" />
                          <span>{meetingInfo.location}</span>
                        </div>
                        <div className={styles.metaRow}>
                          <img src={usersIcon1} alt="" width="16" height="16" />
                          <span>{memberCount} members</span>
                        </div>
                      </div>

                      <div className={styles.clubActions}>
                        <Link href={`/student/home/clubs/${club.id}`} className={styles.viewButton}>
                          View Profile
                        </Link>
                        <button
                          className={styles.shareButton}
                          onClick={() => handleSubscribeToggle(club.id)}
                          disabled={isSubscribing}
                          style={{
                            opacity: isSubscribing ? 0.5 : 1,
                            backgroundColor: isSubscribed ? '#ff4444' : undefined,
                            cursor: isSubscribing ? 'not-allowed' : 'pointer'
                          }}
                          title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                        >
                          <img
                            src={heartIcon}
                            alt={isSubscribed ? 'Subscribed' : 'Subscribe'}
                            width="20"
                            height="20"
                            style={{ filter: isSubscribed ? 'brightness(0) invert(1)' : 'none' }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredAndSortedClubs.length === 0 && (
            <div style={{ 
              padding: '60px 20px', 
              textAlign: 'center',
              color: '#666'
            }}>
              No clubs found. Try adjusting your filters.
            </div>
          )}

          {/* Load More Button */}
          {!isLoading && !error && hasMore && filteredAndSortedClubs.length > 0 && (
            <div className={styles.loadMoreWrapper}>
              <button 
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load More Clubs'}
              </button>
            </div>
          )}
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

