'use client';

import styles from './RequestDetailsModal.module.css';

const imgIconDetails = "https://www.figma.com/api/mcp/asset/0ab9a355-7a1b-41ad-8605-aaf8d534f6e8";
const imgIconClose = "https://www.figma.com/api/mcp/asset/b8532ff1-5156-4165-baa0-d8479963bc00";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    name: string;
    email: string;
    accountType: string;
    department: string;
    requestTime: string;
    requestDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    clubName?: string;
    role?: string;
    studentId?: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectedBy?: string;
    rejectedDate?: string;
    rejectedReason?: string;
  };
  onApprove?: () => void;
}

export default function RequestDetailsModal({ isOpen, onClose, request, onApprove }: RequestDetailsModalProps) {
  if (!isOpen) return null;

  const handleApprove = () => {
    if (onApprove) {
      onApprove();
    }
    onClose();
  };

  const isClubLeader = request.accountType === 'Club Leader';
  const isStudent = request.accountType === 'Student';
  const isPending = request.status === 'PENDING';
  const isApproved = request.status === 'APPROVED';
  const isRejected = request.status === 'REJECTED';

  // Verification Notes
  let verificationNotes = '';
  if (isPending) {
    verificationNotes = 'Email verified. Student ID matches records.';
  } else if (isApproved) {
    verificationNotes = 'Approved and password reset email sent.';
  } else if (isRejected) {
    verificationNotes = request.rejectedReason || 'Request rejected';
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Password Reset Request Details</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={imgIconClose} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sectionHeader}>
            <img src={imgIconDetails} alt="Details" className={styles.sectionIcon} />
            <h4 className={styles.sectionTitle}>Request Details</h4>
          </div>

          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{request.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{request.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Account Type:</span>
              <span className={styles.value}>{request.accountType}</span>
            </div>
            
            {isClubLeader && request.clubName && (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Club Name:</span>
                  <span className={styles.value}>{request.clubName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Role:</span>
                  <span className={styles.value}>{request.role}</span>
                </div>
              </>
            )}
            
            {isStudent && request.studentId && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Student ID:</span>
                <span className={styles.value}>{request.studentId}</span>
              </div>
            )}
            
            {isStudent && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Department:</span>
                <span className={styles.value}>{request.department}</span>
              </div>
            )}
            
            <div className={styles.detailRow}>
              <span className={styles.label}>Request Time:</span>
              <span className={styles.value}>{request.requestTime}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Request Date:</span>
              <span className={styles.value}>{request.requestDate}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Status:</span>
              <span className={styles.value}>{request.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Verification Notes:</span>
              <span className={styles.value}>{verificationNotes}</span>
            </div>
            
            {isApproved && request.approvedBy && (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Approved By:</span>
                  <span className={styles.value}>{request.approvedBy}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Approved Date:</span>
                  <span className={styles.value}>{request.approvedDate}</span>
                </div>
              </>
            )}
            
            {isRejected && request.rejectedBy && (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Rejected By:</span>
                  <span className={styles.value}>{request.rejectedBy}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>Rejected Date:</span>
                  <span className={styles.value}>{request.rejectedDate}</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.closeActionButton} onClick={onClose}>
              Close
            </button>
            {isPending && onApprove && (
              <button className={styles.approveButton} onClick={handleApprove}>
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

