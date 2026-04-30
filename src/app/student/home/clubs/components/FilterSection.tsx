'use client';

import styles from './FilterSection.module.css';

// chevron 아이콘은 CSS로 구현 (저장하지 못함)

interface FilterSectionProps {
  selectedCategory: string;
  selectedPrice: string;
  selectedMembership: string;
  onCategoryChange: (category: string) => void;
  onPriceChange: (price: string) => void;
  onMembershipChange: (membership: string) => void;
}

export default function FilterSection({
  selectedCategory,
  selectedPrice,
  selectedMembership,
  onCategoryChange,
  onPriceChange,
  onMembershipChange,
}: FilterSectionProps) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Category</label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={styles.select}
          >
            <option value="All">All</option>
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
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Meeting Days</label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedPrice}
            onChange={(e) => onPriceChange(e.target.value)}
            className={styles.select}
          >
            <option value="All">All</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Weekend">Weekend</option>
          </select>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Time</label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedMembership}
            onChange={(e) => onMembershipChange(e.target.value)}
            className={styles.select}
          >
            <option value="All">All</option>
            <option value="Morning">Morning (6AM - 12PM)</option>
            <option value="Afternoon">Afternoon (12PM - 6PM)</option>
            <option value="Evening">Evening (6PM - 10PM)</option>
          </select>
        </div>
      </div>
    </div>
  );
}

