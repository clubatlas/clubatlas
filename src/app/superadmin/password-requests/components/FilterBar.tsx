'use client';

import styles from './FilterBar.module.css';

const imgIconFilter = "https://www.figma.com/api/mcp/asset/ef513e5d-7165-4c07-845c-4564a33e9452";

interface FilterBarProps {
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterChange: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
}

export default function FilterBar({ filterStatus, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: 'all', label: 'All', count: null },
    { id: 'pending', label: 'Pending', count: 3 },
    { id: 'approved', label: 'Approved', count: 1 },
    { id: 'rejected', label: 'Rejected', count: 1 }
  ] as const;

  return (
    <div className={styles.container}>
      <div className={styles.filterLabel}>
        <img src={imgIconFilter} alt="Filter" className={styles.filterIcon} />
        <span className={styles.filterText}>Filter:</span>
      </div>
      <div className={styles.buttons}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.filterButton} ${filterStatus === filter.id ? styles.active : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
            {filter.count !== null && (
              <span className={styles.badge}>{filter.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}









