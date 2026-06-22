import { useState } from 'react';
import ScheduleRow from './ScheduleRow';
import AssignmentDropdown from '../Dropdown/AssignmentDropdown';
import { useDragSelect } from '../../hooks/useDragSelect';
import { generateTimeSlots } from '../../utils/timeSlots';
import './ScheduleGrid.css';

function ScheduleGrid({ rows }) {
  const slots = generateTimeSlots();
  const [pendingSelection, setPendingSelection] = useState(null);

  function handleSelectionComplete(rowId, startIndex, endIndex) {
    const row = rows.find((r) => r.rowId === rowId);
    if (!row) return;

    setPendingSelection({
      rowId,
      rowLabel: row.rowLabel,
      startTime: slots[startIndex].start,
      endTime: slots[endIndex].end,
    });
  }

  const { startDrag, extendDrag, isSlotSelected } = useDragSelect(handleSelectionComplete);

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
        <ScheduleRow
          key={row.rowId}
          rowLabel={row.rowLabel}
          blocks={row.blocks}
          slots={slots}
          onSlotMouseDown={(index) => startDrag(row.rowId, index)}
          onSlotMouseEnter={(index) => extendDrag(row.rowId, index)}
          isSlotSelected={(index) => isSlotSelected(row.rowId, index)}
        />
      ))}
      <AssignmentDropdown
        isOpen={Boolean(pendingSelection)}
        selection={pendingSelection}
        onClose={() => setPendingSelection(null)}
      />
    </div>
  );
}

export default ScheduleGrid;
