import ScheduleRow from './ScheduleRow';
import { generateTimeSlots } from '../../utils/timeSlots';
import './ScheduleGrid.css';

function ScheduleGrid({ rows }) {
  const slots = generateTimeSlots();

  if (rows.length === 0) {
    return <p className="schedule-grid__empty">No teachers assigned yet for this date.</p>;
  }

  return (
    <div className="schedule-grid">
      <div className="schedule-grid__header">
        <div className="schedule-row__label" />
        <div className="schedule-row__slots">
          {slots.map((slot) => (
            <div key={slot.start} className="schedule-grid__slot-label">
              {slot.start}
            </div>
          ))}
        </div>
      </div>
      {rows.map((row) => (
        <ScheduleRow key={row.rowId} rowLabel={row.rowLabel} blocks={row.blocks} slots={slots} />
      ))}
    </div>
  );
}

export default ScheduleGrid;
