import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import AppHeader from '../common/AppHeader';
import CopyDayModal from './CopyDayModal';
import SaveConfirmModal from './SaveConfirmModal';
import ScheduleGrid from './ScheduleGrid';

function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function SchedulePage() {
  const { date } = useParams();
  const {
    schedule,
    isLoading,
    showCopyModal,
    previousDateKey,
    copyFromPrevious,
    startFresh,
    applyScheduleUpdate,
    isPublished,
    isDirty,
    applyAndSave,
  } = useSchedule(date);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveClick() {
    if (isPublished) {
      setShowSaveConfirm(true);
      return;
    }
    setIsSaving(true);
    try {
      await applyAndSave();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmSave() {
    setIsSaving(true);
    try {
      await applyAndSave();
      setShowSaveConfirm(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main className="schedule-page">
        <Link to="/" className="back-link">
          ‹ Calendar
        </Link>
        <div className="schedule-page__heading">
          <h1>{formatLongDate(date)}</h1>
          {!isLoading && (
            <div className="schedule-page__save">
              <span className={`schedule-page__status${isDirty ? ' schedule-page__status--dirty' : ''}`}>
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
              <button
                type="button"
                className="primary"
                disabled={!isDirty || isSaving}
                onClick={handleSaveClick}
              >
                {isSaving ? 'Saving…' : 'Save Schedule'}
              </button>
            </div>
          )}
        </div>
        <div className="schedule-card">
          {isLoading ? (
            <p aria-busy="true">Loading schedule…</p>
          ) : (
            <ScheduleGrid schedule={schedule} date={date} onScheduleUpdate={applyScheduleUpdate} />
          )}
        </div>
        <CopyDayModal
          isOpen={showCopyModal}
          previousDateKey={previousDateKey}
          onCopy={copyFromPrevious}
          onStartFresh={startFresh}
        />
        <SaveConfirmModal
          isOpen={showSaveConfirm}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowSaveConfirm(false)}
        />
      </main>
    </>
  );
}

export default SchedulePage;
