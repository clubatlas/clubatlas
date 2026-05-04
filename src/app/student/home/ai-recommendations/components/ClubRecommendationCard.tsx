'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './ClubRecommendationCard.module.css';
import { subscribeToClub, unsubscribeFromClub, checkSubscription } from '@/lib/api/subscriptions';

interface RecommendationReason {
  type: string;
  description: string;
  score_contribution: number;
}

interface ClubRecommendation {
  club_id: string;
  score: number;
  rank: number;
  reasons: RecommendationReason[];
}

interface ClubData {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  categories: string[];
  tags?: string[];
  activity_type: string[];
}

interface Props {
  recommendation: ClubRecommendation;
  clubData?: ClubData;
}

export default function ClubRecommendationCard({ recommendation, clubData }: Props) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const displayName = clubData?.name || `Club ${recommendation.club_id}`;
  const displayDescription = clubData?.description || 'Loading club information...';
  const displayCategories = clubData?.categories || [];
  const displayActivityType = clubData?.activity_type;

  const scorePercentage = Math.min(100, Math.round((recommendation.score / 13.5) * 100));

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await checkSubscription(recommendation.club_id);
        if (response.data) {
          setIsSubscribed(response.data.is_subscribed);
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [recommendation.club_id]);

  const handleSubscribeToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const response = await unsubscribeFromClub(recommendation.club_id);
        if (!response.error) {
          setIsSubscribed(false);
          alert('Successfully unsubscribed from the club!');
        } else {
          alert(`Failed to unsubscribe: ${response.error}`);
        }
      } else {
        const response = await subscribeToClub(recommendation.club_id);
        if (!response.error) {
          setIsSubscribed(true);
          alert('Successfully subscribed to the club!');
        } else {
          alert(`Failed to subscribe: ${response.error}`);
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getReasonStyle = (type: string) => {
    switch (type) {
      case 'category_match':
        return { icon: '🎯', color: '#4A90E2' };
      case 'activity_type_match':
        return { icon: '🏃', color: '#7B68EE' };
      case 'time_match':
        return { icon: '⏰', color: '#50C878' };
      case 'user_behavior':
        return { icon: '👥', color: '#FF6B6B' };
      default:
        return { icon: '✨', color: '#999' };
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.rankBadge}>
          <span className={styles.rankNumber}>#{recommendation.rank}</span>
        </div>
        <div className={styles.scoreContainer}>
          <div className={styles.scoreBar}>
            <div 
              className={styles.scoreBarFill} 
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className={styles.scoreText}>{scorePercentage}% Match</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.clubName}>{displayName}</h3>
        <p className={styles.clubDescription}>{displayDescription}</p>

        {displayCategories.length > 0 && (
          <div className={styles.categoryTags}>
            {displayCategories.slice(0, 3).map((category) => (
              <span key={category} className={styles.categoryTag}>
                {category}
              </span>
            ))}
            {displayActivityType && displayActivityType.length > 0 && (
              <span className={styles.activityTypeTag}>
                {Array.isArray(displayActivityType) 
                  ? displayActivityType.join(', ') 
                  : displayActivityType}
              </span>
            )}
          </div>
        )}

        <div className={styles.reasonsSection}>
          <h4 className={styles.reasonsTitle}>Why we recommend this:</h4>
          <div className={styles.reasonsList}>
            {recommendation.reasons.map((reason, index) => {
              const style = getReasonStyle(reason.type);
              return (
                <div 
                  key={index} 
                  className={styles.reasonItem}
                  style={{ borderLeftColor: style.color }}
                >
                  <span className={styles.reasonIcon}>{style.icon}</span>
                  <span className={styles.reasonText}>{reason.description}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Link 
          href={`/student/home/clubs/${recommendation.club_id}`}
          className={styles.viewDetailsButton}
        >
          View Club Details
        </Link>
        <button 
          onClick={handleSubscribeToggle}
          disabled={isLoading}
          className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribeButtonActive : ''}`}
        >
          {isLoading ? 'Loading...' : (isSubscribed ? 'Saved' : 'Save')}
        </button>
      </div>
    </div>
  );
}


