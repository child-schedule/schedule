import { useEffect, useState } from 'react';
import CalendarGrid from './CalendarGrid';
import AppHeader from '../common/AppHeader';
import { fetchSchedule } from '../../api/scheduleApi';
import { formatDateKey, getDaysInMonth, getMonthLabel } from '../../utils/dateHelpers';
import './Calendar.css';

function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [scheduledDates, setScheduledDates] = useState(new Set());
  const [loadedKey, setLoadedKey] = useState(null);

  const currentKey = `${year}-${month}`;
  const isLoading = loadedKey !== currentKey;

  useEffect(() => {
    let isCancelled = false;

    const daysInMonth = getDaysInMonth(year, month);
    const dateKeys = Array.from({ length: daysInMonth }, (_, i) =>
      formatDateKey(new Date(year, month, i + 1))
    );

    Promise.all(
      dateKeys.map((dateKey) => fetchSchedule(dateKey).then((schedule) => ({ dateKey, schedule })))
    ).then((results) => {
      if (isCancelled) return;
      // Only dates with a *published* schedule get the dot — an in-progress,
      // never-applied draft isn't a "saved schedule" yet.
      const withSchedule = results
        .filter((r) => r.schedule && r.schedule.rows.length > 0)
        .map((r) => r.dateKey);
      setScheduledDates(new Set(withSchedule));
      setLoadedKey(currentKey);
    });

    return () => {
      isCancelled = true;
    };
  }, [year, month, currentKey]);

  function goToPreviousMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <>
      <AppHeader />
      <main>
        <div className="surface-card calendar-card">
          <div className="calendar-header">
            <button type="button" onClick={goToPreviousMonth} aria-label="Previous month">
              ‹
            </button>
            <h2>{getMonthLabel(year, month)}</h2>
            <button type="button" onClick={goToNextMonth} aria-label="Next month">
              ›
            </button>
          </div>
          {isLoading ? (
            <p aria-busy="true">Loading schedule…</p>
          ) : (
            <CalendarGrid year={year} month={month} scheduledDates={scheduledDates} />
          )}
        </div>
      </main>
    </>
  );
}

export default CalendarPage;
