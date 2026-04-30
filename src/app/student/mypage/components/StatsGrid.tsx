import styles from './StatsGrid.module.css';

const heartIcon = "https://www.figma.com/api/mcp/asset/b0a65d41-a309-4dd5-bce5-8a83adbae401";
const calendarIcon = "https://www.figma.com/api/mcp/asset/3cfdd49c-ec5a-49ff-a558-330aec91140e";
const checkIcon = "https://www.figma.com/api/mcp/asset/6d8c5cd9-3f94-42c0-a9fc-4fbe0e554ff1";
const bookmarkIcon = "https://www.figma.com/api/mcp/asset/6e4c0e1c-9923-476d-be93-e698f41d61ba";

const stats = [
  {
    icon: heartIcon,
    iconBg: '#dbeafe',
    value: '3',
    label: 'Clubs Following',
  },
  {
    icon: calendarIcon,
    iconBg: '#dcfce7',
    value: '3',
    label: 'Upcoming Events',
  },
  {
    icon: checkIcon,
    iconBg: '#f3e8ff',
    value: '12',
    label: 'Events Attended',
  },
  {
    icon: bookmarkIcon,
    iconBg: '#ffedd4',
    value: '3',
    label: 'Saved Clubs',
  },
];

export default function StatsGrid() {
  return (
    <div className={styles.grid}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconContainer} style={{ background: stat.iconBg }}>
              <img src={stat.icon} alt="" className={styles.icon} />
            </div>
            <span className={styles.value}>{stat.value}</span>
          </div>
          <p className={styles.label}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}









