'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './PendingApprovals.module.css';
import ApprovalModal from './ApprovalModal';

const warningIcon = "/images/icons/superadmin/pending-warning.svg";
const COLLAPSED_LIMIT = 3;

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  timestamp: string;
  metadata?: any;
}

interface PendingApprovalsResponse {
  approvals: ApprovalItem[];
  total: number;
}

export default function PendingApprovals() {
  const { user } = useAuth();
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'deny';
    item: ApprovalItem | null;
  }>({
    isOpen: false,
    type: 'approve',
    item: null,
  });

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/pending-approvals?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: PendingApprovalsResponse = await response.json();
        const items = data.approvals.map(approval => {
          const date = new Date(approval.timestamp);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          let timeAgo;
          if (diffDays > 0) {
            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHours > 0) {
            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            timeAgo = 'Just now';
          }

          return {
            ...approval,
            timestamp: timeAgo
          };
        });
        setApprovalItems(items);
      }
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item: ApprovalItem) => {
    setModalState({
      isOpen: true,
      type: 'approve',
      item,
    });
  };

  const handleDeny = (item: ApprovalItem) => {
    setModalState({
      isOpen: true,
      type: 'deny',
      item,
    });
  };

  const handleConfirm = async () => {
    if (!user || !modalState.item) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const item = modalState.item;
      
      let endpoint = '';
      let body: Record<string, string> = {};

      if (item.type === 'leader_request') {
        endpoint = modalState.type === 'approve'
          ? `/api/admin/leader-requests/${item.id}/approve`
          : `/api/admin/leader-requests/${item.id}/reject`;
        body = modalState.type === 'approve'
          ? { assign_to_club_id: item.metadata?.requested_club_id || '', admin_notes: '' }
          : { admin_notes: 'Denied by super admin' };
      } else if (item.type === 'club_creation_request') {
        endpoint = modalState.type === 'approve'
          ? `/api/admin/club-creation-requests/${item.id}/approve`
          : `/api/admin/club-creation-requests/${item.id}/reject`;
        body = modalState.type === 'approve'
          ? { admin_notes: '' }
          : { admin_notes: 'Denied by super admin' };
      }

      if (endpoint) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        );

        if (response.ok) {
          alert(`Request ${modalState.type === 'approve' ? 'approved' : 'denied'} successfully`);
          setModalState({ isOpen: false, type: 'approve', item: null });
          loadApprovals();
        } else {
          const error = await response.json();
          alert(`Failed to ${modalState.type} request: ${error.detail || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error(`Failed to ${modalState.type} request:`, error);
      alert(`Failed to ${modalState.type} request`);
    }
  };

  const handleClose = () => {
    setModalState({ isOpen: false, type: 'approve', item: null });
  };

  const displayItems = expanded
    ? approvalItems
    : approvalItems.slice(0, COLLAPSED_LIMIT);
  const hasMore = approvalItems.length > COLLAPSED_LIMIT;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <img src={warningIcon} alt="Pending Approvals" className={styles.headerIcon} />
            <h3 className={styles.title}>Pending Approvals</h3>
            <div className={styles.badge}>...</div>
          </div>
        </div>
        <div className={styles.list}>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <img src={warningIcon} alt="Pending Approvals" className={styles.headerIcon} />
            <h3 className={styles.title}>Pending Approvals</h3>
            <div className={styles.badge}>{approvalItems.length}</div>
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={styles.viewToggle}
            >
              {expanded ? 'View less' : 'View more'}
            </button>
          )}
        </div>
        <div className={styles.list}>
          {approvalItems.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No pending approvals
            </div>
          ) : (
            displayItems.map((item, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.itemContent}>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.itemSubtitle}>{item.subtitle}</p>
                <p className={styles.itemTimestamp}>{item.timestamp}</p>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.approveButton}
                  onClick={() => handleApprove(item)}
                >
                  Approve
                </button>
                <button 
                  className={styles.denyButton}
                  onClick={() => handleDeny(item)}
                >
                  Deny
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {modalState.item && (
        <ApprovalModal
          isOpen={modalState.isOpen}
          onClose={handleClose}
          type={modalState.type}
          title={modalState.item.title}
          subtitle={modalState.item.subtitle}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

