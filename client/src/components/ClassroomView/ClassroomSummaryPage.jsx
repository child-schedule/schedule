import { useEffect, useState, Fragment } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
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

function formatGridDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday  = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
  const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
  return `${weekday}, ${monthDay}`;
}

function formatShortDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

function formatLongDate(dateStr) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'));
}

export default function ClassroomSummaryPage() {
  const { classroomId } = useParams();
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const start = searchParams.get('start') || '';
  const end   = searchParams.get('end')   || '';

  const [data, setData]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function load() {
      try {
        let url = `${API_BASE_URL}/api/classroom/${classroomId}/schedule`;
        if (start && end) url += `?start=${start}&end=${end}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setData(await res.json());
      } catch {
        setError('Could not load schedule data. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [classroomId, start, end]);

  const periodLabel = start && end
    ? `${formatShortDate(start)} – ${formatShortDate(end)}`
    : 'All recorded dates';

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
                  <span className="cv-result-date">{periodLabel}</span>
                </div>
                <button className="tv-print-btn" onClick={() => window.print()}>
                  Print / Download as PDF
                </button>
              </div>

              {data.days.length === 0 ? (
                <p className="cv-no-schedule">No schedule found for this period.</p>
              ) : (
                <div className="cv-hgrid-wrapper">
                  <div className="cv-hgrid cv-hgrid--multi">
                    {/* ── Time header ── */}
                    <div className="cv-hgrid-corner" />
                    {SLOT_LABELS.map((label, i) => (
                      <div key={i} className="cv-hgrid-time-cell">{label}</div>
                    ))}

                    {/* ── One row per day ── */}
                    {data.days.map(day => {
                      const groups = groupClassroomSlots(buildClassroomSlots(day.teachers));
                      return (
                        <Fragment key={day.date}>
                          <div
                            className="cv-hgrid-label-cell cv-hgrid-label-cell--date"
                            onClick={() => navigate(`/classroom-view/${classroomId}/${day.date}`)}
                            title={`View full schedule for ${formatLongDate(day.date)}`}
                          >
                            {formatGridDate(day.date)}
                          </div>
                          {groups.map((g, i) => {
                            const isPresent = g.teacherNames.length > 0;
                            const presentIndex = groups.slice(0, i).filter(x => x.teacherNames.length > 0).length;
                            const c = isPresent ? GROUP_COLORS[presentIndex % GROUP_COLORS.length] : ABSENT_COLOR;
                            const isLast = i === groups.length - 1;
                            const span = slotSpan(g.startTime, g.endTime) + (isLast ? 1 : 0);
                            return (
                              <div
                                key={i}
                                className="cv-hgrid-cell"
                                style={{ gridColumn: `span ${span}`, background: c.bg, color: c.color }}
                                onClick={() => navigate(`/classroom-view/${classroomId}/${day.date}`)}
                              >
                                {isPresent ? g.teacherNames.join(', ') : ''}
                              </div>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Print-only — Option B: full grouped detail per day */}
            <div className="cv-print-only" aria-hidden="true">
              <div className="cv-print-header">
                <h1>Childcare Care Center</h1>
                <p className="cv-print-classroom">{data.classroomName}</p>
                <p className="cv-print-date">{periodLabel}</p>
              </div>

              {data.days.map(day => {
                const groups = groupClassroomSlots(buildClassroomSlots(day.teachers));
                return (
                  <div key={day.date} className="cv-print-day">
                    <h2 className="cv-print-day__heading">{formatLongDate(day.date)}</h2>
                    <table className="cv-print-table">
                      <thead>
                        <tr><th>Time</th><th>Teachers Present</th></tr>
                      </thead>
                      <tbody>
                        {groups.map((g, i) => (
                          <tr key={i} data-present={g.teacherNames.length > 0}>
                            <td>{formatDisplayTime(g.startTime)} – {formatDisplayTime(g.endTime)}</td>
                            <td style={{ textTransform: 'capitalize' }}>
                              {g.teacherNames.length > 0 ? g.teacherNames.join(', ') : 'No teacher'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

              <p className="cv-print-footer">Generated at: {new Date().toLocaleString()}</p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
