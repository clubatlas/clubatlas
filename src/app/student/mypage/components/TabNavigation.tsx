'use client';

import { useState } from 'react';
import styles from './TabNavigation.module.css';

const overviewIcon = "https://www.figma.com/api/mcp/asset/eeb5c74b-0b5f-485b-9e01-714d9dd34c8e";
const heartIcon = "https://www.figma.com/api/mcp/asset/eca49ccf-5a46-4ff7-bedd-de4278db1130";
const historyIcon = "https://www.figma.com/api/mcp/asset/6d94e98c-b5cc-4ca9-97a7-594e8ee50538";
const bookmarkIcon = "https://www.figma.com/api/mcp/asset/cf41c5ca-006f-4bff-8087-fa32640b4264";
const settingsIcon = "https://www.figma.com/api/mcp/asset/c0a80a59-d26a-413b-95b0-87012c669eb8";

type TabType = 'overview' | 'subscribed' | 'history' | 'saved' | 'settings';

export default function TabNavigation() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <img src={overviewIcon} alt="" className={styles.icon} />
          <span>Overview</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'subscribed' ? styles.active : ''}`}
          onClick={() => setActiveTab('subscribed')}
        >
          <img src={heartIcon} alt="" className={styles.icon} />
          <span>Subscribed (3)</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <img src={historyIcon} alt="" className={styles.icon} />
          <span>History</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <img src={bookmarkIcon} alt="" className={styles.icon} />
          <span>Saved (3)</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <img src={settingsIcon} alt="" className={styles.icon} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}









