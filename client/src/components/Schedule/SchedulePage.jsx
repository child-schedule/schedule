import { useParams } from 'react-router-dom';
import { useSchedule } from '../../hooks/useSchedule';
import CopyDayModal from './CopyDayModal';
import ScheduleGrid from './ScheduleGrid';

function SchedulePage() {
  const { date } = useParams();
  const { schedule, isLoading, showCopyModal, previousDateKey, copyFromPrevious, startFresh } =
    useSchedule(date);

  return (
    <main>
      <h1>Schedule for {date}</h1>
      {isLoading ? <p aria-busy="true">Loading schedule…</p> : <ScheduleGrid rows={schedule.rows} />}
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
