'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LeadersTable.module.css';
import EditLeaderModal from './EditLeaderModal';
import { getClubLeaders, removeLeaderFromClub, ClubLeaderInfo } from '@/lib/api/superadmin';

const editIcon = "/images/icons/superadmin/club-leaders/edit.svg";
const deleteIcon = "/images/icons/superadmin/club-leaders/delete.svg";

interface Leader {
  id: string;
  rowKey: string;
  name: string;
  initial: string;
  email: string;
  club: string;
  clubId: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface LeadersTableProps {
  searchQuery?: string;
}

export default function LeadersTable({ searchQuery = '' }: LeadersTableProps) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 5;

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLeaders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadLeaders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getClubLeaders({ status_filter: 'active' });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const mappedLeaders: Leader[] = response.data.leaders.flatMap((leaderInfo: ClubLeaderInfo) => {
          const initial = leaderInfo.display_name
            ? leaderInfo.display_name.charAt(0).toUpperCase()
            : leaderInfo.email.charAt(0).toUpperCase();

          const clubNames = leaderInfo.managed_club_names.length > 0
            ? leaderInfo.managed_club_names
            : ['No Club'];
          const clubIds = leaderInfo.managed_club_ids.length > 0
            ? leaderInfo.managed_club_ids
            : [''];

          return clubNames.map((clubName, idx) => ({
            id: leaderInfo.uid,
            rowKey: `${leaderInfo.uid}_${clubIds[idx] || clubName}`,
            name: leaderInfo.display_name || leaderInfo.email,
            initial,
            email: leaderInfo.email,
            club: clubName,
            clubId: clubIds[idx] || '',
            role: 'Cohead',
            status: leaderInfo.status.toUpperCase() as 'ACTIVE' | 'INACTIVE',
          }));
        });

