'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './AllClubsTable.module.css';
import EditClubModal from './EditClubModal';

const searchIcon = "/images/icons/superadmin/all-clubs/search.svg";
const editIcon = "/images/icons/superadmin/all-clubs/edit.svg";
const deleteIcon = "/images/icons/superadmin/all-clubs/delete.svg";

const PAGE_SIZE = 5;

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
  'Sports and Recreations',
];

interface Club {
  id: string;
  name: string;
  description?: string;
  categories: string[];
  activity_type: string[];
  leader_name?: string;
  leader_email?: string;
  total_subscribers: number;
  total_events: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface AllClubsResponse {
  clubs: Club[];
  total: number;
  page: number;
  page_size: number;
}

export default function AllClubsTable() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);

    if (!user) return;

    const controller = new AbortController();

    const fetchClubs = async () => {
      try {
        setLoading(true);
        const token = await getIdToken();
        if (!token) return;

        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (categoryFilter) params.append('category', categoryFilter);
        if (statusFilter) params.append('status', statusFilter);
        params.append('page_size', '100');

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs?${params.toString()}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (response.ok) {
          const data: AllClubsResponse = await response.json();
          setClubs(data.clubs);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load clubs:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchClubs();

    return () => controller.abort();
  }, [searchQuery, categoryFilter, statusFilter, user]);

  const loadClubs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page_size', '100');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data: AllClubsResponse = await response.json();
        setClubs(data.clubs);
      }
    } catch (error) {
      console.error('Failed to load clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club: Club) => {
    setSelectedClub(club);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClub(null);
  };

  const handleEditSuccess = () => {
    loadClubs();
  };

  const handleDeleteClick = (club: Club) => {
    setDeletingClub(club);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingClub(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClub || !user) return;
    try {
      setDeleteLoading(true);
      const token = await getIdToken();
      if (!token) return;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clubs/${deletingClub.id}?hard_delete=true`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      if (response.ok) {
        setIsDeleteModalOpen(false);
        setDeletingClub(null);
        loadClubs();
      }
    } catch (error) {
      console.error('Failed to delete club:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(clubs.length / PAGE_SIZE);
  const paginatedClubs = clubs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search clubs..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className={styles.dropdown}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className={styles.dropdown}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.columnClubName}>Club Name</div>
          <div className={styles.columnCategory}>Category</div>
          <div className={styles.columnLeader}>Leader</div>
          <div className={styles.columnMembers}>Members</div>
          <div className={styles.columnStatus}>Status</div>
          <div className={styles.columnActions}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              Loading clubs...
            </div>
          ) : clubs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              No clubs found
            </div>
          ) : (
            paginatedClubs.map((club, index) => (
              <div key={club.id} className={`${styles.tableRow} ${index === 0 ? styles.tableRowFirst : ''}`}>
                <div className={styles.columnClubName}>
                  <Link href={`/student/home/clubs/${club.id}`} className={styles.clubNameLink}>
                    {club.name.length > 20 ? club.name.slice(0, 20) + '...' : club.name}
                  </Link>
                </div>
                <div className={styles.columnCategory}>
                  <span className={styles.categoryBadge}>
                    {(() => { const c = club.categories[0] || 'N/A'; return c.length > 20 ? c.slice(0, 20) + '...' : c; })()}
                  </span>
                </div>
                <div className={styles.columnLeader}>
                  <span className={styles.leaderText}>
                    {club.leader_name || 'No leader'}
                  </span>
                </div>
                <div className={styles.columnMembers}>
                  <span className={styles.membersText}>
                    {club.total_subscribers.toLocaleString()}
                  </span>
                </div>
                <div className={styles.columnStatus}>
                  <span className={`${styles.statusBadge} ${styles[`status${club.status.toUpperCase()}`]}`}>
                    {club.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.columnActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEdit(club)}
                  >
                    <img src={editIcon} alt="Edit" />
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDeleteClick(club)}
                  >
                    <img src={deleteIcon} alt="Delete" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      )}

      {selectedClub && (
        <EditClubModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          club={selectedClub}
          onSuccess={handleEditSuccess}
        />
      )}

      {isDeleteModalOpen && deletingClub && (
        <div className={styles.modalOverlay}>
          <div className={styles.deleteModal}>
            <h3 className={styles.deleteModalTitle}>Delete Club</h3>
            <p className={styles.deleteModalMessage}>
              Are you sure you want to permanently delete <strong>{deletingClub.name}</strong>? This action cannot be undone.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                className={styles.cancelButton}
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteButton}
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






