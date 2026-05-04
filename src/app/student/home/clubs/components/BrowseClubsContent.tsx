'use client';

import { useState } from 'react';
import styles from './BrowseClubsContent.module.css';
import ClubCard from './ClubCard';
import SearchBar from './SearchBar';
import FilterSection from './FilterSection';

const roboticsImage = "https://www.figma.com/api/mcp/asset/f19d250f-4777-4e93-a829-b8d8a3fb9731";
const photographyImage = "https://www.figma.com/api/mcp/asset/26c28010-3be4-4f44-9eec-b41bdbe5107b";
const dramaImage = "https://www.figma.com/api/mcp/asset/ee5859ec-9a0c-4ae8-9d13-b762ad52e5a9";

const clubs = [
  {
    id: 1,
    name: 'Robotics Club',
    description: 'Building the future with cutting-edge robotics and automation projects. Join us for hands-on learning!',
    category: 'STEM',
    image: roboticsImage,
    schedule: 'Every Monday, 4:00 PM',
    location: 'Engineering Lab',
    members: 127,
  },
  {
    id: 2,
    name: 'Photography Club',
    description: 'Capture moments, develop skills, and share your creative vision through the art of photography.',
    category: 'Arts',
    image: photographyImage,
    schedule: 'Every Thursday, 6:00 PM',
    location: 'Art Studio',
    members: 89,
  },
  {
    id: 3,
    name: 'Drama Society',
    description: 'Express yourself through theater, acting, and stage production. All skill levels welcome!',
    category: 'Performance',
    image: dramaImage,
    schedule: 'Every Tuesday, 5:30 PM',
    location: 'Theater Hall',
    members: 156,
  },
  {
    id: 4,
    name: 'Debate Club',
    description: 'Sharpen your critical thinking and public speaking skills through competitive debates and discussions.',
    category: 'Academic',
    image: roboticsImage,
    schedule: 'Every Wednesday, 5:00 PM',
    location: 'Conference Room',
    members: 64,
  },
  {
    id: 5,
    name: 'Art Club',
    description: 'Explore various art forms through painting, drawing, sculpture, and digital art. Express your creativity!',
    category: 'Arts',
    image: photographyImage,
    schedule: 'Every Friday, 4:30 PM',
    location: 'Art Studio',
    members: 112,
  },
  {
    id: 6,
    name: 'Music Ensemble',
    description: 'Make beautiful music together through orchestra, band, and vocal performances. All instruments welcome!',
    category: 'Performance',
    image: dramaImage,
    schedule: 'Every Monday, 7:00 PM',
    location: 'Music Hall',
    members: 98,
  },
];

export default function BrowseClubsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedMembership, setSelectedMembership] = useState('All');

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Browse Clubs</h1>
          <p className={styles.subtitle}>
            Discover your perfect campus community from a diverse club selection
          </p>
        </div>

        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <FilterSection
          selectedCategory={selectedCategory}
          selectedPrice={selectedPrice}
          selectedMembership={selectedMembership}
          onCategoryChange={setSelectedCategory}
          onPriceChange={setSelectedPrice}
          onMembershipChange={setSelectedMembership}
        />

        <div className={styles.clubsGrid}>
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>

        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreButton}>
            Load More Clubs
          </button>
        </div>
      </div>
    </main>
  );
}

