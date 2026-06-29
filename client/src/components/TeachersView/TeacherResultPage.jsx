import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import TeacherScheduleGrid from './TeacherScheduleGrid';
import { buildSlots } from '../../utils/teacherScheduleStates';
import { formatDisplayTime } from '../../utils/timeSlots';
import './TeachersView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STATE_NAMES = {
  1: 'Not in center',
  2: 'In classroom',
  3: 'Break',
  5: 'In center',
  6: 'Left center',
};

function groupSlotsForPrint(slots) {
  const groups = [];
  for (const slot of slots) {
    const last = groups[groups.length - 1];
    if (last && last.state === slot.state && last.label === slot.label) {
      last.endTime = slot.endTime;
    } else {
      groups.push({ ...slot });
    }
  }
  return groups;
}

function formatDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

export default function TeacherResultPage() {
  const { teacherId, date } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/schedule/${date}/teacher/${teacherId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const slots = buildSlots(data.blocks);
        setScheduleData({ teacherName: data.teacherName, date: data.date, slots });
      } catch {
        setError('Could not load schedule. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [teacherId, date]);

  return (
    <>
      <AppHeader />
      <main className="tv-result-page">
        <Link to="/teachers-view" className="back-link">‹ Back</Link>

        {isLoading && (
          <p className="tv-result-loading">Loading…</p>
        )}

        {error && (
          <p className="tv-error" role="alert">{error}</p>
        )}

        {scheduleData && (
          <>
            <div className="tv-result-card surface-card">
              <div className="tv-result-card__actions">
                <button
                  className="tv-print-btn"
                  onClick={() => window.print()}
                  aria-label="Print or download schedule as PDF"
                >
                  Print / Download as PDF
                </button>
              </div>
              <div className="tv-grid-wrapper">
                <TeacherScheduleGrid
                  teacherName={scheduleData.teacherName}
                  slots={scheduleData.slots}
                />
              </div>
            </div>

            {/* Hidden on screen — only visible when printing */}
            <div className="tv-print-only" aria-hidden="true">
              <div className="tv-print-header">
                <h1>Childcare Care Center</h1>
                <p className="tv-print-teacher">{scheduleData.teacherName}</p>
                <p className="tv-print-date">{formatDate(scheduleData.date)}</p>
              </div>

              <table className="tv-print-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSlotsForPrint(scheduleData.slots).map((group, i) => (
                    <tr key={i} data-state={group.state}>
                      <td>
                        {formatDisplayTime(group.startTime)} – {formatDisplayTime(group.endTime)}
                      </td>
                      <td>{STATE_NAMES[group.state] ?? group.fullLabel}</td>
                      <td>{group.state === 2 ? group.label : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="tv-print-footer">
                Generated at: {new Date().toLocaleString()}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
