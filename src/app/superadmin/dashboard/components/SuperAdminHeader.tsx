'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/firebase/auth';
import EditProfileModal from '@/components/EditProfileModal';
import styles from './SuperAdminHeader.module.css';

const logoIcon = "/images/icons/superadmin/header-shield.svg";
const settingsIcon = "/images/icons/superadmin/header-settings.svg";
const logoutIcon = "/images/icons/superadmin/header-logout.svg";

export default function SuperAdminHeader() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/welcome');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <img src={logoIcon} alt="ClubAtlas" className={styles.logoIcon} />
        </div>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>ClubAtlas Super Admin</h1>
          <p className={styles.subtitle}>System Administrator</p>
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <button className={styles.iconButton} onClick={() => setShowEditModal(true)} title="Settings">
          <img src={settingsIcon} alt="Settings" className={styles.icon} />
        </button>
        <a href="/student/home" className={styles.textButton}>
          View Public Site
        </a>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {userProfile?.display_name?.substring(0, 2).toUpperCase() || 'SA'}
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{userProfile?.display_name || 'System Admin'}</p>
            <p className={styles.userEmail}>{userProfile?.email || 'admin@clubatlas.edu'}</p>
          </div>
        </div>
        <button className={styles.iconButton} onClick={handleLogout} title="Logout">
          <img src={logoutIcon} alt="Logout" className={styles.icon} />
        </button>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}









