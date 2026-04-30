'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export default function DatePicker({ selectedDate, onDateSelect, onClose, anchorRef }: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  type DayCell = { day: number; isPrevMonth: boolean; isNextMonth: boolean };

  const getDaysInMonth = (date: Date): DayCell[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayCell[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const d = new Date(year, month, 1 - startingDayOfWeek + i);
      days.push({ day: d.getDate(), isPrevMonth: true, isNextMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isPrevMonth: false, isNextMonth: false });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isPrevMonth: false, isNextMonth: true });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
    let year = currentMonth.getFullYear();
    let month = currentMonth.getMonth();
    if (isPrevMonth) {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    } else if (isNextMonth) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
    onClose();
  };

  const days = getDaysInMonth(currentMonth);
  const today = new Date();

  const getSelectedDay = (): number | null => {
    if (!selectedDate) return null;
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? null : d.getDate();
  };

  const getSelectedMonth = (): number => {
    if (!selectedDate) return -1;
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? -1 : d.getMonth();
  };

  const getSelectedYear = (): number => {
    if (!selectedDate) return -1;
    const d = new Date(selectedDate);
    return isNaN(d.getTime()) ? -1 : d.getFullYear();
  };

  const isToday = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
    if (isPrevMonth || isNextMonth) return false;
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
    const selDay = getSelectedDay();
    const selMonth = getSelectedMonth();
    const selYear = getSelectedYear();
    if (selDay === null || selMonth < 0 || selYear < 0) return false;
    let checkMonth: number;
    let checkYear: number;
    if (isPrevMonth) {
      checkMonth = currentMonth.getMonth() - 1;
      checkYear = checkMonth < 0 ? currentMonth.getFullYear() - 1 : currentMonth.getFullYear();
      checkMonth = (checkMonth + 12) % 12;
    } else if (isNextMonth) {
      checkMonth = currentMonth.getMonth() + 1;
      checkYear = checkMonth > 11 ? currentMonth.getFullYear() + 1 : currentMonth.getFullYear();
      checkMonth = checkMonth % 12;
    } else {
      checkMonth = currentMonth.getMonth();
      checkYear = currentMonth.getFullYear();
    }
    return day === selDay && checkMonth === selMonth && checkYear === selYear;
  };

  return (
    <div ref={containerRef} className={styles.datePicker}>
      <div className={styles.monthHeader}>
        <div className={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          <span className={styles.yearDropdown}>▾</span>
        </div>
        <div className={styles.monthNavigation}>
          <button className={styles.navButton} onClick={handlePrevMonth} type="button">
            ‹
          </button>
          <button className={styles.navButton} onClick={handleNextMonth} type="button">
            ›
          </button>
        </div>
      </div>

      <div className={styles.weekdays}>
        {weekDays.map((day, index) => (
          <div key={index} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.calendar}>
        {days.map((item, index) => {
          const { day, isPrevMonth, isNextMonth } = item;
          const isOtherMonth = isPrevMonth || isNextMonth;
          const todayFlag = isToday(day, isPrevMonth, isNextMonth);
          const selectedFlag = isSelected(day, isPrevMonth, isNextMonth);
          return (
            <div
              key={index}
              className={`${styles.calendarDay} ${
                isOtherMonth ? styles.otherMonth : ''
              } ${selectedFlag && !todayFlag ? styles.selectedDay : ''} ${
                todayFlag ? styles.todayDay : ''
              }`}
              onClick={() => handleDateClick(day, isPrevMonth, isNextMonth)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
