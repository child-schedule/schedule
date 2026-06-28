import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import TeacherSearchInput from './TeacherSearchInput';
import DatePickerInput from './DatePickerInput';
import './TeachersView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeachersViewPage() {
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [noSchedule, setNoSchedule] = useState(null); // { teacherName, date } | null
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = Boolean(selectedTeacher && selectedDate);

  function handleTeacherSelect(teacher) {
    setSelectedTeacher(teacher);
    setNoSchedule(null);
    setError(null);
  }

  function handleDateChange(dateStr) {
    setSelectedDate(dateStr);
    setNoSchedule(null);
    setError(null);
  }

  async function handleShowSchedule() {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    setNoSchedule(null);

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
            <label className="tv-form__label" htmlFor="teacher-search">
              Teacher
            </label>
            <TeacherSearchInput onSelect={handleTeacherSelect} />
          </div>

          <div className="tv-form__field">
            <label className="tv-form__label" htmlFor="date-input">
              Date
            </label>
            <DatePickerInput value={selectedDate} onChange={handleDateChange} />
          </div>

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

        {error && (
          <p className="tv-error" role="alert">{error}</p>
        )}

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
