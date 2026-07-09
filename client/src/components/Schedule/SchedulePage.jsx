import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import AppHeader from '../common/AppHeader';
import ErrorToast from '../common/ErrorToast';
import CopyDayModal from './CopyDayModal';
import CopyPreviousModal from './CopyPreviousModal';
import SaveConfirmModal from './SaveConfirmModal';
import ScheduleGrid from './ScheduleGrid';
import SchedulePrintView from './SchedulePrintView';

function describeError(err) {
  return err.response?.data?.error || 'Could not copy the previous day. Try again.';
}

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
  const [showCopyPreviousConfirm, setShowCopyPreviousConfirm] = useState(false);
  const [isCopyingPrevious, setIsCopyingPrevious] = useState(false);
  const [copyPreviousError, setCopyPreviousError] = useState(null);

  async function handleConfirmCopyPrevious() {
    setIsCopyingPrevious(true);
    setCopyPreviousError(null);
    try {
      await copyFromPrevious();
      setShowCopyPreviousConfirm(false);
    } catch (err) {
      setCopyPreviousError(describeError(err));
    } finally {
      setIsCopyingPrevious(false);
    }
  }

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
                className="secondary"
                disabled={isCopyingPrevious}
                onClick={() => setShowCopyPreviousConfirm(true)}
              >
                Copy Previous Day
              </button>
              <button
                type="button"
                className="primary"
                disabled={!isDirty || isSaving}
                onClick={handleSaveClick}
              >
                {isSaving ? 'Saving…' : 'Save Schedule'}
              </button>
              <button
                type="button"
                className="secondary"
                disabled={!isPublished}
                title={isPublished ? undefined : 'Save the schedule before printing'}
                onClick={() => window.print()}
              >
                Print
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
        {!isLoading && <SchedulePrintView dateLabel={formatLongDate(date)} rows={schedule.rows} />}
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
        <CopyPreviousModal
          isOpen={showCopyPreviousConfirm}
          previousDateKey={previousDateKey}
          onConfirm={handleConfirmCopyPrevious}
          onCancel={() => setShowCopyPreviousConfirm(false)}
        />
        <ErrorToast message={copyPreviousError} onDismiss={() => setCopyPreviousError(null)} />
      </main>
    </>
  );
}

export default SchedulePage;
