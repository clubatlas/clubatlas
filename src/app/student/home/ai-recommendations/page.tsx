'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import styles from './AIRecommendations.module.css';
import Header from '../components/Header';
import ClubRecommendationCard from './components/ClubRecommendationCard';
import { createRecommendationPreferences } from '@/lib/api/users';
import { getRecommendations } from '@/lib/api/recommendations';
import { getClub, Club } from '@/lib/api/clubs';

const SESSION_KEY = 'ai_recommendations_state';

const aiStarIcon = "/images/icons/ai/star.svg";
const targetIcon = "/images/icons/ai/target.svg";
const clockIcon = "/images/icons/ai/clock.svg";
const boltIcon = "/images/icons/ai/bolt.svg";
const assistantIcon = "/images/icons/ai/assistant.svg";
const aiIcon = "/images/icons/ai/ai-avatar.svg";

const CATEGORIES = [
  'Student Leadership and Media',
  'Cultural Affinity Groups',
  'Community Service and Social Justice',
  'Gender Equity and Sexual Health',
  'Mental Wellness',
  'Stem Research and Olympiad',
  'Data Science and Engineering',
  'Finance and Economy',
  'Humanities',
  'Literature, Language, and Philiology',
  'Visual Arts',
  'Performing Arts',
  'Food, Cooking, Cuisine',
  'Sports and Recreations'
];

const ACTIVITY_TYPES = [
  'Online', 'On-Campus', 'Off-Campus', 'Hybrid'
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00',
  '17:00', '18:00', '19:00', '20:00'
];

type Step = 1 | 2 | 3 | 4;

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

function loadFromSession<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[key] ?? fallback;
    }
  } catch {}
  return fallback;
}

