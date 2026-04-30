'use client';

import styles from './ApprovalModal.module.css';

const imgIcon = "/images/icons/superadmin/dashboard/modal-warning.svg";
const imgIconClose = "/images/icons/superadmin/dashboard/modal-close.svg";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'approve' | 'deny';
  title: string;
  subtitle: string;
  onConfirm: () => void;
}

export default function ApprovalModal({
  isOpen,
  onClose,
  type,
  title,
  subtitle,
  onConfirm,
}: ApprovalModalProps) {
  if (!isOpen) return null;

  const isApprove = type === 'approve';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {isApprove ? 'Approve Request' : 'Deny Request'}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={imgIconClose} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.questionContainer}>
            <img src={imgIcon} alt="" className={styles.warningIcon} />
            <h4 className={styles.question}>
              {isApprove ? 'Approve' : 'Deny'} {title}?
            </h4>
          </div>

          <div className={styles.details}>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button 
              className={isApprove ? styles.approveButton : styles.denyButton}
              onClick={onConfirm}
            >
              {isApprove ? 'Approve' : 'Deny'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}









