'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/firebase/auth';
import styles from './SuperAdminDashboard.module.css';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminSidebar from './components/SuperAdminSidebar';
import SystemStatusBanner from './components/SystemStatusBanner';
import StatCard from './components/StatCard';
import PendingApprovals from './components/PendingApprovals';
import RecentActivity from './components/RecentActivity';
import SystemAlerts from './components/SystemAlerts';

const statTotalClubs = "/images/icons/superadmin/stat-total-clubs.svg";
const statActiveLeaders = "/images/icons/superadmin/stat-active-leaders.svg";
const statStudentUsers = "/images/icons/superadmin/stat-student-users.svg";
const statTotalEvents = "/images/icons/superadmin/stat-total-events.svg";

interface PlatformStats {
  total_clubs: number;
  active_clubs: number;
  inactive_clubs: number;
  total_leaders: number;
  active_leaders: number;
  pending_leader_requests: number;
  total_students: number;
  new_students_this_week: number;
  total_events: number;
  upcoming_events: number;
  total_subscriptions: number;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const base = process.env.NEXT_PUBLIC_API_URL;
      const headers = { 'Authorization': `Bearer ${token}` };

      const [allClubsRes, activeClubsRes, allLeadersRes, eventsRes, approvalsRes] = await Promise.all([
        fetch(`${base}/api/superadmin/clubs?page_size=1`, { headers }),
        fetch(`${base}/api/superadmin/clubs?page_size=1&status=active`, { headers }),
        fetch(`${base}/api/superadmin/club-leaders`, { headers }),
        fetch(`${base}/api/events?limit=1`, { headers }),
        fetch(`${base}/api/superadmin/pending-approvals?limit=1`, { headers }),
      ]);

      let total_clubs = 0;
      if (allClubsRes.ok) {
        const data = await allClubsRes.json();
        total_clubs = data.total ?? 0;
      }

      let active_clubs = 0;
      if (activeClubsRes.ok) {
        const data = await activeClubsRes.json();
        active_clubs = data.total ?? 0;
      }

      let active_leaders = 0;
      let total_leaders = 0;
      if (allLeadersRes.ok) {
        const data = await allLeadersRes.json();
        const leaders: { status: string }[] = data.leaders ?? [];
        total_leaders = data.total ?? leaders.length;
        active_leaders = leaders.filter(l => l.status === 'active').length;
      }

      let total_events = 0;
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        total_events = data.total ?? (data.events?.length ?? 0);
      }

      let pending_leader_requests = 0;
      if (approvalsRes.ok) {
        const data = await approvalsRes.json();
        pending_leader_requests = data.total ?? (data.approvals?.length ?? 0);
      }

      const studentsRes = await fetch(`${base}/api/superadmin/students/statistics`, { headers });
      let total_students = total_leaders;
      let new_students_this_week = 0;
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        total_students = (data.total_users ?? 0) + total_leaders;
        new_students_this_week = data.new_this_week ?? 0;
      }

      setStats({
        total_clubs,
        active_clubs,
        inactive_clubs: total_clubs - active_clubs,
        total_leaders,
        active_leaders,
        pending_leader_requests,
        total_students,
        new_students_this_week,
        total_events,
        upcoming_events: 0,
        total_subscriptions: 0,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <SuperAdminHeader />
      <div className={styles.mainContent}>
        <SuperAdminSidebar />
        <div className={styles.contentArea}>
          <div className={styles.header}>
            <h1 className={styles.title}>Super Admin Dashboard</h1>
            <p className={styles.subtitle}>Platform overview and system management</p>
          </div>

          <SystemStatusBanner />

          <div className={styles.statsGrid}>
            <StatCard
              icon={statTotalClubs}
              value={loading ? "..." : (stats?.total_clubs ?? 0).toString()}
              label="Total Clubs"
              sublabel={loading ? "" : `${stats?.active_clubs || 0} active`}
              bgColor="#dcfce7"
            />
            <StatCard
              icon={statActiveLeaders}
              value={loading ? "..." : (stats?.active_leaders ?? 0).toString()}
              label="Active Leaders"
              sublabel={loading ? "" : `${stats?.pending_leader_requests || 0} pending`}
              bgColor="#dcfce7"
            />
            <StatCard
              icon={statStudentUsers}
              value={loading ? "..." : (stats?.total_students ?? 0).toLocaleString()}
              label="Student Users"
              sublabel={loading ? "" : `+${stats?.new_students_this_week || 0} this week`}
              bgColor="#dcfce7"
            />
            <StatCard
              icon={statTotalEvents}
              value={loading ? "..." : (stats?.total_events ?? 0).toString()}
              label="Total Events"
              sublabel="This semester"
              bgColor="#dcfce7"
            />
          </div>

          <PendingApprovals />

          <div className={styles.bottomGrid}>
            <RecentActivity />
            <SystemAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}









