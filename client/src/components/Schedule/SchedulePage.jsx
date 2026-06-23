import { Link, useParams } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import AppHeader from '../common/AppHeader';
import CopyDayModal from './CopyDayModal';
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
  } = useSchedule(date);

  return (
    <>
      <AppHeader />
      <main className="schedule-page">
        <Link to="/" className="back-link">
          ‹ Calendar
        </Link>
        <h1>{formatLongDate(date)}</h1>
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
      </main>
    </>
  );
}

export default SchedulePage;
