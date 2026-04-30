'use client';

import { useState } from 'react';
import styles from './PasswordGeneratedModal.module.css';

const imgIconSuccess = "https://www.figma.com/api/mcp/asset/776d36d7-6709-4c53-a2c3-a0194bc79a09";
const imgIconClose = "https://www.figma.com/api/mcp/asset/1a14455f-3200-44b2-a59e-0e511d8ab23f";
const imgIconCopy = "https://www.figma.com/api/mcp/asset/8f247a5e-2d84-4833-9047-c04f4884c9a3";
const imgIconEmail = "https://www.figma.com/api/mcp/asset/59ed9a14-3374-4926-a6cd-d90ae25cac53";
const imgIconInfo = "https://www.figma.com/api/mcp/asset/99f5a466-bccf-4b0d-859e-b1c77fbeb89e";

interface PasswordGeneratedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  generatedPassword: string;
}

export default function PasswordGeneratedModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  generatedPassword,
}: PasswordGeneratedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendEmail = () => {
    console.log(`Sending password email to: ${userEmail}`);
    // TODO: Implement actual email sending
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Password Reset Complete</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={imgIconClose} alt="Close" className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.successSection}>
            <div className={styles.successIcon}>
              <img src={imgIconSuccess} alt="Success" className={styles.icon} />
            </div>
            <h4 className={styles.successTitle}>New Password Generated</h4>
            <p className={styles.successSubtitle}>Password has been reset for {userName}</p>
          </div>

          <div className={styles.passwordSection}>
            <p className={styles.passwordLabel}>Temporary Password:</p>
            <div className={styles.passwordBox}>
              <div className={styles.passwordDisplay}>
                <p className={styles.password}>{generatedPassword}</p>
              </div>
              <button className={styles.copyButton} onClick={handleCopy}>
                <img src={imgIconCopy} alt="Copy" className={styles.copyIcon} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className={styles.passwordHint}>
              Click to copy the password and send it to the user via email
            </p>
          </div>

          <div className={styles.infoSection}>
            <img src={imgIconInfo} alt="Info" className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <p className={styles.infoTitle}>Next Steps:</p>
              <ul className={styles.infoList}>
                <li>Send this temporary password to {userEmail}</li>
                <li>Inform the user to change their password after login</li>
                <li>This password will be valid immediately</li>
              </ul>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.sendButton} onClick={handleSendEmail}>
              <img src={imgIconEmail} alt="Send" className={styles.sendIcon} />
              Send Email & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}









