/**
 * ============================================================================
 * PHASE 2 ARCHIVE — Landing Page + Teachers View + Classroom View
 * ============================================================================
 *
 * Archived during Phase 3 (login gate + navigation restructure). These files
 * were removed from the live app on 2026-07-09 because the 3-box landing
 * page and its two standalone destinations (`/teachers-view`, `/classroom-view`)
 * were replaced by: (1) a login gate, with the calendar as the new home route,
 * and (2) an in-schedule click-through popup (Phase 3 §3, built in a later
 * slice) that reuses the rendering/state-computation logic below, adapted to
 * read from draft data instead of published data.
 *
 * This file is NOT imported or routed anywhere in the live app. It exists
 * purely as a reference so the popup-building slice can copy logic out of it
 * without needing to dig through git history.
 *
 * NOTE: `client/src/utils/teacherScheduleStates.js` and
 * `client/src/utils/classroomScheduleSlots.js` were NOT archived — they are
 * live, untouched utility modules still imported by the code below (and will
 * be reused directly by the Phase 3 popup). See those files in their real
 * location, not here.
 *
 * Each section below is the full original source of one file, with a header
 * comment showing its original path. Import paths inside each block are
 * left exactly as they were relative to that file's original location —
 * they will need adjusting if any of this is ever revived.
 * ============================================================================
 */

/* ============================================================================
 * ORIGINAL PATH: client/src/components/Landing/LandingPage.jsx
 * ============================================================================
 */
// import { Link } from 'react-router-dom';
// import './LandingPage.css';
//
// const BOXES = [
//   {
//     label: 'Teachers View',
//     sublabel: "Look up a teacher's day",
//     accent: 'teal',
//     path: '/teachers-view',
//   },
//   {
//     label: 'Classroom View',
//     sublabel: "See what's happening in a room",
//     accent: 'indigo',
//     path: '/classroom-view',
//   },
//   {
//     label: 'Dashboard',
//     sublabel: 'Build and manage the schedule',
//     accent: 'amber',
//     path: '/dashboard',
//   },
// ];
//
// export default function LandingPage() {
//   return (
//     <div className="landing-page">
//       <h1 className="landing-title">Childcare Care Center</h1>
//       <p className="landing-subtitle">Select a view to get started</p>
//       <nav className="landing-boxes" aria-label="Main navigation">
//         {BOXES.map(({ label, sublabel, accent, path }) => (
//           <Link
//             key={path}
//             to={path}
//             className={`landing-box ${accent}`}
//             aria-label={`${label} — ${sublabel}`}
//           >
//             <span className="box-label">{label}</span>
//             <span className="box-sublabel">{sublabel}</span>
//           </Link>
//         ))}
//       </nav>
//     </div>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/Landing/LandingPage.css
 * ============================================================================
 */
/*
.landing-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #fdf6ec 0%, #fef3e2 50%, #f0fdf4 100%);
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.landing-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.landing-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 3rem;
}

.landing-boxes {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.landing-box {
  width: 220px;
  height: 160px;
  background: #ffffff;
  border-radius: 16px;
  border: 1.5px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
  padding: 1.5rem;
  text-align: center;
}

.landing-box:hover {
  transform: translateY(-6px);
  color: #ffffff;
}

.landing-box.teal:hover {
  background: #0d9488;
  border-color: #0d9488;
  box-shadow: 0 8px 30px rgba(13, 148, 136, 0.35);
}

.landing-box.indigo:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  box-shadow: 0 8px 30px rgba(79, 70, 229, 0.35);
}

.landing-box.amber:hover {
  background: #d97706;
  border-color: #d97706;
  box-shadow: 0 8px 30px rgba(217, 119, 6, 0.35);
}

.box-label {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
}

.landing-box:hover .box-label {
  color: #ffffff;
}

.box-sublabel {
  font-size: 0.8rem;
  color: #9ca3af;
}

.landing-box:hover .box-sublabel {
  color: rgba(255, 255, 255, 0.85);
}

.landing-box:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}
*/

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeachersViewPage.jsx
 * ============================================================================
 */
// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import TeacherSearchInput from './TeacherSearchInput';
// import DatePickerInput from './DatePickerInput';
// import './TeachersView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const MODES = [
//   { id: 'day',     label: 'Specific Day' },
//   { id: 'overall', label: 'Overall View' },
//   { id: 'range',   label: 'In-between Dates' },
// ];
//
// export default function TeachersViewPage() {
//   const navigate = useNavigate();
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [mode, setMode] = useState('day');
//   const [selectedDate, setSelectedDate] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [noSchedule, setNoSchedule] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//
//   const canSubmit =
//     mode === 'day'     ? Boolean(selectedTeacher && selectedDate) :
//     mode === 'overall' ? Boolean(selectedTeacher) :
//                          Boolean(selectedTeacher && startDate && endDate);
//
//   function handleTeacherSelect(teacher) {
//     setSelectedTeacher(teacher);
//     setNoSchedule(null);
//     setError(null);
//   }
//
//   function handleModeChange(newMode) {
//     setMode(newMode);
//     setNoSchedule(null);
//     setError(null);
//   }
//
//   async function handleShowSchedule() {
//     if (!canSubmit) return;
//     setError(null);
//     setNoSchedule(null);
//
//     if (mode === 'overall') {
//       navigate(`/teachers-view/${selectedTeacher._id}/summary`);
//       return;
//     }
//
//     if (mode === 'range') {
//       navigate(`/teachers-view/${selectedTeacher._id}/summary?start=${startDate}&end=${endDate}`);
//       return;
//     }
//
//     // Specific day — check if schedule exists before navigating
//     setIsLoading(true);
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/api/schedule/${selectedDate}/teacher/${selectedTeacher._id}`
//       );
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//
//       if (data.blocks.length === 0) {
//         setNoSchedule({ teacherName: data.teacherName, date: data.date });
//       } else {
//         navigate(`/teachers-view/${selectedTeacher._id}/${selectedDate}`);
//       }
//     } catch {
//       setError('Could not load schedule. Please check your connection and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   }
//
//   return (
//     <>
//       <AppHeader />
//       <main className="tv-page">
//         <Link to="/" className="back-link">‹ Back</Link>
//         <h1>Teachers View</h1>
//
//         <div className="surface-card tv-form">
//           <div className="tv-form__field">
//             <label className="tv-form__label">Teacher</label>
//             <TeacherSearchInput onSelect={handleTeacherSelect} />
//           </div>
//
//           <div className="tv-form__field">
//             <label className="tv-form__label">View</label>
//             <div className="tv-mode-selector">
//               {MODES.map(m => (
//                 <button
//                   key={m.id}
//                   type="button"
//                   className={`tv-mode-btn${mode === m.id ? ' tv-mode-btn--active' : ''}`}
//                   onClick={() => handleModeChange(m.id)}
//                 >
//                   {m.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//
//           {mode === 'day' && (
//             <div className="tv-form__field">
//               <label className="tv-form__label">Date</label>
//               <DatePickerInput value={selectedDate} onChange={v => { setSelectedDate(v); setNoSchedule(null); setError(null); }} />
//             </div>
//           )}
//
//           {mode === 'range' && (
//             <>
//               <div className="tv-form__field">
//                 <label className="tv-form__label">From</label>
//                 <DatePickerInput value={startDate} onChange={v => { setStartDate(v); setError(null); }} />
//               </div>
//               <div className="tv-form__field">
//                 <label className="tv-form__label">To</label>
//                 <DatePickerInput value={endDate} onChange={v => { setEndDate(v); setError(null); }} />
//               </div>
//             </>
//           )}
//
//           <div className="tv-form__actions">
//             <button
//               type="button"
//               className="tv-form__submit"
//               disabled={!canSubmit || isLoading}
//               onClick={handleShowSchedule}
//             >
//               {isLoading ? 'Loading…' : 'Show Schedule'}
//             </button>
//           </div>
//         </div>
//
//         {error && <p className="tv-error" role="alert">{error}</p>}
//
//         {noSchedule && (
//           <p className="tv-no-schedule">
//             No schedule found for <strong>{noSchedule.teacherName}</strong> on{' '}
//             <strong>{noSchedule.date}</strong>.
//           </p>
//         )}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeacherResultPage.jsx
 * ============================================================================
 */
// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import TeacherScheduleGrid from './TeacherScheduleGrid';
// import { buildSlots } from '../../utils/teacherScheduleStates';
// import { formatDisplayTime } from '../../utils/timeSlots';
// import './TeachersView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const STATE_NAMES = {
//   1: 'Not in center',
//   2: 'In classroom',
//   3: 'Break',
//   5: 'In center',
//   6: 'Left center',
// };
//
// function groupSlotsForPrint(slots) {
//   const groups = [];
//   for (const slot of slots) {
//     const last = groups[groups.length - 1];
//     if (last && last.state === slot.state && last.label === slot.label) {
//       last.endTime = slot.endTime;
//     } else {
//       groups.push({ ...slot });
//     }
//   }
//   return groups;
// }
//
// function formatDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// export default function TeacherResultPage() {
//   const { teacherId, date } = useParams();
//   const [scheduleData, setScheduleData] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch(
//           `${API_BASE_URL}/api/schedule/${date}/teacher/${teacherId}`
//         );
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         const slots = buildSlots(data.blocks);
//         setScheduleData({ teacherName: data.teacherName, date: data.date, slots });
//       } catch {
//         setError('Could not load schedule. Please go back and try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     load();
//   }, [teacherId, date]);
//
//   return (
//     <>
//       <AppHeader />
//       <main className="tv-result-page">
//         <Link to="/teachers-view" className="back-link">‹ Back</Link>
//
//         {isLoading && (
//           <p className="tv-result-loading">Loading…</p>
//         )}
//
//         {error && (
//           <p className="tv-error" role="alert">{error}</p>
//         )}
//
//         {scheduleData && (
//           <>
//             <div className="tv-result-card surface-card">
//               <div className="tv-result-card__actions">
//                 <button
//                   className="tv-print-btn"
//                   onClick={() => window.print()}
//                   aria-label="Print or download schedule as PDF"
//                 >
//                   Print / Download as PDF
//                 </button>
//               </div>
//               <div className="tv-grid-wrapper">
//                 <TeacherScheduleGrid
//                   teacherName={scheduleData.teacherName}
//                   slots={scheduleData.slots}
//                 />
//               </div>
//             </div>
//
//             {/* Hidden on screen — only visible when printing */}
//             <div className="tv-print-only" aria-hidden="true">
//               <div className="tv-print-header">
//                 <h1>Childcare Care Center</h1>
//                 <p className="tv-print-teacher">{scheduleData.teacherName}</p>
//                 <p className="tv-print-date">{formatDate(scheduleData.date)}</p>
//               </div>
//
//               <table className="tv-print-table">
//                 <thead>
//                   <tr>
//                     <th>Time</th>
//                     <th>Status</th>
//                     <th>Location</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {groupSlotsForPrint(scheduleData.slots).map((group, i) => (
//                     <tr key={i} data-state={group.state}>
//                       <td>
//                         {formatDisplayTime(group.startTime)} – {formatDisplayTime(group.endTime)}
//                       </td>
//                       <td>{STATE_NAMES[group.state] ?? group.fullLabel}</td>
//                       <td>{group.state === 2 ? group.label : '—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//
//               <p className="tv-print-footer">
//                 Generated at: {new Date().toLocaleString()}
//               </p>
//             </div>
//           </>
//         )}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeacherSummaryPage.jsx
 * ============================================================================
 */
// import { useEffect, useState } from 'react';
// import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import { buildSlots } from '../../utils/teacherScheduleStates';
// import { formatDisplayTime } from '../../utils/timeSlots';
// import './TeachersView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const STATE_NAMES = {
//   1: 'Not in center',
//   2: 'In classroom',
//   3: 'Break',
//   5: 'In center',
//   6: 'Left center',
// };
//
// function summariseDay(blocks) {
//   const active = blocks.filter(b => b.status !== 'orange');
//   const sorted = [...active].sort((a, b) => a.startTime.localeCompare(b.startTime));
//   const arrived = sorted.length > 0 ? formatDisplayTime(sorted[0].startTime) : '—';
//   const left    = sorted.length > 0 ? formatDisplayTime(sorted[sorted.length - 1].endTime) : '—';
//   const classrooms = [...new Set(
//     blocks.filter(b => b.status === 'green').map(b => b.classroomName).filter(Boolean)
//   )];
//   const hasBreak = blocks.some(b => b.status === 'yellow');
//   return { arrived, left, classrooms, hasBreak };
// }
//
// function groupSlotsForPrint(slots) {
//   const groups = [];
//   for (const slot of slots) {
//     const last = groups[groups.length - 1];
//     if (last && last.state === slot.state && last.label === slot.label) {
//       last.endTime = slot.endTime;
//     } else {
//       groups.push({ ...slot });
//     }
//   }
//   return groups;
// }
//
// function formatLongDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// function formatShortDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// function formatDayOfWeek(dateStr) {
//   return new Intl.DateTimeFormat('en-US', { weekday: 'short' })
//     .format(new Date(dateStr + 'T00:00:00'));
// }
//
// export default function TeacherSummaryPage() {
//   const { teacherId } = useParams();
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//
//   const start = searchParams.get('start') || '';
//   const end   = searchParams.get('end')   || '';
//
//   const [summaryData, setSummaryData] = useState(null);
//   const [isLoading, setIsLoading]     = useState(true);
//   const [error, setError]             = useState(null);
//
//   useEffect(() => {
//     async function load() {
//       try {
//         let url = `${API_BASE_URL}/api/teacher/${teacherId}/schedule`;
//         if (start && end) url += `?start=${start}&end=${end}`;
//
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const data = await res.json();
//         setSummaryData(data);
//       } catch {
//         setError('Could not load schedule data. Please go back and try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     load();
//   }, [teacherId, start, end]);
//
//   const periodLabel = start && end
//     ? `${formatShortDate(start)} – ${formatShortDate(end)}`
//     : 'All recorded dates';
//
//   return (
//     <>
//       <AppHeader />
//       <main className="tv-result-page">
//         <Link to="/teachers-view" className="back-link">‹ Back</Link>
//
//         {isLoading && <p className="tv-result-loading">Loading…</p>}
//         {error     && <p className="tv-error" role="alert">{error}</p>}
//
//         {summaryData && (
//           <>
//             <div className="tv-result-card surface-card">
//               <div className="tv-result-card__actions">
//                 <div className="tv-summary-meta">
//                   <span className="tv-summary-name">{summaryData.teacherName}</span>
//                   <span className="tv-summary-period">{periodLabel}</span>
//                 </div>
//                 <button
//                   className="tv-print-btn"
//                   onClick={() => window.print()}
//                   aria-label="Print or download schedule as PDF"
//                 >
//                   Print / Download as PDF
//                 </button>
//               </div>
//
//               {summaryData.days.length === 0 ? (
//                 <p className="tv-no-schedule">No schedule found for this period.</p>
//               ) : (
//                 <div className="tv-summary-scroll">
//                   <table className="tv-summary-table">
//                     <thead>
//                       <tr>
//                         <th>Date</th>
//                         <th>Day</th>
//                         <th>Arrived</th>
//                         <th>Left</th>
//                         <th>Classroom(s)</th>
//                         <th>Break</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {summaryData.days.map(day => {
//                         const { arrived, left, classrooms, hasBreak } = summariseDay(day.blocks);
//                         return (
//                           <tr
//                             key={day.date}
//                             className="tv-summary-row"
//                             onClick={() => navigate(`/teachers-view/${teacherId}/${day.date}`)}
//                             title="Click to view full day schedule"
//                           >
//                             <td>{formatShortDate(day.date)}</td>
//                             <td className="tv-summary-day">{formatDayOfWeek(day.date)}</td>
//                             <td>{arrived}</td>
//                             <td>{left}</td>
//                             <td>{classrooms.length > 0 ? classrooms.join(', ') : '—'}</td>
//                             <td>
//                               <span className={`tv-summary-break${hasBreak ? ' tv-summary-break--yes' : ''}`}>
//                                 {hasBreak ? 'Yes' : 'No'}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//
//             {/* Hidden on screen — only visible when printing */}
//             <div className="tv-print-only" aria-hidden="true">
//               <div className="tv-print-header">
//                 <h1>Childcare Care Center</h1>
//                 <p className="tv-print-teacher">{summaryData.teacherName}</p>
//                 <p className="tv-print-date">{periodLabel}</p>
//               </div>
//
//               {summaryData.days.map(day => {
//                 const slots  = buildSlots(day.blocks);
//                 const groups = groupSlotsForPrint(slots);
//                 return (
//                   <div key={day.date} className="tv-print-day">
//                     <h2 className="tv-print-day__heading">{formatLongDate(day.date)}</h2>
//                     <table className="tv-print-table">
//                       <thead>
//                         <tr>
//                           <th>Time</th>
//                           <th>Status</th>
//                           <th>Location</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {groups.map((group, i) => (
//                           <tr key={i} data-state={group.state}>
//                             <td>
//                               {formatDisplayTime(group.startTime)} – {formatDisplayTime(group.endTime)}
//                             </td>
//                             <td>{STATE_NAMES[group.state] ?? group.fullLabel}</td>
//                             <td>{group.state === 2 ? group.label : '—'}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 );
//               })}
//
//               <p className="tv-print-footer">Generated at: {new Date().toLocaleString()}</p>
//             </div>
//           </>
//         )}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeacherScheduleGrid.jsx
 * ============================================================================
 */
// import { generateTimeSlots, formatDisplayTime } from '../../utils/timeSlots';
// import TeacherScheduleRow from './TeacherScheduleRow';
//
// function formatSlotLabel(time, index) {
//   const full = formatDisplayTime(time);
//   if (index === 0 || time === '12:00') return full;
//   return full.replace(/ (AM|PM)$/, '');
// }
//
// /**
//  * Read-only schedule grid for a single teacher.
//  *
//  * Layout: one CSS Grid with columns [label 180px] [22 × 1fr] [end-cap 36px].
//  * Header cells (row 1) and data cells (row 2) share the SAME column definitions,
//  * guaranteeing pixel-perfect alignment between time labels and coloured blocks.
//  *
//  * Props:
//  *   teacherName — string
//  *   slots       — array of 22 slot objects from buildSlots()
//  */
// export default function TeacherScheduleGrid({ teacherName, slots }) {
//   const timeSlots = generateTimeSlots();
//
//   return (
//     <div className="tv-grid" role="grid" aria-label={`${teacherName} schedule`}>
//
//       {/* ── Row 1: column headers (direct grid children) ── */}
//       <div className="tv-grid__label-cell tv-grid__corner" role="columnheader" aria-label="Teacher" />
//
//       {timeSlots.map((slot, index) => (
//         <div
//           key={slot.start}
//           className={`tv-grid__slot-label${slot.start.endsWith(':00') ? ' tv-grid__slot-label--hour' : ''}`}
//           role="columnheader"
//         >
//           {formatSlotLabel(slot.start, index)}
//         </div>
//       ))}
//
//       <div className="tv-grid__end-cap tv-grid__end-cap--label" role="columnheader">
//         {formatDisplayTime(timeSlots[timeSlots.length - 1].end)}
//       </div>
//
//       {/* ── Row 2: data cells (from TeacherScheduleRow as a Fragment) ── */}
//       <TeacherScheduleRow teacherName={teacherName} slots={slots} />
//
//     </div>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeacherScheduleRow.jsx
 * ============================================================================
 */
// /**
//  * Data row for the teacher schedule grid.
//  *
//  * Returns a React Fragment — cells are direct children of the parent CSS Grid
//  * defined in TeacherScheduleGrid. Using grid-column: span N (not flex) so
//  * column widths are shared with the header row and alignment is exact.
//  *
//  * Props:
//  *   teacherName — string label for the left column
//  *   slots       — array of 22 slot objects from buildSlots():
//  *                 { startTime, endTime, state, label, fullLabel }
//  *
//  * State → colour:
//  *   1  Not in center  #64748b / white
//  *   2  In classroom   #16a34a / white  (label = classroom name)
//  *   3  Break          #d97706 / white
//  *   5  In center      #7c3aed / white
//  *   6  Left center    #9ca3af / #374151
//  */
//
// const STATE_COLORS = {
//   1: { bg: '#64748b', color: '#ffffff' },
//   2: { bg: '#16a34a', color: '#ffffff' },
//   3: { bg: '#d97706', color: '#ffffff' },
//   5: { bg: '#7c3aed', color: '#ffffff' },
//   6: { bg: '#9ca3af', color: '#374151' },
// };
//
// // Short labels for the grid cells — fit within narrow single-slot cells (55px).
// // Full labels remain in the tooltip (title) and the print table.
// const CELL_LABELS = {
//   1: 'Not in',
//   3: 'Break',
//   5: 'In ctr',
//   6: 'Left',
// };
//
// const DEFAULT_COLORS = STATE_COLORS[1];
//
// function groupSlots(slots) {
//   const groups = [];
//   for (const slot of slots) {
//     const last = groups[groups.length - 1];
//     if (last && last.state === slot.state && last.label === slot.label) {
//       last.count++;
//       last.endTime = slot.endTime;
//     } else {
//       groups.push({
//         state: slot.state,
//         label: slot.label,
//         fullLabel: slot.fullLabel,
//         startTime: slot.startTime,
//         endTime: slot.endTime,
//         count: 1,
//       });
//     }
//   }
//   return groups;
// }
//
// export default function TeacherScheduleRow({ teacherName, slots }) {
//   const groups = groupSlots(slots);
//   const lastGroup = groups[groups.length - 1] ?? null;
//   const lastColors = lastGroup ? (STATE_COLORS[lastGroup.state] ?? DEFAULT_COLORS) : DEFAULT_COLORS;
//
//   return (
//     <>
//       {/* Label cell — column 1 of the shared grid */}
//       <div className="tv-grid__label-cell" role="gridcell">
//         <span className="tv-grid__label-text">{teacherName}</span>
//       </div>
//
//       {/* Merged colour blocks — each spans N columns of the shared grid */}
//       {groups.map((group, i) => {
//         const { bg, color } = STATE_COLORS[group.state] ?? DEFAULT_COLORS;
//         return (
//           <div
//             key={i}
//             className="tv-cell"
//             style={{
//               backgroundColor: bg,
//               color,
//               gridColumn: `span ${group.count}`,
//               '--slot-count': group.count,
//             }}
//             title={`${group.startTime}–${group.endTime}: ${group.fullLabel}`}
//             role="gridcell"
//             aria-label={`${group.startTime}–${group.endTime}: ${group.fullLabel}`}
//           >
//             <span className="tv-cell__label">
//               {group.state === 2 ? group.label : CELL_LABELS[group.state] ?? group.label}
//             </span>
//           </div>
//         );
//       })}
//
//       {/* End-cap — column 24, matches the header's "6 PM" end-cap */}
//       <div
//         className="tv-grid__end-cap"
//         style={{ backgroundColor: lastColors.bg }}
//         aria-hidden="true"
//       />
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeacherSearchInput.jsx
 * ============================================================================
 */
// import { useState, useEffect, useRef } from 'react';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// /**
//  * Typeahead teacher selector.
//  * Props:
//  *   onSelect(teacher) — called with { _id, name } when a teacher is chosen
//  */
// export default function TeacherSearchInput({ onSelect }) {
//   const [allTeachers, setAllTeachers] = useState([]);
//   const [inputValue, setInputValue] = useState('');
//   const [filtered, setFiltered] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const containerRef = useRef(null);
//   const inputRef = useRef(null);
//
//   // Fetch teacher list once on mount
//   useEffect(() => {
//     fetch(`${API_BASE_URL}/api/teachers`)
//       .then((r) => r.json())
//       .then((data) => setAllTeachers(Array.isArray(data) ? data : []))
//       .catch(() => {});
//   }, []);
//
//   // Close dropdown on outside click
//   useEffect(() => {
//     function handleMouseDown(e) {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleMouseDown);
//     return () => document.removeEventListener('mousedown', handleMouseDown);
//   }, []);
//
//   function getFiltered(value) {
//     const lower = value.trim().toLowerCase();
//     if (!lower) return allTeachers;
//     return allTeachers.filter((t) => t.name.toLowerCase().includes(lower));
//   }
//
//   function handleInputChange(e) {
//     const val = e.target.value;
//     setInputValue(val);
//     setFiltered(getFiltered(val));
//     setIsOpen(true);
//     setHighlightedIndex(-1);
//   }
//
//   function handleFocus() {
//     setFiltered(getFiltered(inputValue));
//     setIsOpen(true);
//     setHighlightedIndex(-1);
//   }
//
//   function selectTeacher(teacher) {
//     setInputValue(teacher.name);
//     setIsOpen(false);
//     setHighlightedIndex(-1);
//     onSelect(teacher);
//     // Return focus to the input after selection
//     inputRef.current?.focus();
//   }
//
//   function handleKeyDown(e) {
//     if (!isOpen || filtered.length === 0) return;
//
//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       setHighlightedIndex((i) => Math.max(i - 1, 0));
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
//         selectTeacher(filtered[highlightedIndex]);
//       }
//     } else if (e.key === 'Escape') {
//       setIsOpen(false);
//     }
//   }
//
//   return (
//     <div ref={containerRef} className="tv-search">
//       <input
//         ref={inputRef}
//         id="teacher-search"
//         type="text"
//         className="tv-search__input"
//         placeholder="Search teacher…"
//         value={inputValue}
//         onChange={handleInputChange}
//         onFocus={handleFocus}
//         onKeyDown={handleKeyDown}
//         autoComplete="off"
//         role="combobox"
//         aria-autocomplete="list"
//         aria-expanded={isOpen && filtered.length > 0}
//         aria-haspopup="listbox"
//         aria-controls="tv-search-listbox"
//         aria-activedescendant={
//           highlightedIndex >= 0 ? `tv-option-${highlightedIndex}` : undefined
//         }
//       />
//       {isOpen && filtered.length > 0 && (
//         <ul
//           id="tv-search-listbox"
//           role="listbox"
//           className="tv-search__list"
//           aria-label="Teachers"
//         >
//           {filtered.map((teacher, i) => (
//             <li
//               key={teacher._id}
//               id={`tv-option-${i}`}
//               role="option"
//               aria-selected={i === highlightedIndex}
//               className={`tv-search__option${
//                 i === highlightedIndex ? ' tv-search__option--highlighted' : ''
//               }`}
//               // Use onMouseDown (not onClick) so the input blur doesn't close
//               // the list before the click registers
//               onMouseDown={() => selectTeacher(teacher)}
//               onMouseEnter={() => setHighlightedIndex(i)}
//             >
//               {teacher.name}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/DatePickerInput.jsx
 * ============================================================================
 */
// import { useState, useEffect, useRef } from 'react';
//
// const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
// const MONTH_NAMES = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
// ];
//
// /** Parse "YYYY-MM-DD" → Date (local midnight) or null if invalid. */
// function parseDate(str) {
//   if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
//   const d = new Date(str + 'T00:00:00');
//   return isNaN(d.getTime()) ? null : d;
// }
//
// /** Build a "YYYY-MM-DD" string from year, 0-based month, day. */
// function toDateString(year, month, day) {
//   return (
//     `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
//   );
// }
//
// /**
//  * Combined date input: text field + mini calendar overlay.
//  * Props:
//  *   value      — "YYYY-MM-DD" string or ""
//  *   onChange   — called with "YYYY-MM-DD" string when value changes
//  */
// export default function DatePickerInput({ value, onChange }) {
//   const [textValue, setTextValue] = useState(value || '');
//   const [isOpen, setIsOpen] = useState(false);
//
//   const today = new Date();
//   const [viewYear, setViewYear] = useState(today.getFullYear());
//   const [viewMonth, setViewMonth] = useState(today.getMonth());
//
//   const containerRef = useRef(null);
//
//   // Keep text field in sync if parent updates value externally
//   useEffect(() => {
//     setTextValue(value || '');
//   }, [value]);
//
//   // Close calendar on outside click
//   useEffect(() => {
//     function handleMouseDown(e) {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setIsOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleMouseDown);
//     return () => document.removeEventListener('mousedown', handleMouseDown);
//   }, []);
//
//   function handleTextBlur() {
//     const parsed = parseDate(textValue);
//     if (parsed) {
//       onChange(textValue);
//     } else if (textValue !== '') {
//       // Invalid input — reset to the last committed value
//       setTextValue(value || '');
//     }
//   }
//
//   function handleCalendarToggle() {
//     if (!isOpen) {
//       // Navigate to the currently selected month when opening
//       const parsed = parseDate(value);
//       if (parsed) {
//         setViewYear(parsed.getFullYear());
//         setViewMonth(parsed.getMonth());
//       } else {
//         setViewYear(today.getFullYear());
//         setViewMonth(today.getMonth());
//       }
//     }
//     setIsOpen((v) => !v);
//   }
//
//   function handleDayClick(year, month, day) {
//     const ds = toDateString(year, month, day);
//     setTextValue(ds);
//     onChange(ds);
//     setIsOpen(false);
//   }
//
//   function prevMonth() {
//     if (viewMonth === 0) {
//       setViewYear((y) => y - 1);
//       setViewMonth(11);
//     } else {
//       setViewMonth((m) => m - 1);
//     }
//   }
//
//   function nextMonth() {
//     if (viewMonth === 11) {
//       setViewYear((y) => y + 1);
//       setViewMonth(0);
//     } else {
//       setViewMonth((m) => m + 1);
//     }
//   }
//
//   // Calendar data
//   const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
//   const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
//
//   const selectedDate = parseDate(value);
//   const todayStr = toDateString(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate()
//   );
//
//   return (
//     <div ref={containerRef} className="tv-datepicker">
//       <div className="tv-datepicker__row">
//         <input
//           id="date-input"
//           type="text"
//           className="tv-datepicker__input"
//           placeholder="YYYY-MM-DD"
//           value={textValue}
//           onChange={(e) => setTextValue(e.target.value)}
//           onBlur={handleTextBlur}
//         />
//         <button
//           type="button"
//           className="tv-datepicker__cal-btn"
//           onClick={handleCalendarToggle}
//           aria-label="Open calendar"
//           aria-expanded={isOpen}
//           aria-haspopup="dialog"
//         >
//           {/* Calendar SVG icon */}
//           <svg
//             aria-hidden="true"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//             width="16"
//             height="16"
//           >
//             <path
//               fillRule="evenodd"
//               d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm-2 5h12v8H4V7z"
//               clipRule="evenodd"
//             />
//           </svg>
//         </button>
//       </div>
//
//       {isOpen && (
//         <div
//           className="tv-datepicker__calendar"
//           role="dialog"
//           aria-label="Date picker"
//           aria-modal="false"
//         >
//           <div className="tv-datepicker__cal-header">
//             <button
//               type="button"
//               className="tv-datepicker__nav"
//               onClick={prevMonth}
//               aria-label="Previous month"
//             >
//               ‹
//             </button>
//             <span className="tv-datepicker__month-label">
//               {MONTH_NAMES[viewMonth]} {viewYear}
//             </span>
//             <button
//               type="button"
//               className="tv-datepicker__nav"
//               onClick={nextMonth}
//               aria-label="Next month"
//             >
//               ›
//             </button>
//           </div>
//
//           <div className="tv-datepicker__day-names" aria-hidden="true">
//             {DAYS_OF_WEEK.map((d) => (
//               <span key={d} className="tv-datepicker__day-name">
//                 {d}
//               </span>
//             ))}
//           </div>
//
//           <div className="tv-datepicker__days">
//             {/* Empty cells to offset the first day of the month */}
//             {Array.from({ length: firstWeekday }, (_, i) => (
//               <span
//                 key={`empty-${i}`}
//                 className="tv-datepicker__day tv-datepicker__day--empty"
//                 aria-hidden="true"
//               />
//             ))}
//
//             {Array.from({ length: daysInMonth }, (_, i) => {
//               const day = i + 1;
//               const ds = toDateString(viewYear, viewMonth, day);
//               const isSelected =
//                 selectedDate !== null &&
//                 selectedDate.getFullYear() === viewYear &&
//                 selectedDate.getMonth() === viewMonth &&
//                 selectedDate.getDate() === day;
//               const isToday = ds === todayStr;
//
//               let cls = 'tv-datepicker__day';
//               if (isSelected) cls += ' tv-datepicker__day--selected';
//               else if (isToday) cls += ' tv-datepicker__day--today';
//
//               return (
//                 <button
//                   key={day}
//                   type="button"
//                   className={cls}
//                   onClick={() => handleDayClick(viewYear, viewMonth, day)}
//                   aria-label={ds}
//                   aria-pressed={isSelected}
//                 >
//                   {day}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/TeachersView/TeachersView.css
 * ============================================================================
 */
/*
main.tv-page {
  max-width: 1500px;
}

.tv-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 460px;
  margin-bottom: 1.5rem;
}

.tv-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tv-form__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.tv-form__actions {
  padding-top: 0.25rem;
}

.tv-form__submit {
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease;
}

.tv-form__submit:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.tv-form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tv-error {
  color: #b3261e;
  background: #fdeceb;
  border: 1px solid #f3c6c2;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  max-width: 460px;
  margin-bottom: 1rem;
}

.tv-no-schedule {
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 1rem;
}

.tv-grid-wrapper {
  overflow-x: auto;
}

main.tv-result-page {
  max-width: 1500px;
  min-height: calc(100vh - 64px);
  background: linear-gradient(160deg, #f0fdf4 0%, #f5f3ff 55%, #eff6ff 100%);
}

.tv-result-card {
  overflow-x: auto;
  padding: 1.5rem;
}

.tv-result-loading {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-align: center;
  padding: 4rem 0;
}

.tv-search {
  position: relative;
}

.tv-search__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.tv-search__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(47, 111, 79, 0.12);
}

.tv-search__list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(20, 30, 25, 0.12);
  list-style: none;
  margin: 0;
  padding: 0.3rem;
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
}

.tv-search__option {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--color-text);
  transition: background 0.1s ease, color 0.1s ease;
}

.tv-search__option:hover,
.tv-search__option--highlighted {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.tv-datepicker {
  position: relative;
}

.tv-datepicker__row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tv-datepicker__input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.tv-datepicker__input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(47, 111, 79, 0.12);
}

.tv-datepicker__cal-btn {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
}

.tv-datepicker__cal-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.tv-datepicker__calendar {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(20, 30, 25, 0.14);
  padding: 0.75rem;
  z-index: 100;
  min-width: 252px;
}

.tv-datepicker__cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.tv-datepicker__nav {
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s ease, color 0.1s ease;
}

.tv-datepicker__nav:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.tv-datepicker__month-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.tv-datepicker__day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.25rem;
}

.tv-datepicker__day-name {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding: 0.2rem 0;
}

.tv-datepicker__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.tv-datepicker__day {
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  color: var(--color-text);
  padding: 0.35rem 0;
  text-align: center;
  transition: background 0.1s ease, color 0.1s ease;
}

.tv-datepicker__day:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.tv-datepicker__day--today {
  font-weight: 700;
  color: var(--color-accent);
}

.tv-datepicker__day--selected {
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
}

.tv-datepicker__day--selected:hover {
  background: var(--color-accent-dark);
  color: #fff;
}

.tv-datepicker__day--empty {
  pointer-events: none;
}

.tv-grid {
  display: grid;
  grid-template-columns: 180px repeat(22, minmax(55px, 1fr)) 36px;
  width: 100%;
  min-width: 1426px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
  overflow: hidden;
}

.tv-grid__corner {
  background: #fafbfa;
}

.tv-grid__label-cell {
  padding: 0.75rem 0.6rem 0.75rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  background: var(--color-surface);
  position: sticky;
  left: 0;
  z-index: 1;
}

.tv-grid__corner {
  background: #fafbfa;
  z-index: 2;
}

.tv-grid__label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tv-grid__slot-label {
  font-size: 0.68rem;
  text-align: left;
  padding: 0.55rem 0.1rem 0.55rem 3px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid #eceef1;
  white-space: nowrap;
  overflow: hidden;
  background: #fafbfa;
}

.tv-grid__slot-label--hour {
  font-weight: 700;
  color: var(--color-text);
  border-right: 1px solid #d0d2d8;
}

.tv-grid__end-cap {
  border-bottom: 1px solid var(--color-border);
}

.tv-grid__end-cap--label {
  font-size: 0.68rem;
  font-weight: 700;
  text-align: center;
  padding: 0.55rem 0.1rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  background: #fafbfa;
}

.tv-cell {
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 0;
  height: 52px;
  border-bottom: 1px solid var(--color-border);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  background-image: repeating-linear-gradient(
    to right,
    transparent,
    transparent calc(100% / var(--slot-count) - 1px),
    rgba(255, 255, 255, 0.22) calc(100% / var(--slot-count) - 1px),
    rgba(255, 255, 255, 0.22) calc(100% / var(--slot-count))
  );
}

.tv-cell:last-of-type {
  border-right: none;
}

.tv-cell__label {
  font-size: 0.72rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  text-align: center;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.tv-mode-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tv-mode-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
}

.tv-mode-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 700;
}

.tv-mode-btn:hover:not(.tv-mode-btn--active) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tv-summary-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tv-summary-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.tv-summary-period {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.tv-summary-scroll {
  overflow-x: auto;
}

.tv-summary-table {
  width: 100%;
  min-width: 560px;
  border-collapse: collapse;
}

.tv-summary-table th {
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 2px solid var(--color-border);
  background: #fafbfa;
  white-space: nowrap;
}

.tv-summary-table td {
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.tv-summary-day {
  color: var(--color-text-muted);
  font-size: 0.82rem !important;
}

.tv-summary-row {
  cursor: pointer;
  transition: background 0.1s ease;
}

.tv-summary-row:hover td {
  background: var(--color-accent-soft);
}

.tv-summary-break {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.tv-summary-break--yes {
  color: #d97706;
  font-weight: 600;
}

.tv-result-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.tv-print-btn {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease;
}

.tv-print-btn:hover {
  background: var(--color-accent);
  color: #fff;
}

.tv-print-only {
  display: none;
}

@media print {
  .app-header,
  .back-link,
  .tv-result-card {
    display: none !important;
  }

  .tv-print-only {
    display: block !important;
  }

  main.tv-result-page {
    background: none !important;
    min-height: unset !important;
    padding: 0 !important;
    max-width: unset !important;
  }

  body {
    background: #fff !important;
  }

  @page {
    margin: 2cm;
    size: A4 portrait;
  }

  .tv-print-header {
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #333;
    padding-bottom: 1rem;
  }

  .tv-print-header h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .tv-print-teacher {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0.25rem 0;
  }

  .tv-print-date {
    font-size: 0.95rem;
    color: #555;
    margin: 0;
  }

  .tv-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .tv-print-table th {
    background: #f3f4f6;
    padding: 0.6rem 0.75rem;
    text-align: left;
    font-weight: 700;
    border: 1px solid #d1d5db;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .tv-print-table td {
    padding: 0.55rem 0.75rem;
    border: 1px solid #d1d5db;
    vertical-align: middle;
  }

  .tv-print-table tr[data-state="1"] td:first-child { border-left: 4px solid #64748b; }
  .tv-print-table tr[data-state="2"] td:first-child { border-left: 4px solid #16a34a; }
  .tv-print-table tr[data-state="3"] td:first-child { border-left: 4px solid #d97706; }
  .tv-print-table tr[data-state="5"] td:first-child { border-left: 4px solid #7c3aed; }
  .tv-print-table tr[data-state="6"] td:first-child { border-left: 4px solid #9ca3af; }

  .tv-print-table tbody tr:nth-child(even) td {
    background: #f9fafb;
  }

  .tv-print-footer {
    font-size: 0.78rem;
    color: #888;
    text-align: right;
  }

  .tv-print-day {
    page-break-inside: avoid;
    margin-bottom: 1.75rem;
  }

  .tv-print-day__heading {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid #ccc;
    color: #111;
  }
}
*/

/* ============================================================================
 * ORIGINAL PATH: client/src/components/ClassroomView/ClassroomViewPage.jsx
 * ============================================================================
 */
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import DatePickerInput from '../TeachersView/DatePickerInput';
// import './ClassroomView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// const MODES = [
//   { id: 'day',     label: 'Specific Day' },
//   { id: 'overall', label: 'Overall View' },
//   { id: 'range',   label: 'In-between Dates' },
// ];
//
// export default function ClassroomViewPage() {
//   const navigate = useNavigate();
//   const [classrooms, setClassrooms]         = useState([]);
//   const [selectedClassroom, setSelected]    = useState('');
//   const [mode, setMode]                     = useState('day');
//   const [selectedDate, setSelectedDate]     = useState('');
//   const [startDate, setStartDate]           = useState('');
//   const [endDate, setEndDate]               = useState('');
//   const [error, setError]                   = useState(null);
//
//   useEffect(() => {
//     fetch(`${API_BASE_URL}/api/classrooms`)
//       .then(r => r.json())
//       .then(setClassrooms)
//       .catch(() => setError('Could not load classrooms.'));
//   }, []);
//
//   const canSubmit =
//     mode === 'day'     ? Boolean(selectedClassroom && selectedDate) :
//     mode === 'overall' ? Boolean(selectedClassroom) :
//                          Boolean(selectedClassroom && startDate && endDate);
//
//   function handleShow() {
//     if (!canSubmit) return;
//     if (mode === 'overall') {
//       navigate(`/classroom-view/${selectedClassroom}/summary`);
//     } else if (mode === 'range') {
//       navigate(`/classroom-view/${selectedClassroom}/summary?start=${startDate}&end=${endDate}`);
//     } else {
//       navigate(`/classroom-view/${selectedClassroom}/${selectedDate}`);
//     }
//   }
//
//   return (
//     <>
//       <AppHeader />
//       <main className="cv-page">
//         <Link to="/" className="back-link">‹ Back</Link>
//         <h1>Classroom View</h1>
//
//         <div className="surface-card cv-form">
//           <div className="cv-form__field">
//             <label className="cv-form__label">Classroom</label>
//             <select
//               className="cv-select"
//               value={selectedClassroom}
//               onChange={e => { setSelected(e.target.value); setError(null); }}
//             >
//               <option value="">Select a classroom…</option>
//               {classrooms.map(c => (
//                 <option key={c._id} value={c._id}>{c.name}</option>
//               ))}
//             </select>
//           </div>
//
//           <div className="cv-form__field">
//             <label className="cv-form__label">View</label>
//             <div className="cv-mode-selector">
//               {MODES.map(m => (
//                 <button
//                   key={m.id}
//                   type="button"
//                   className={`cv-mode-btn${mode === m.id ? ' cv-mode-btn--active' : ''}`}
//                   onClick={() => { setMode(m.id); setError(null); }}
//                 >
//                   {m.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//
//           {mode === 'day' && (
//             <div className="cv-form__field">
//               <label className="cv-form__label">Date</label>
//               <DatePickerInput value={selectedDate} onChange={setSelectedDate} />
//             </div>
//           )}
//
//           {mode === 'range' && (
//             <>
//               <div className="cv-form__field">
//                 <label className="cv-form__label">From</label>
//                 <DatePickerInput value={startDate} onChange={setStartDate} />
//               </div>
//               <div className="cv-form__field">
//                 <label className="cv-form__label">To</label>
//                 <DatePickerInput value={endDate} onChange={setEndDate} />
//               </div>
//             </>
//           )}
//
//           <div className="cv-form__actions">
//             <button
//               type="button"
//               className="cv-form__submit"
//               disabled={!canSubmit}
//               onClick={handleShow}
//             >
//               Show Schedule
//             </button>
//           </div>
//         </div>
//
//         {error && <p className="cv-error" role="alert">{error}</p>}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/ClassroomView/ClassroomResultPage.jsx
 * ============================================================================
 */
// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import {
//   buildClassroomSlots,
//   groupClassroomSlots,
//   SLOT_LABELS,
//   GROUP_COLORS,
//   ABSENT_COLOR,
// } from '../../utils/classroomScheduleSlots';
// import { formatDisplayTime } from '../../utils/timeSlots';
// import './ClassroomView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// function toMin(t) {
//   const [h, m] = t.split(':').map(Number);
//   return h * 60 + m;
// }
//
// function slotSpan(startTime, endTime) {
//   return (toMin(endTime) - toMin(startTime)) / 30;
// }
//
// function formatLongDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// export default function ClassroomResultPage() {
//   const { classroomId, date } = useParams();
//   const [data, setData]           = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError]         = useState(null);
//
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/schedule/${date}/classroom/${classroomId}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();
//         const slots = buildClassroomSlots(json.teachers);
//         setData({ ...json, slots, groups: groupClassroomSlots(slots) });
//       } catch {
//         setError('Could not load schedule. Please go back and try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     load();
//   }, [classroomId, date]);
//
//   return (
//     <>
//       <AppHeader />
//       <main className="cv-result-page">
//         <Link to="/classroom-view" className="back-link">‹ Back</Link>
//
//         {isLoading && <p className="cv-loading">Loading…</p>}
//         {error     && <p className="cv-error" role="alert">{error}</p>}
//
//         {data && (
//           <>
//             <div className="cv-result-card surface-card">
//               <div className="cv-result-card__actions">
//                 <div className="cv-result-meta">
//                   <span className="cv-result-name">{data.classroomName}</span>
//                   <span className="cv-result-date">{formatLongDate(date)}</span>
//                 </div>
//                 <button className="tv-print-btn" onClick={() => window.print()}>
//                   Print / Download as PDF
//                 </button>
//               </div>
//
//               {data.teachers.length === 0 ? (
//                 <p className="cv-no-schedule">
//                   No schedule found for{' '}
//                   <strong style={{ textTransform: 'capitalize' }}>{data.classroomName}</strong>{' '}
//                   on <strong>{date}</strong>.
//                 </p>
//               ) : (
//                 <div className="cv-hgrid-wrapper">
//                   <div className="cv-hgrid">
//                     {/* ── Time header ── */}
//                     <div className="cv-hgrid-corner" />
//                     {SLOT_LABELS.map((label, i) => (
//                       <div key={i} className="cv-hgrid-time-cell">{label}</div>
//                     ))}
//
//                     {/* ── Single classroom row ── */}
//                     <div className="cv-hgrid-label-cell">
//                       {data.classroomName}
//                     </div>
//                     {data.groups.map((g, i) => {
//                       const isPresent = g.teacherNames.length > 0;
//                       const presentIndex = data.groups.slice(0, i).filter(x => x.teacherNames.length > 0).length;
//                       const c = isPresent ? GROUP_COLORS[presentIndex % GROUP_COLORS.length] : ABSENT_COLOR;
//                       const isLast = i === data.groups.length - 1;
//                       // Last cell spans 1 extra to fill the "6 PM" boundary column
//                       const span = slotSpan(g.startTime, g.endTime) + (isLast ? 1 : 0);
//                       return (
//                         <div
//                           key={i}
//                           className="cv-hgrid-cell"
//                           style={{
//                             gridColumn: `span ${span}`,
//                             background: c.bg,
//                             color: c.color,
//                           }}
//                         >
//                           {isPresent ? g.teacherNames.join(', ') : ''}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//
//             {/* Print-only */}
//             <div className="cv-print-only" aria-hidden="true">
//               <div className="cv-print-header">
//                 <h1>Childcare Care Center</h1>
//                 <p className="cv-print-classroom">{data.classroomName}</p>
//                 <p className="cv-print-date">{formatLongDate(date)}</p>
//               </div>
//               {data.teachers.length === 0 ? (
//                 <p>No schedule found for this classroom on this date.</p>
//               ) : (
//                 <table className="cv-print-table">
//                   <thead>
//                     <tr><th>Time</th><th>Teachers Present</th></tr>
//                   </thead>
//                   <tbody>
//                     {data.groups.map((g, i) => (
//                       <tr key={i} data-present={g.teacherNames.length > 0}>
//                         <td>{formatDisplayTime(g.startTime)} – {formatDisplayTime(g.endTime)}</td>
//                         <td>{g.teacherNames.length > 0 ? g.teacherNames.join(', ') : 'No teacher'}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//               <p className="cv-print-footer">Generated at: {new Date().toLocaleString()}</p>
//             </div>
//           </>
//         )}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/ClassroomView/ClassroomSummaryPage.jsx
 * ============================================================================
 */
// import { useEffect, useState, Fragment } from 'react';
// import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
// import AppHeader from '../common/AppHeader';
// import {
//   buildClassroomSlots,
//   groupClassroomSlots,
//   SLOT_LABELS,
//   GROUP_COLORS,
//   ABSENT_COLOR,
// } from '../../utils/classroomScheduleSlots';
// import { formatDisplayTime } from '../../utils/timeSlots';
// import './ClassroomView.css';
//
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
//
// function toMin(t) {
//   const [h, m] = t.split(':').map(Number);
//   return h * 60 + m;
// }
//
// function slotSpan(startTime, endTime) {
//   return (toMin(endTime) - toMin(startTime)) / 30;
// }
//
// function formatGridDate(dateStr) {
//   const d = new Date(dateStr + 'T00:00:00');
//   const weekday  = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
//   const monthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
//   return `${weekday}, ${monthDay}`;
// }
//
// function formatShortDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     month: 'short', day: 'numeric', year: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// function formatLongDate(dateStr) {
//   return new Intl.DateTimeFormat('en-US', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   }).format(new Date(dateStr + 'T00:00:00'));
// }
//
// export default function ClassroomSummaryPage() {
//   const { classroomId } = useParams();
//   const [searchParams]  = useSearchParams();
//   const navigate        = useNavigate();
//
//   const start = searchParams.get('start') || '';
//   const end   = searchParams.get('end')   || '';
//
//   const [data, setData]           = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError]         = useState(null);
//
//   useEffect(() => {
//     async function load() {
//       try {
//         let url = `${API_BASE_URL}/api/classroom/${classroomId}/schedule`;
//         if (start && end) url += `?start=${start}&end=${end}`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         setData(await res.json());
//       } catch {
//         setError('Could not load schedule data. Please go back and try again.');
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     load();
//   }, [classroomId, start, end]);
//
//   const periodLabel = start && end
//     ? `${formatShortDate(start)} – ${formatShortDate(end)}`
//     : 'All recorded dates';
//
//   return (
//     <>
//       <AppHeader />
//       <main className="cv-result-page">
//         <Link to="/classroom-view" className="back-link">‹ Back</Link>
//
//         {isLoading && <p className="cv-loading">Loading…</p>}
//         {error     && <p className="cv-error" role="alert">{error}</p>}
//
//         {data && (
//           <>
//             <div className="cv-result-card surface-card">
//               <div className="cv-result-card__actions">
//                 <div className="cv-result-meta">
//                   <span className="cv-result-name">{data.classroomName}</span>
//                   <span className="cv-result-date">{periodLabel}</span>
//                 </div>
//                 <button className="tv-print-btn" onClick={() => window.print()}>
//                   Print / Download as PDF
//                 </button>
//               </div>
//
//               {data.days.length === 0 ? (
//                 <p className="cv-no-schedule">No schedule found for this period.</p>
//               ) : (
//                 <div className="cv-hgrid-wrapper">
//                   <div className="cv-hgrid cv-hgrid--multi">
//                     {/* ── Time header ── */}
//                     <div className="cv-hgrid-corner" />
//                     {SLOT_LABELS.map((label, i) => (
//                       <div key={i} className="cv-hgrid-time-cell">{label}</div>
//                     ))}
//
//                     {/* ── One row per day ── */}
//                     {data.days.map(day => {
//                       const groups = groupClassroomSlots(buildClassroomSlots(day.teachers));
//                       return (
//                         <Fragment key={day.date}>
//                           <div
//                             className="cv-hgrid-label-cell cv-hgrid-label-cell--date"
//                             onClick={() => navigate(`/classroom-view/${classroomId}/${day.date}`)}
//                             title={`View full schedule for ${formatLongDate(day.date)}`}
//                           >
//                             {formatGridDate(day.date)}
//                           </div>
//                           {groups.map((g, i) => {
//                             const isPresent = g.teacherNames.length > 0;
//                             const presentIndex = groups.slice(0, i).filter(x => x.teacherNames.length > 0).length;
//                             const c = isPresent ? GROUP_COLORS[presentIndex % GROUP_COLORS.length] : ABSENT_COLOR;
//                             const isLast = i === groups.length - 1;
//                             const span = slotSpan(g.startTime, g.endTime) + (isLast ? 1 : 0);
//                             return (
//                               <div
//                                 key={i}
//                                 className="cv-hgrid-cell"
//                                 style={{ gridColumn: `span ${span}`, background: c.bg, color: c.color }}
//                                 onClick={() => navigate(`/classroom-view/${classroomId}/${day.date}`)}
//                               >
//                                 {isPresent ? g.teacherNames.join(', ') : ''}
//                               </div>
//                             );
//                           })}
//                         </Fragment>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//
//             {/* Print-only — Option B: full grouped detail per day */}
//             <div className="cv-print-only" aria-hidden="true">
//               <div className="cv-print-header">
//                 <h1>Childcare Care Center</h1>
//                 <p className="cv-print-classroom">{data.classroomName}</p>
//                 <p className="cv-print-date">{periodLabel}</p>
//               </div>
//
//               {data.days.map(day => {
//                 const groups = groupClassroomSlots(buildClassroomSlots(day.teachers));
//                 return (
//                   <div key={day.date} className="cv-print-day">
//                     <h2 className="cv-print-day__heading">{formatLongDate(day.date)}</h2>
//                     <table className="cv-print-table">
//                       <thead>
//                         <tr><th>Time</th><th>Teachers Present</th></tr>
//                       </thead>
//                       <tbody>
//                         {groups.map((g, i) => (
//                           <tr key={i} data-present={g.teacherNames.length > 0}>
//                             <td>{formatDisplayTime(g.startTime)} – {formatDisplayTime(g.endTime)}</td>
//                             <td style={{ textTransform: 'capitalize' }}>
//                               {g.teacherNames.length > 0 ? g.teacherNames.join(', ') : 'No teacher'}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 );
//               })}
//
//               <p className="cv-print-footer">Generated at: {new Date().toLocaleString()}</p>
//             </div>
//           </>
//         )}
//       </main>
//     </>
//   );
// }

/* ============================================================================
 * ORIGINAL PATH: client/src/components/ClassroomView/ClassroomView.css
 * ============================================================================
 */
/*
main.cv-page {
  max-width: 600px;
}

main.cv-result-page {
  max-width: 900px;
  min-height: calc(100vh - 64px);
}

.cv-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 460px;
  margin-bottom: 1.5rem;
}

.cv-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cv-form__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.cv-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.cv-select:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(47, 111, 79, 0.12);
}

.cv-form__actions {
  padding-top: 0.25rem;
}

.cv-form__submit {
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s ease;
}

.cv-form__submit:hover:not(:disabled) {
  background: var(--color-accent-dark);
}

.cv-form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cv-mode-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cv-mode-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease, color 0.12s ease;
}

.cv-mode-btn--active {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 700;
}

.cv-mode-btn:hover:not(.cv-mode-btn--active) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.cv-error {
  color: #b3261e;
  background: #fdeceb;
  border: 1px solid #f3c6c2;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  max-width: 460px;
  margin-bottom: 1rem;
}

.cv-no-schedule {
  color: var(--color-text-muted);
  font-style: italic;
}

.cv-loading {
  color: var(--color-text-muted);
  font-size: 1rem;
  text-align: center;
  padding: 4rem 0;
}

.cv-result-card {
  padding: 1.5rem;
}

.cv-result-card__actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cv-result-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.cv-result-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: capitalize;
}

.cv-result-date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.cv-hgrid-wrapper {
  overflow-x: auto;
}

.cv-hgrid {
  display: grid;
  grid-template-columns: 140px repeat(23, minmax(48px, 1fr));
  min-width: 1250px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.cv-hgrid-corner {
  background: #fafbfa;
  border-right: 2px solid var(--color-border);
  border-bottom: 2px solid var(--color-border);
}

.cv-hgrid-time-cell {
  padding: 0.3rem 0.1rem;
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  background: #fafbfa;
  border-bottom: 2px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1.2;
}

.cv-hgrid-label-cell {
  padding: 0.6rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text);
  background: #fafbfa;
  border-right: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  text-transform: capitalize;
  word-break: break-word;
}

.cv-hgrid-cell {
  padding: 0.5rem 0.35rem;
  min-height: 54px;
  border-right: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.35;
  text-transform: capitalize;
  transition: filter 0.1s ease;
}

.cv-hgrid-cell:hover {
  filter: brightness(0.95);
}

.cv-hgrid--multi .cv-hgrid-label-cell {
  border-bottom: 1px solid var(--color-border);
}

.cv-hgrid--multi .cv-hgrid-cell {
  border-bottom: 1px solid rgba(255, 255, 255, 0.55);
}

.cv-hgrid-label-cell--date {
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 600;
  white-space: normal;
  line-height: 1.35;
  color: var(--color-text);
}

.cv-hgrid-label-cell--date:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.cv-summary-scroll {
  overflow-x: auto;
}

.cv-summary-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
}

.cv-summary-table th {
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 2px solid var(--color-border);
  background: #fafbfa;
  white-space: nowrap;
}

.cv-summary-table td {
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.cv-summary-day {
  color: var(--color-text-muted);
  font-size: 0.82rem !important;
}

.cv-summary-row {
  cursor: pointer;
  transition: background 0.1s ease;
}

.cv-summary-row:hover td {
  background: var(--color-accent-soft);
}

.cv-print-only {
  display: none;
}

@media print {
  .app-header,
  .back-link,
  .cv-result-card {
    display: none !important;
  }

  .cv-print-only {
    display: block !important;
  }

  main.cv-result-page {
    background: none !important;
    min-height: unset !important;
    padding: 0 !important;
    max-width: unset !important;
  }

  body {
    background: #fff !important;
  }

  @page {
    margin: 2cm;
    size: A4 portrait;
  }

  .cv-print-header {
    text-align: center;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #333;
    padding-bottom: 1rem;
  }

  .cv-print-header h1 {
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .cv-print-classroom {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0.25rem 0;
    text-transform: capitalize;
  }

  .cv-print-date {
    font-size: 0.95rem;
    color: #555;
    margin: 0;
  }

  .cv-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .cv-print-table th {
    background: #f3f4f6;
    padding: 0.6rem 0.75rem;
    text-align: left;
    font-weight: 700;
    border: 1px solid #d1d5db;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .cv-print-table td {
    padding: 0.55rem 0.75rem;
    border: 1px solid #d1d5db;
    vertical-align: middle;
  }

  .cv-print-table tr[data-present="true"] td:first-child  { border-left: 4px solid #16a34a; }
  .cv-print-table tr[data-present="false"] td:first-child { border-left: 4px solid #d1d5db; }

  .cv-print-table tbody tr:nth-child(even) td {
    background: #f9fafb;
  }

  .cv-print-day {
    page-break-inside: avoid;
    margin-bottom: 1.75rem;
  }

  .cv-print-day__heading {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    padding-bottom: 0.3rem;
    border-bottom: 1px solid #ccc;
    color: #111;
  }

  .cv-print-footer {
    font-size: 0.78rem;
    color: #888;
    text-align: right;
  }
}
*/
