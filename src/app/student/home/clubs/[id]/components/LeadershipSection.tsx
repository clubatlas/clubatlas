'use client';

import styles from './LeadershipSection.module.css';

const profileIcon = "/images/icons/profile.svg";

interface LeadershipSectionProps {
  clubId: string;
}

export default function LeadershipSection({ clubId }: LeadershipSectionProps) {
  const leaders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'President',
      email: 'sarah.j@email.edu',
      image: profileIcon,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Vice President',
      email: 'michael.c@email.edu',
      image: profileIcon,
    },
    {
      id: 3,
      name: 'Emma Davis',
      role: 'Secretary',
      email: 'emma.d@email.edu',
      image: profileIcon,
    },
    {
      id: 4,
      name: 'James Wilson',
      role: 'Treasurer',
      email: 'james.w@email.edu',
      image: profileIcon,
    },
  ];

  return (
    <section className={styles.leadershipSection}>
      <h2 className={styles.sectionTitle}>Club Leadership</h2>
      <div className={styles.leadersGrid}>
        {leaders.map((leader) => (
          <div key={leader.id} className={styles.leaderCard}>
            <img src={leader.image} alt={leader.name} className={styles.avatar} />
            <h3 className={styles.name}>{leader.name}</h3>
            <p className={styles.role}>{leader.role}</p>
            <a href={`mailto:${leader.email}`} className={styles.email}>{leader.email}</a>
          </div>
        ))}
      </div>
    </section>
  );
}






