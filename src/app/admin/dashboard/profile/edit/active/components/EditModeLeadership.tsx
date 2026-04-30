'use client';

import { useState } from 'react';
import styles from './EditModeLeadership.module.css';

const imgIconAdd = "https://www.figma.com/api/mcp/asset/a6dcea17-41e5-479e-8738-029f34a81df9";
const imgIconEdit = "https://www.figma.com/api/mcp/asset/bdcdf4cc-2659-4298-bba6-de0c7e3f224c";
const imgIconDelete = "https://www.figma.com/api/mcp/asset/330976b7-d9aa-4efe-87b9-7ad9e32f8fc9";

interface Leader {
  id: string;
  initial: string;
  name: string;
  email: string;
}

function LeaderCard({ leader }: { leader: Leader }) {
  const [name, setName] = useState(leader.name);
  const [email, setEmail] = useState(leader.email);

  return (
    <div className={styles.leaderCard}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <span className={styles.avatarText}>{leader.initial}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionButton}>
            <img src={imgIconEdit} alt="Edit" className={styles.actionIcon} />
          </button>
          <button className={styles.actionButton}>
            <img src={imgIconDelete} alt="Delete" className={styles.actionIcon} />
          </button>
        </div>
      </div>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          placeholder="Name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="Email"
        />
      </div>
    </div>
  );
}

export default function EditModeLeadership() {
  const [leaders] = useState<Leader[]>([
    {
      id: '1',
      initial: 'S',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.edu',
    },
    {
      id: '2',
      initial: 'M',
      name: 'Michael Chen',
      email: 'michael.c@email.edu',
    },
  ]);

  const handleAddLeader = () => {
    console.log('Add leader');
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Leadership Team</h2>
        <button className={styles.addButton} onClick={handleAddLeader}>
          <img src={imgIconAdd} alt="" className={styles.addIcon} />
          Add Leader
        </button>
      </div>

      <div className={styles.leadersGrid}>
        {leaders.map((leader) => (
          <LeaderCard key={leader.id} leader={leader} />
        ))}
      </div>
    </div>
  );
}








