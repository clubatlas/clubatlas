'use client';

import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import styles from './ForgotPasswordModal.module.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);

      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setEmail('');

      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 3000);
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      const err = error as { code?: string };

      let errorMsg = 'Failed to send password reset email. Please try again.';

      if (err.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please try again later.';
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>Send password reset email</h3>
            <button onClick={onClose} className={styles.closeButton} aria-label="Close">
              <img
                src="/images/icons/forgot-password/modal-close.svg"
                alt="close"
                className={styles.closeIcon}
              />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}

            {errorMessage && (
              <div className={styles.errorMessage}>{errorMessage}</div>
            )}

            <div className={styles.fieldGroup}>
              <label htmlFor="reset-email" className={styles.label}>
                Registered email address
              </label>
              <input
                id="reset-email"
                type="email"
                className={styles.input}
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.buttons}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {!isLoading && (
                  <img
                    src="/images/icons/forgot-password/send-request.svg"
                    alt="send"
                    className={styles.sendIcon}
                  />
                )}
                <span>{isLoading ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