export default function AIRecommendationsPage() {
  const [currentStep, setCurrentStep] = useState<Step>(() => loadFromSession('currentStep', 1));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => loadFromSession('selectedCategories', []));
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>(() => loadFromSession('selectedActivityTypes', []));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(() => loadFromSession('selectedTimeSlots', []));
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ClubRecommendation[]>(() => loadFromSession('recommendations', []));
  const [clubsData, setClubsData] = useState<{ [key: string]: Club }>(() => loadFromSession('clubsData', {}));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      currentStep,
      selectedCategories,
      selectedActivityTypes,
      selectedTimeSlots,
      recommendations,
      clubsData,
    }));
  }, [currentStep, selectedCategories, selectedActivityTypes, selectedTimeSlots, recommendations, clubsData]);

  const handleRestart = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentStep(1);
    setSelectedCategories([]);
    setSelectedActivityTypes([]);
    setSelectedTimeSlots([]);
    setRecommendations([]);
    setClubsData({});
    setError(null);
  };

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleBack = () => {
    setCurrentStep((currentStep - 1) as Step);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    if (currentStep === 2 && selectedActivityTypes.length === 0) {
      alert('Please select at least one activity type');
      return;
    }
    if (currentStep === 3 && selectedTimeSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('You must be logged in to get recommendations.');
        setIsLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const preferencesData = {
        preferred_categories: selectedCategories,
        preferred_activity_types: selectedActivityTypes,
        available_time_slots: selectedTimeSlots
      };

      const savePreferencesResponse = await createRecommendationPreferences(preferencesData, token);

      if (savePreferencesResponse.error) {
        setError(`Failed to save preferences: ${savePreferencesResponse.error}`);
        setIsLoading(false);
        return;
      }

      const recommendationsResponse = await getRecommendations({ limit: 10 });

      if (recommendationsResponse.error) {
        setError(`Failed to get recommendations: ${recommendationsResponse.error}`);
        setIsLoading(false);
        return;
      }

      if (recommendationsResponse.data) {
        const recs = recommendationsResponse.data.recommendations || [];
        setRecommendations(recs);
        setCurrentStep(4);

        const clubResults = await Promise.all(
          recs.map(rec =>
            getClub(rec.club_id).catch(err => {
              console.error(`Failed to load club ${rec.club_id}:`, err);
              return null;
            })
          )
        );
        const clubsDataMap: { [key: string]: Club } = {};
        recs.forEach((rec, idx) => {
          const res = clubResults[idx];
          if (res?.data && !res.error) {
            clubsDataMap[rec.club_id] = res.data;
          }
        });
        setClubsData(clubsDataMap);
      }
    } catch (error: any) {
      console.error('Error in recommendation flow:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={styles.pageWrapper}>
      <Header />

      {/* Main Content */}
      <main className={styles.mainWrapper}>
        <div className={styles.container}>
          {/* Page Title */}
          <div className={styles.pageTitle}>
            <h1>AI Club Recommendations</h1>
            <p>Get personalized club suggestions based on your interests and schedule</p>
          </div>

          {/* AI Recommendations Banner */}
          <div className={styles.aiBanner}>
            <div className={styles.aiBannerContent}>
              <div className={styles.aiBannerHeader}>
                <div className={styles.aiIconLarge}>
                  <img src={aiStarIcon} alt="AI" />
                </div>
                <div className={styles.aiBannerText}>
                  <h2>AI Club Recommendations</h2>
                  <p>Powered by intelligent matching algorithms</p>
                </div>
              </div>

              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <img src={targetIcon} alt="Personalized" />
                  </div>
                  <h3>Personalized Matches</h3>
                  <p>Based on your interests</p>
                </div>

                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <img src={clockIcon} alt="Schedule" />
                  </div>
                  <h3>Schedule-Friendly</h3>
                  <p>Fits your availability</p>
                </div>

                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <img src={boltIcon} alt="Instant" />
                  </div>
                  <h3>Instant Results</h3>
                  <p>Real-time recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Chat Interface */}
          <div className={styles.chatInterface}>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderContent}>
                <div className={styles.chatHeaderLeft}>
                  <div className={styles.assistantIcon}>
                    <img src={assistantIcon} alt="Assistant" />
                  </div>
                  <div className={styles.assistantInfo}>
                    <h3>ClubAtlas AI Assistant</h3>
                    <div className={styles.statusIndicator}>
                      <span className={styles.statusDot}></span>
                      <span>Online • Ready to help</span>
                    </div>
                  </div>
                </div>
                {currentStep < 4 && (
                  <div className={styles.headerProgress}>
                    <p className={styles.headerProgressText}>Step {currentStep} of 3</p>
                    <div className={styles.headerProgressBar}>
                      <div
                        className={styles.headerProgressFill}
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className={styles.chatMessages}>

              {/* Welcome Message */}
              <div className={styles.messageGroup}>
                <div className={styles.aiAvatar}>
                  <img src={aiIcon} alt="AI" />
                </div>
                <div className={styles.aiMessage}>
                  <p>Hi! I&apos;m your AI club advisor. I&apos;ll help you discover clubs that perfectly match your interests, schedule, and goals.</p>
                  <p>Let&apos;s get started! I&apos;ll ask you a few quick questions to understand your preferences.</p>
                </div>
              </div>

              {/* Step 1: Categories */}
              <div className={styles.messageGroup}>
                <div className={styles.aiAvatar}>
                  <img src={aiIcon} alt="AI" />
                </div>
                <div className={currentStep === 1 ? styles.aiMessageLarge : styles.aiMessage}>
                  <p>Great! Let&apos;s start by understanding your interests. Which categories of clubs are you interested in? (Select all that apply)</p>
                  {currentStep === 1 && (
                    <>
                      <div className={styles.selectionGrid}>
                        {CATEGORIES.map((item) => (
                          <button
                            key={item}
                            onClick={() => toggleSelection(item, selectedCategories, setSelectedCategories)}
                            className={`${styles.selectionButton} ${selectedCategories.includes(item) ? styles.selectionButtonActive : ''}`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className={styles.selectedItemsDisplay}>
                          <p className={styles.selectedLabel}>Selected ({selectedCategories.length}):</p>
                          <div className={styles.selectedTags}>
                            {selectedCategories.map((item) => (
                              <span key={item} className={styles.selectedTag}>{item}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <button onClick={handleNext} disabled={isLoading} className={styles.nextButton}>
                        Next
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Step 1 User Answer */}
              {currentStep > 1 && (
                <div className={styles.messageGroupRight}>
                  <div className={styles.userAnswerBubble}>
                    <div className={styles.userAnswerTags}>
                      {selectedCategories.map((item) => (
                        <span key={item} className={styles.userAnswerTag}>{item}</span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.userAvatar}><span>U</span></div>
                </div>
              )}

              {/* Step 2: Activity Types */}
              {currentStep >= 2 && (
                <>
                  <div className={styles.messageGroup}>
                    <div className={styles.aiAvatar}>
                      <img src={aiIcon} alt="AI" />
                    </div>
                    <div className={currentStep === 2 ? styles.aiMessageLarge : styles.aiMessage}>
                      <p>Perfect! Now, what type of activities do you prefer?</p>
                      {currentStep === 2 && (
                        <>
                          <div className={styles.selectionGrid}>
                            {ACTIVITY_TYPES.map((item) => (
                              <button
                                key={item}
                                onClick={() => toggleSelection(item, selectedActivityTypes, setSelectedActivityTypes)}
                                className={`${styles.selectionButton} ${selectedActivityTypes.includes(item) ? styles.selectionButtonActive : ''}`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                          {selectedActivityTypes.length > 0 && (
                            <div className={styles.selectedItemsDisplay}>
                              <p className={styles.selectedLabel}>Selected ({selectedActivityTypes.length}):</p>
                              <div className={styles.selectedTags}>
                                {selectedActivityTypes.map((item) => (
                                  <span key={item} className={styles.selectedTag}>{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={styles.buttonRow}>
                            <button onClick={handleBack} className={styles.backButton}>
                              Back
                            </button>
                            <button onClick={handleNext} disabled={isLoading} className={styles.nextButton}>
                              Next
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Step 2 User Answer */}
                  {currentStep > 2 && (
                    <div className={styles.messageGroupRight}>
                      <div className={styles.userAnswerBubble}>
                        <div className={styles.userAnswerTags}>
                          {selectedActivityTypes.map((item) => (
                            <span key={item} className={styles.userAnswerTag}>{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.userAvatar}><span>U</span></div>
                    </div>
                  )}
                </>
              )}

              {/* Step 3: Time Slots */}
              {currentStep >= 3 && (
                <>
                  <div className={styles.messageGroup}>
                    <div className={styles.aiAvatar}>
                      <img src={aiIcon} alt="AI" />
                    </div>
                    <div className={currentStep === 3 ? styles.aiMessageLarge : styles.aiMessage}>
                      <p>Almost there! When are you available for club activities?</p>
                      {currentStep === 3 && (
                        <>
                          <div className={styles.selectionGrid}>
                            {TIME_SLOTS.map((item) => (
                              <button
                                key={item}
                                onClick={() => toggleSelection(item, selectedTimeSlots, setSelectedTimeSlots)}
                                className={`${styles.selectionButton} ${selectedTimeSlots.includes(item) ? styles.selectionButtonActive : ''}`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                          {selectedTimeSlots.length > 0 && (
                            <div className={styles.selectedItemsDisplay}>
                              <p className={styles.selectedLabel}>Selected ({selectedTimeSlots.length}):</p>
                              <div className={styles.selectedTags}>
                                {selectedTimeSlots.map((item) => (
                                  <span key={item} className={styles.selectedTag}>{item}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className={styles.buttonRow}>
                            <button onClick={handleBack} disabled={isLoading} className={styles.backButton}>
                              Back
                            </button>
                            <button onClick={handleNext} disabled={isLoading} className={styles.nextButton}>
                              {isLoading ? 'Processing...' : 'Get Recommendations'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Step 3 User Answer */}
                  {currentStep > 3 && (
                    <div className={styles.messageGroupRight}>
                      <div className={styles.userAnswerBubble}>
                        <div className={styles.userAnswerTags}>
                          {selectedTimeSlots.map((item) => (
                            <span key={item} className={styles.userAnswerTag}>{item}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.userAvatar}><span>U</span></div>
                    </div>
                  )}
                </>
              )}

              {/* Step 4: Results */}
              {currentStep === 4 && (
                <div className={styles.messageGroup}>
                  <div className={styles.aiAvatar}>
                    <img src={aiIcon} alt="AI" />
                  </div>
                  <div className={styles.aiMessageLarge}>
                    <p>Excellent! I&apos;m analyzing your preferences and finding the best club matches for you...</p>

                    {!error && recommendations.length > 0 && (
                      <div className={styles.resultsContainer}>
                        <div className={styles.resultsHeader}>
                          <div className={styles.checkmark}>✓</div>
                          <h3>Found {recommendations.length} Perfect Matches for You!</h3>
                          <p>Based on your interests, activity preferences, and schedule</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className={styles.errorMessage}>
                        <p>{error}</p>
                        <button onClick={handleRestart} className={styles.retryButton}>
                          Try Again
                        </button>
                      </div>
                    )}

                    {!error && recommendations.length === 0 && !isLoading && (
                      <div className={styles.noResultsMessage}>
                        <p>No recommendations found. Try adjusting your preferences.</p>
                        <button onClick={handleRestart} className={styles.retryButton}>
                          Start Over
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Restart Button */}
          {currentStep === 4 && !error && recommendations.length > 0 && !isLoading && (
            <div className={styles.restartButtonWrapper}>
              <button onClick={handleRestart} className={styles.restartButton}>
                Get New Recommendations
              </button>
            </div>
          )}

          {/* Recommendations Results Grid */}
          {currentStep === 4 && !error && recommendations.length > 0 && (
            <div className={styles.recommendationsGrid}>
              {recommendations.map((recommendation) => (
                <ClubRecommendationCard
                  key={recommendation.club_id}
                  recommendation={recommendation}
                  clubData={clubsData[recommendation.club_id]}
                />
              ))}
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
