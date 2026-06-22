import { useParams } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import CopyDayModal from './CopyDayModal';

function SchedulePage() {
  const { date } = useParams();
  const { schedule, isLoading, showCopyModal, previousDateKey, copyFromPrevious, startFresh } =
    useSchedule(date);

  return (
    <main>
      <h1>Schedule for {date}</h1>
      {isLoading ? (
        <p aria-busy="true">Loading schedule…</p>
      ) : (
        <p>
          {schedule.rows.length === 0
            ? 'No assignments yet for this date.'
            : `${schedule.rows.length} row(s) scheduled.`}
        </p>
      )}
      <p>Schedule grid placeholder — built in Layer 9.</p>
      <CopyDayModal
        isOpen={showCopyModal}
        previousDateKey={previousDateKey}
        onCopy={copyFromPrevious}
        onStartFresh={startFresh}
      />
    </main>
  );
}

export default SchedulePage;
