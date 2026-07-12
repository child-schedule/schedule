import { Fragment } from 'react';
import { generateTimeSlots, findBlockForSlot, formatSlotRangeLabel } from '../../utils/timeSlots';
import { getStatusLabel } from '../../utils/colorMap';
import './SchedulePrintView.css';

// Only the "meaningful" states get a legend entry — an empty/white cell is
// the absence of an assignment, not something that needs explaining.
const LEGEND_STATUSES = ['green', 'yellow', 'orange', 'blue'];

// Print-only rendering of the *published* schedule (schedule.rows), reusing
// the same slot-grid logic ScheduleGrid/ScheduleRow use for the on-screen
// draft view. Hidden on screen (see SchedulePrintView.css); revealed only
// inside @media print, alongside the screen-only chrome being hidden there.
function SchedulePrintView({ dateLabel, rows }) {
  const slots = generateTimeSlots();

  return (
    <div className="schedule-print-only" aria-hidden="true">
      <div className="schedule-print__header">
        <h1>Childcare Scheduler</h1>
        <p className="schedule-print__date">{dateLabel}</p>
      </div>

      <div className="schedule-print__legend">
        {LEGEND_STATUSES.map((status) => (
          <span key={status} className="schedule-print__legend-item">
            <span className={`schedule-print__swatch schedule-print__swatch--${status}`} />
            {getStatusLabel(status)}
          </span>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="schedule-print__empty">No teachers assigned for this day.</p>
      ) : (
        <div className="schedule-print__grid" role="grid" aria-label="Schedule">
          <div className="schedule-print__cell schedule-print__corner" />
          {slots.map((slot) => {
            const isHourMark = slot.start.endsWith(':00');
            const { start, end } = formatSlotRangeLabel(slot);
            return (
              <div
                key={slot.start}
                className={`schedule-print__cell schedule-print__slot-label${
                  isHourMark ? ' schedule-print__slot-label--hour' : ''
                }`}
              >
                {start}-{end}
              </div>
            );
          })}

          {rows.map((row) => (
            <Fragment key={row.rowId}>
              <div className="schedule-print__cell schedule-print__row-label">{row.rowLabel}</div>
              {slots.map((slot) => {
                const block = findBlockForSlot(row.blocks, slot);
                const status = block ? block.status : 'white';
                return (
                  <div
                    key={slot.start}
                    className={`schedule-print__cell schedule-print__block schedule-print__block--${status}`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      )}

      <p className="schedule-print__footer">Generated at: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default SchedulePrintView;
