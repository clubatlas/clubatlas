'use client';

import styles from './WeekView.module.css';

interface CalendarEvent {
  id: string;
  date: number;
  time: string;
  title: string;
  color: string;
  club_id: string;
  description: string;
  location: string;
  start_datetime: Date;
}

interface WeekViewProps {
  onEventClick?: (event?: CalendarEvent) => void;
  currentDate: Date;
  events: CalendarEvent[];
}

const getWeekDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();
  const day = currentDate.getDay();
  
  const startOfWeek = new Date(year, month, date - day);
  
  const weekDays = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    
    const isToday = 
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear();
    
    weekDays.push({
      name: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][i],
      date: dayDate.getDate().toString(),
      fullDate: dayDate,
      isToday
    });
  }
  
  return weekDays;
};

const hours = [
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM',
  '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
];

export default function WeekView({ onEventClick, currentDate, events }: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);
  
  const getEventsForDay = (dayDate: Date) => {
    return events.filter(event => {
      const eventDate = event.start_datetime;
      return (
        eventDate.getDate() === dayDate.getDate() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getFullYear() === dayDate.getFullYear()
      );
    });
  };
  
  return (
    <div className={styles.weekViewWrapper}>
      {/* Calendar Grid */}
      <div className={styles.calendarGrid}>
        {/* Time Column */}
        <div className={styles.timeColumn}>
          <div className={styles.timeHeaderSpacer} />
          {hours.map((hour, index) => (
            <div key={index} className={styles.timeSlot}>
              <span className={styles.timeLabel}>{hour}</span>
            </div>
          ))}
        </div>

        {/* Days Columns */}
        <div className={styles.daysContainer}>
          {/* Days Header */}
          <div className={styles.daysHeader}>
            {weekDays.map((day, index) => (
              <div key={index} className={styles.dayHeader}>
                <span className={styles.dayName}>{day.name}</span>
                {day.isToday ? (
                  <div className={styles.todayCircle}>
                    <span className={styles.todayDate}>{day.date}</span>
                  </div>
                ) : (
                  <span className={styles.dayDate}>{day.date}</span>
                )}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className={styles.daysGrid}>
            {weekDays.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day.fullDate);
              
              return (
                <div key={dayIndex} className={styles.dayColumn}>
                  {hours.map((_, hourIndex) => (
                    <div key={hourIndex} className={styles.daySlot} />
                  ))}
                  
                  {/* Events for this day */}
                  {dayEvents.map((event, eventIndex) => {
                    const eventDate = event.start_datetime;
                    const startHour = eventDate.getHours() + eventDate.getMinutes() / 60;
                    const duration = 1;
                    const topPosition = ((startHour - 6) * 64);
                    const height = duration * 64;
                    
                    return (
                      <div
                        key={event.id}
                        className={styles.eventCard}
                        style={{
                          backgroundColor: event.color,
                          top: `${topPosition}px`,
                          height: `${height}px`
                        }}
                        onClick={() => onEventClick?.(event)}
                      >
                        <h4 className={styles.eventTitle}>{event.title}</h4>
                        <p className={styles.eventTime}>{event.time}</p>
                        <p className={styles.eventClub}>{event.location}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

