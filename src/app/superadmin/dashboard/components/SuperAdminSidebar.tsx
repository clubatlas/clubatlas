'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SuperAdminSidebar.module.css';

const adminPanelIcon = "/images/icons/superadmin/admin-panel.svg";
const navItems = [
  { label: 'Overview', href: '/superadmin/dashboard', icon: '/images/icons/superadmin/nav-overview.svg' },
  { label: 'All Clubs', href: '/superadmin/all-clubs', icon: '/images/icons/superadmin/nav-all-clubs.svg' },
  { label: 'Club Leaders', href: '/superadmin/club-leaders', icon: '/images/icons/superadmin/nav-club-leaders.svg' },
  { label: 'Student Users', href: '/superadmin/student-users', icon: '/images/icons/superadmin/nav-student-users.svg' },
  { label: 'Analytics', href: '/superadmin/analytics', icon: '/images/icons/superadmin/nav-analytics.svg' },
  { label: 'System', href: '/superadmin/system', icon: '/images/icons/superadmin/nav-system.svg' },
];

interface SuperAdminSidebarProps {
  currentPage?: string;
}

export default function SuperAdminSidebar({ currentPage }: SuperAdminSidebarProps = {}) {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      <div className={styles.navContainer}>
        <div className={styles.navHeader}>
          <img src={adminPanelIcon} alt="Admin Panel" className={styles.navHeaderIcon} />
          <h3 className={styles.navTitle}>Admin Panel</h3>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <img src={item.icon} alt={item.label} className={styles.navIcon} />
                <span className={styles.navText}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

