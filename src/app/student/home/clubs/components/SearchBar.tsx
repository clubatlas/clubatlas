'use client';

import styles from './SearchBar.module.css';

const searchIcon = "/images/icons/clubs/search.svg";
const filterIcon = "/images/icons/clubs/filter.svg";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchBar}>
        <img src={searchIcon} alt="" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by club name, category, or interest..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      <button className={styles.filterButton}>
        <img src={filterIcon} alt="" className={styles.filterIcon} />
        <span>Filters</span>
      </button>
    </div>
  );
}