        setLeaders(mappedLeaders);
        setSelectedRowKeys(new Set());
      }
    } catch (err) {
      console.error('Failed to load leaders:', err);
      setError('Failed to load club leaders');
    } finally {
      setIsLoading(false);
    }
  };

  const query = searchQuery.toLowerCase();
  const filteredLeaders = query
    ? leaders.filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.email.toLowerCase().includes(query)
      )
    : leaders;

  const totalPages = Math.ceil(filteredLeaders.length / PAGE_SIZE);
  const pagedLeaders = filteredLeaders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allCurrentPageSelected =
    pagedLeaders.length > 0 && pagedLeaders.every((l) => selectedRowKeys.has(l.rowKey));
  const someCurrentPageSelected = pagedLeaders.some((l) => selectedRowKeys.has(l.rowKey));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
    }
  }, [someCurrentPageSelected, allCurrentPageSelected]);

  const handleSelectAll = () => {
    if (allCurrentPageSelected) {
      setSelectedRowKeys((prev) => {
        const next = new Set(prev);
        pagedLeaders.forEach((l) => next.delete(l.rowKey));
        return next;
      });
    } else {
      setSelectedRowKeys((prev) => {
        const next = new Set(prev);
        pagedLeaders.forEach((l) => next.add(l.rowKey));
        return next;
      });
    }
  };

  const handleSelectRow = (rowKey: string) => {
    setSelectedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  const handleEdit = (leader: Leader) => {
    setSelectedLeader(leader);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLeader(null);
  };

  const handleEditSuccess = async () => {
    await loadLeaders();
  };

  const handleDelete = async (leaderId: string, clubId: string, clubName: string) => {
    if (!confirm(`Are you sure you want to remove this leader from "${clubName}"? If this is their only club, they will be reverted to student role.`)) {
      return;
    }

    try {
      const response = await removeLeaderFromClub(leaderId, clubId);

      if (response.error) {
        alert(`Failed to remove leader: ${response.error}`);
        return;
      }

      await loadLeaders();
    } catch (err) {
      console.error('Failed to remove leader from club:', err);
      alert('Failed to remove leader from club');
    }
  };

  const handleBulkDelete = async () => {
    const selectedLeaders = leaders.filter((l) => selectedRowKeys.has(l.rowKey));
    if (selectedLeaders.length === 0) return;

    const preview = selectedLeaders
      .slice(0, 5)
      .map((l) => `• ${l.name} (${l.club})`)
      .join('\n');
    const moreText = selectedLeaders.length > 5 ? `\n...and ${selectedLeaders.length - 5} more` : '';

    if (
      !confirm(
        `Are you sure you want to remove ${selectedLeaders.length} leader(s)?\n\n${preview}${moreText}\n\nLeaders with no remaining clubs will be reverted to student role.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const errors: string[] = [];

    for (const leader of selectedLeaders) {
      try {
        const response = await removeLeaderFromClub(leader.id, leader.clubId);
        if (response.error) {
          errors.push(`${leader.name}: ${response.error}`);
        }
      } catch {
        errors.push(`${leader.name}: Failed to remove`);
      }
    }

    if (errors.length > 0) {
      alert(`Some deletions failed:\n${errors.join('\n')}`);
    }

    setIsDeleting(false);
    await loadLeaders();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyMessage} style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
          Loading club leaders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyMessage} style={{ padding: '40px 20px', textAlign: 'center', color: '#e74c3c' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {selectedRowKeys.size > 0 && (
        <div className={styles.bulkActionBar}>
          <span className={styles.bulkActionCount}>
            {selectedRowKeys.size} selected
          </span>
          <button
            className={styles.bulkDeleteButton}
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : `Delete Selected (${selectedRowKeys.size})`}
          </button>
          <button
            className={styles.bulkCancelButton}
            onClick={() => setSelectedRowKeys(new Set())}
            disabled={isDeleting}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className={styles.tableHeader}>
        <div className={styles.checkboxCell}>
          <input
            ref={selectAllRef}
            type="checkbox"
            className={styles.checkbox}
            checked={allCurrentPageSelected}
            onChange={handleSelectAll}
            aria-label="Select all on this page"
          />
        </div>
        <div className={styles.headerCell} style={{ width: '160px' }}>Name</div>
        <div className={styles.headerCell} style={{ width: '280px' }}>Email</div>
        <div className={styles.headerCell} style={{ width: '131.656px' }}>Club</div>
        <div className={styles.headerCell} style={{ width: '131.672px' }}>Role</div>
        <div className={styles.headerCell} style={{ width: '57.828px' }}>Status</div>
        <div className={styles.headerCell} style={{ width: '57.828px' }}>Actions</div>
      </div>

      <div className={styles.tableBody}>
        {pagedLeaders.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
            {query ? 'No leaders found matching your search.' : 'No active club leaders found.'}
          </div>
        ) : (
          pagedLeaders.map((leader) => (
            <div
              key={leader.rowKey}
              className={`${styles.tableRow} ${selectedRowKeys.has(leader.rowKey) ? styles.tableRowSelected : ''}`}
            >
              <div className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedRowKeys.has(leader.rowKey)}
                  onChange={() => handleSelectRow(leader.rowKey)}
                  aria-label={`Select ${leader.name}`}
                />
              </div>

              <div className={styles.nameCell} style={{ width: '160px' }}>
                <div className={styles.avatar}>{leader.initial}</div>
                <span className={styles.name}>{leader.name}</span>
              </div>

              <div className={styles.emailCell} style={{ width: '280px' }}>
                {leader.email}
              </div>

              <div className={styles.clubCell} style={{ width: '131.656px' }}>
                {leader.club}
              </div>

              <div className={styles.roleCell} style={{ width: '131.672px' }}>
                {leader.role}
              </div>

              <div className={styles.statusCell} style={{ width: '57.828px' }}>
                <span className={`${styles.statusBadge} ${styles[leader.status.toLowerCase()]}`}>
                  {leader.status}
                </span>
              </div>

              <div className={styles.actionsCell} style={{ width: '57.828px' }}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleEdit(leader)}
                  aria-label="Edit"
                >
                  <img src={editIcon} alt="Edit" className={styles.actionIcon} />
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleDelete(leader.id, leader.clubId, leader.club)}
                  aria-label="Delete"
                >
                  <img src={deleteIcon} alt="Delete" className={styles.actionIcon} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      <EditLeaderModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        leader={selectedLeader}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
