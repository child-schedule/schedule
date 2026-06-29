import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
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

function summariseDay(blocks) {
  const active = blocks.filter(b => b.status !== 'orange');
  const sorted = [...active].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const arrived = sorted.length > 0 ? formatDisplayTime(sorted[0].startTime) : '—';
  const left    = sorted.length > 0 ? formatDisplayTime(sorted[sorted.length - 1].endTime) : '—';
  const classrooms = [...new Set(
    blocks.filter(b => b.status === 'green').map(b => b.classroomName).filter(Boolean)
  )];
  const hasBreak = blocks.some(b => b.status === 'yellow');
  return { arrived, left, classrooms, hasBreak };
}

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

function formatLongDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

function formatShortDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

function formatDayOfWeek(dateStr) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' })
    .format(new Date(dateStr + 'T00:00:00'));
}

export default function TeacherSummaryPage() {
  const { teacherId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const start = searchParams.get('start') || '';
  const end   = searchParams.get('end')   || '';

  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    async function load() {
      try {
        let url = `${API_BASE_URL}/api/teacher/${teacherId}/schedule`;
        if (start && end) url += `?start=${start}&end=${end}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSummaryData(data);
      } catch {
        setError('Could not load schedule data. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [teacherId, start, end]);

  const periodLabel = start && end
    ? `${formatShortDate(start)} – ${formatShortDate(end)}`
    : 'All recorded dates';

  return (
    <>
      <AppHeader />
      <main className="tv-result-page">
        <Link to="/teachers-view" className="back-link">‹ Back</Link>

        {isLoading && <p className="tv-result-loading">Loading…</p>}
        {error     && <p className="tv-error" role="alert">{error}</p>}

        {summaryData && (
          <>
            <div className="tv-result-card surface-card">
              <div className="tv-result-card__actions">
                <div className="tv-summary-meta">
                  <span className="tv-summary-name">{summaryData.teacherName}</span>
                  <span className="tv-summary-period">{periodLabel}</span>
                </div>
                <button
                  className="tv-print-btn"
                  onClick={() => window.print()}
                  aria-label="Print or download schedule as PDF"
                >
                  Print / Download as PDF
                </button>
              </div>

              {summaryData.days.length === 0 ? (
                <p className="tv-no-schedule">No schedule found for this period.</p>
              ) : (
                <div className="tv-summary-scroll">
                  <table className="tv-summary-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Arrived</th>
                        <th>Left</th>
                        <th>Classroom(s)</th>
                        <th>Break</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaryData.days.map(day => {
                        const { arrived, left, classrooms, hasBreak } = summariseDay(day.blocks);
                        return (
                          <tr
                            key={day.date}
                            className="tv-summary-row"
                            onClick={() => navigate(`/teachers-view/${teacherId}/${day.date}`)}
                            title="Click to view full day schedule"
                          >
                            <td>{formatShortDate(day.date)}</td>
                            <td className="tv-summary-day">{formatDayOfWeek(day.date)}</td>
                            <td>{arrived}</td>
                            <td>{left}</td>
                            <td>{classrooms.length > 0 ? classrooms.join(', ') : '—'}</td>
                            <td>
                              <span className={`tv-summary-break${hasBreak ? ' tv-summary-break--yes' : ''}`}>
                                {hasBreak ? 'Yes' : 'No'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Hidden on screen — only visible when printing */}
            <div className="tv-print-only" aria-hidden="true">
              <div className="tv-print-header">
                <h1>Childcare Care Center</h1>
                <p className="tv-print-teacher">{summaryData.teacherName}</p>
                <p className="tv-print-date">{periodLabel}</p>
              </div>

              {summaryData.days.map(day => {
                const slots  = buildSlots(day.blocks);
                const groups = groupSlotsForPrint(slots);
                return (
                  <div key={day.date} className="tv-print-day">
                    <h2 className="tv-print-day__heading">{formatLongDate(day.date)}</h2>
                    <table className="tv-print-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map((group, i) => (
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
                  </div>
                );
              })}

              <p className="tv-print-footer">Generated at: {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
