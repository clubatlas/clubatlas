'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SidebarNavigation.module.css';

const imgIcon = "/images/icons/dashboard/nav-overview.svg";
const imgIcon1 = "/images/icons/dashboard/nav-club-profile.svg";
const imgIcon2 = "/images/icons/dashboard/nav-events.svg";
const imgIcon3 = "/images/icons/dashboard/nav-announcements.svg";
const imgIcon4 = "/images/icons/dashboard/nav-subscribers.svg";
const imgIcon5 = "/images/icons/dashboard/nav-analytics.svg";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin/dashboard', icon: imgIcon },
  { label: 'Club Profile', href: '/admin/dashboard/profile', icon: imgIcon1 },
  { label: 'Events', href: '/admin/dashboard/events', icon: imgIcon2 },
  { label: 'Announcements', href: '/admin/dashboard/announcements', icon: imgIcon3 },
  { label: 'Subscribers', href: '/admin/dashboard/subscribers', icon: imgIcon4 },
  { label: 'Analytics', href: '/admin/dashboard/analytics', icon: imgIcon5 },
];

export default function SidebarNavigation() {
  const pathname = usePathname();

  return (
    <div className={styles.sidebar}>
      <div className={styles.navContainer}>
        <h3 className={styles.navTitle}>Navigation</h3>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === '/admin/dashboard'
              ? pathname === item.href
              : (pathname === item.href || pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span
                  className={styles.navIcon}
                  style={{ maskImage: `url(${item.icon})`, WebkitMaskImage: `url(${item.icon})` }}
                  role="img"
                  aria-hidden={true}
                />
                <span className={styles.navText}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}










