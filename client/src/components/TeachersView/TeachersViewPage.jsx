import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import TeacherSearchInput from './TeacherSearchInput';
import DatePickerInput from './DatePickerInput';
import './TeachersView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MODES = [
  { id: 'day',     label: 'Specific Day' },
  { id: 'overall', label: 'Overall View' },
  { id: 'range',   label: 'In-between Dates' },
];

export default function TeachersViewPage() {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [mode, setMode] = useState('day');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [noSchedule, setNoSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    mode === 'day'     ? Boolean(selectedTeacher && selectedDate) :
    mode === 'overall' ? Boolean(selectedTeacher) :
                         Boolean(selectedTeacher && startDate && endDate);

  function handleTeacherSelect(teacher) {
    setSelectedTeacher(teacher);
    setNoSchedule(null);
    setError(null);
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    setNoSchedule(null);
    setError(null);
  }

  async function handleShowSchedule() {
    if (!canSubmit) return;
    setError(null);
    setNoSchedule(null);

    if (mode === 'overall') {
      navigate(`/teachers-view/${selectedTeacher._id}/summary`);
      return;
    }

    if (mode === 'range') {
      navigate(`/teachers-view/${selectedTeacher._id}/summary?start=${startDate}&end=${endDate}`);
      return;
    }

    // Specific day — check if schedule exists before navigating
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/schedule/${selectedDate}/teacher/${selectedTeacher._id}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.blocks.length === 0) {
        setNoSchedule({ teacherName: data.teacherName, date: data.date });
      } else {
        navigate(`/teachers-view/${selectedTeacher._id}/${selectedDate}`);
      }
    } catch {
      setError('Could not load schedule. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="tv-page">
        <Link to="/" className="back-link">‹ Back</Link>
        <h1>Teachers View</h1>

        <div className="surface-card tv-form">
          <div className="tv-form__field">
            <label className="tv-form__label">Teacher</label>
            <TeacherSearchInput onSelect={handleTeacherSelect} />
          </div>

          <div className="tv-form__field">
            <label className="tv-form__label">View</label>
            <div className="tv-mode-selector">
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`tv-mode-btn${mode === m.id ? ' tv-mode-btn--active' : ''}`}
                  onClick={() => handleModeChange(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'day' && (
            <div className="tv-form__field">
              <label className="tv-form__label">Date</label>
              <DatePickerInput value={selectedDate} onChange={v => { setSelectedDate(v); setNoSchedule(null); setError(null); }} />
            </div>
          )}

          {mode === 'range' && (
            <>
              <div className="tv-form__field">
                <label className="tv-form__label">From</label>
                <DatePickerInput value={startDate} onChange={v => { setStartDate(v); setError(null); }} />
              </div>
              <div className="tv-form__field">
                <label className="tv-form__label">To</label>
                <DatePickerInput value={endDate} onChange={v => { setEndDate(v); setError(null); }} />
              </div>
            </>
          )}

          <div className="tv-form__actions">
            <button
              type="button"
              className="tv-form__submit"
              disabled={!canSubmit || isLoading}
              onClick={handleShowSchedule}
            >
              {isLoading ? 'Loading…' : 'Show Schedule'}
            </button>
          </div>
        </div>

        {error && <p className="tv-error" role="alert">{error}</p>}

        {noSchedule && (
          <p className="tv-no-schedule">
            No schedule found for <strong>{noSchedule.teacherName}</strong> on{' '}
            <strong>{noSchedule.date}</strong>.
          </p>
        )}
      </main>
    </>
  );
}
