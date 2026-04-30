'use client';

import styles from './ResetPasswordModal.module.css';

const imgIconReset = "https://www.figma.com/api/mcp/asset/814f3501-c923-4621-b07b-5bf1534aeb62";
const imgIconClose = "https://www.figma.com/api/mcp/asset/660f65e1-3006-43d2-8ab8-49fbd40dca71";
const imgIconWarning = "https://www.figma.com/api/mcp/asset/97fd5440-3624-43c3-9c13-f7f3eb9d8b12";
const imgIconGenerate = "https://www.figma.com/api/mcp/asset/2341ef45-9c78-4d4d-af40-273a3847bd96";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    name: string;
    email: string;
    accountType: string;
    department: string;
    studentId?: string;
    clubName?: string;
    role?: string;
  };
  onGeneratePassword: () => void;
}

export default function ResetPasswordModal({ isOpen, onClose, request, onGeneratePassword }: ResetPasswordModalProps) {
  if (!isOpen) return null;

  const isClubLeader = request.accountType === 'Club Leader';
  const isStudent = request.accountType === 'Student';

  const handleGeneratePassword = () => {
    onGeneratePassword();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Reset Password</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={imgIconClose} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.confirmHeader}>
            <div className={styles.iconContainer}>
              <img src={imgIconReset} alt="Reset" className={styles.icon} />
            </div>
            <h4 className={styles.confirmTitle}>Reset Password for {request.name}?</h4>
          </div>

          <div className={styles.infoBox}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{request.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account Type:</span>
              <span className={styles.accountBadge}>{request.accountType}</span>
            </div>
            {isStudent && request.studentId && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Student ID:</span>
                <span className={styles.infoValue}>{request.studentId}</span>
              </div>
            )}
            {isClubLeader && request.clubName && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Club Name:</span>
                <span className={styles.infoValue}>{request.clubName}</span>
              </div>
            )}
            {isClubLeader && request.role && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Role:</span>
                <span className={styles.infoValue}>{request.role}</span>
              </div>
            )}
            {isStudent && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Department:</span>
                <span className={styles.infoValue}>{request.department}</span>
              </div>
            )}
          </div>

          <div className={styles.warningBox}>
            <img src={imgIconWarning} alt="Warning" className={styles.warningIcon} />
            <div className={styles.warningText}>
              <p className={styles.warningTitle}>A new temporary password will be generated</p>
              <p className={styles.warningSubtitle}>The user should change this password after logging in</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.generateButton} onClick={handleGeneratePassword}>
              <img src={imgIconGenerate} alt="Generate" className={styles.generateIcon} />
              Generate Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

