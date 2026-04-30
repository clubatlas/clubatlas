'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import { getAllLeaderRequests, approveLeaderRequest, rejectLeaderRequest } from '@/lib/api/admin';
import { LeaderAccessRequestResponse } from '@/lib/api/auth';
import styles from './PendingRequestsTable.module.css';
import ApproveRequestModal from './ApproveRequestModal';
import RejectRequestModal from './RejectRequestModal';

const approveIcon = "/images/icons/superadmin/club-leaders/icon-check.svg";
const rejectIcon = "/images/icons/superadmin/club-leaders/icon-reject.svg";

export default function PendingRequestsTable() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaderAccessRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaderAccessRequestResponse | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getIdToken();
      if (!token) return;

      const response = await getAllLeaderRequests(token, 'pending');
      if (response.data) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request: LeaderAccessRequestResponse) => {
    setSelectedRequest(request);
    setIsApproveModalOpen(true);
  };

  const handleReject = (request: LeaderAccessRequestResponse) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading pending requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No pending requests</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell} style={{ width: '180px' }}>Name</div>
          <div className={styles.headerCell} style={{ width: '200px' }}>Email</div>
          <div className={styles.headerCell} style={{ width: '150px' }}>Requested Club</div>
          <div className={styles.headerCell} style={{ width: '120px' }}>Position</div>
          <div className={styles.headerCell} style={{ width: '100px' }}>Date</div>
          <div className={styles.headerCell} style={{ width: '100px' }}>Actions</div>
        </div>

        <div className={styles.tableBody}>
          {requests.map((request) => (
            <div key={request.id} className={styles.tableRow}>
              <div className={styles.nameCell} style={{ width: '180px' }}>
                <div className={styles.avatar}>
                  {request.display_name.substring(0, 1).toUpperCase()}
                </div>
                <span className={styles.name}>{request.display_name}</span>
              </div>
              
              <div className={styles.emailCell} style={{ width: '200px' }}>
                {request.email}
              </div>
              
              <div className={styles.clubCell} style={{ width: '150px' }}>
                {request.requested_club_name || 'N/A'}
              </div>
              
              <div className={styles.roleCell} style={{ width: '120px' }}>
                {request.requested_role}
              </div>
              
              <div className={styles.dateCell} style={{ width: '100px' }}>
                {formatDate(request.requested_at)}
              </div>
              
              <div className={styles.actionsCell} style={{ width: '100px' }}>
                <button
                  className={styles.approveButton}
                  onClick={() => handleApprove(request)}
                  aria-label="Approve"
                  title="Approve"
                >
                  <img src={approveIcon} alt="Approve" className={styles.actionIcon} />
                </button>
                <button
                  className={styles.rejectButton}
                  onClick={() => handleReject(request)}
                  aria-label="Reject"
                  title="Reject"
                >
                  <img src={rejectIcon} alt="Reject" className={styles.actionIcon} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ApproveRequestModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={loadPendingRequests}
      />

      <RejectRequestModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onSuccess={loadPendingRequests}
      />
    </>
  );
}
