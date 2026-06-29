import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import {
  buildClassroomSlots,
  groupClassroomSlots,
  SLOT_LABELS,
  GROUP_COLORS,
  ABSENT_COLOR,
} from '../../utils/classroomScheduleSlots';
import { formatDisplayTime } from '../../utils/timeSlots';
import './ClassroomView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotSpan(startTime, endTime) {
  return (toMin(endTime) - toMin(startTime)) / 30;
}

function formatLongDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

export default function ClassroomResultPage() {
  const { classroomId, date } = useParams();
  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/schedule/${date}/classroom/${classroomId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const slots = buildClassroomSlots(json.teachers);
        setData({ ...json, slots, groups: groupClassroomSlots(slots) });
      } catch {
        setError('Could not load schedule. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [classroomId, date]);

  return (
    <>
      <AppHeader />
      <main className="cv-result-page">
        <Link to="/classroom-view" className="back-link">‹ Back</Link>

        {isLoading && <p className="cv-loading">Loading…</p>}
        {error     && <p className="cv-error" role="alert">{error}</p>}

        {data && (
          <>
            <div className="cv-result-card surface-card">
              <div className="cv-result-card__actions">
                <div className="cv-result-meta">
                  <span className="cv-result-name">{data.classroomName}</span>
                  <span className="cv-result-date">{formatLongDate(date)}</span>
                </div>
                <button className="tv-print-btn" onClick={() => window.print()}>
                  Print / Download as PDF
                </button>
              </div>

              {data.teachers.length === 0 ? (
                <p className="cv-no-schedule">
                  No schedule found for{' '}
                  <strong style={{ textTransform: 'capitalize' }}>{data.classroomName}</strong>{' '}
                  on <strong>{date}</strong>.
                </p>
              ) : (
                <div className="cv-hgrid-wrapper">
                  <div className="cv-hgrid">
                    {/* ── Time header ── */}
                    <div className="cv-hgrid-corner" />
                    {SLOT_LABELS.map((label, i) => (
                      <div key={i} className="cv-hgrid-time-cell">{label}</div>
                    ))}

                    {/* ── Single classroom row ── */}
                    <div className="cv-hgrid-label-cell">
                      {data.classroomName}
                    </div>
                    {data.groups.map((g, i) => {
                      const isPresent = g.teacherNames.length > 0;
                      const presentIndex = data.groups.slice(0, i).filter(x => x.teacherNames.length > 0).length;
                      const c = isPresent ? GROUP_COLORS[presentIndex % GROUP_COLORS.length] : ABSENT_COLOR;
                      const isLast = i === data.groups.length - 1;
                      // Last cell spans 1 extra to fill the "6 PM" boundary column
                      const span = slotSpan(g.startTime, g.endTime) + (isLast ? 1 : 0);
                      return (
                        <div
                          key={i}
                          className="cv-hgrid-cell"
                          style={{
                            gridColumn: `span ${span}`,
                            background: c.bg,
                            color: c.color,
                          }}
                        >
                          {isPresent ? g.teacherNames.join(', ') : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Print-only */}
            <div className="cv-print-only" aria-hidden="true">
              <div className="cv-print-header">
                <h1>Childcare Care Center</h1>
                <p className="cv-print-classroom">{data.classroomName}</p>
                <p className="cv-print-date">{formatLongDate(date)}</p>
              </div>
              {data.teachers.length === 0 ? (
                <p>No schedule found for this classroom on this date.</p>
              ) : (
                <table className="cv-print-table">
                  <thead>
                    <tr><th>Time</th><th>Teachers Present</th></tr>
                  </thead>
                  <tbody>
                    {data.groups.map((g, i) => (
                      <tr key={i} data-present={g.teacherNames.length > 0}>
                        <td>{formatDisplayTime(g.startTime)} – {formatDisplayTime(g.endTime)}</td>
                        <td>{g.teacherNames.length > 0 ? g.teacherNames.join(', ') : 'No teacher'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="cv-print-footer">Generated at: {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
