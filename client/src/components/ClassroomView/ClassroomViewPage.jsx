import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import DatePickerInput from '../TeachersView/DatePickerInput';
import './ClassroomView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MODES = [
  { id: 'day',     label: 'Specific Day' },
  { id: 'overall', label: 'Overall View' },
  { id: 'range',   label: 'In-between Dates' },
];

export default function ClassroomViewPage() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms]         = useState([]);
  const [selectedClassroom, setSelected]    = useState('');
  const [mode, setMode]                     = useState('day');
  const [selectedDate, setSelectedDate]     = useState('');
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [error, setError]                   = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/classrooms`)
      .then(r => r.json())
      .then(setClassrooms)
      .catch(() => setError('Could not load classrooms.'));
  }, []);

  const canSubmit =
    mode === 'day'     ? Boolean(selectedClassroom && selectedDate) :
    mode === 'overall' ? Boolean(selectedClassroom) :
                         Boolean(selectedClassroom && startDate && endDate);

  function handleShow() {
    if (!canSubmit) return;
    if (mode === 'overall') {
      navigate(`/classroom-view/${selectedClassroom}/summary`);
    } else if (mode === 'range') {
      navigate(`/classroom-view/${selectedClassroom}/summary?start=${startDate}&end=${endDate}`);
    } else {
      navigate(`/classroom-view/${selectedClassroom}/${selectedDate}`);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="cv-page">
        <Link to="/" className="back-link">‹ Back</Link>
        <h1>Classroom View</h1>

        <div className="surface-card cv-form">
          <div className="cv-form__field">
            <label className="cv-form__label">Classroom</label>
            <select
              className="cv-select"
              value={selectedClassroom}
              onChange={e => { setSelected(e.target.value); setError(null); }}
            >
              <option value="">Select a classroom…</option>
              {classrooms.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="cv-form__field">
            <label className="cv-form__label">View</label>
            <div className="cv-mode-selector">
              {MODES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`cv-mode-btn${mode === m.id ? ' cv-mode-btn--active' : ''}`}
                  onClick={() => { setMode(m.id); setError(null); }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'day' && (
            <div className="cv-form__field">
              <label className="cv-form__label">Date</label>
              <DatePickerInput value={selectedDate} onChange={setSelectedDate} />
            </div>
          )}

          {mode === 'range' && (
            <>
              <div className="cv-form__field">
                <label className="cv-form__label">From</label>
                <DatePickerInput value={startDate} onChange={setStartDate} />
              </div>
              <div className="cv-form__field">
                <label className="cv-form__label">To</label>
                <DatePickerInput value={endDate} onChange={setEndDate} />
              </div>
            </>
          )}

          <div className="cv-form__actions">
            <button
              type="button"
              className="cv-form__submit"
              disabled={!canSubmit}
              onClick={handleShow}
            >
              Show Schedule
            </button>
          </div>
        </div>

        {error && <p className="cv-error" role="alert">{error}</p>}
      </main>
    </>
  );
}
