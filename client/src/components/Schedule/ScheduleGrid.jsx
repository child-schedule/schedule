import { useState } from 'react';
import ScheduleRow from './ScheduleRow';
import AssignmentDropdown from '../Dropdown/AssignmentDropdown';
import { useDragSelect } from '../../hooks/useDragSelect';
import { generateTimeSlots, formatDisplayTime } from '../../utils/timeSlots';
import './ScheduleGrid.css';

// Virtual row id for the trailing "add new row" affordance. The grid starts
// with zero real rows, and rows are only ever created via the Teacher +
// Classroom dropdown choice — so this placeholder is the entry point for the
// very first assignment (not explicitly described in the project plan; see
// PROGRESS.md for the reasoning).
const NEW_ROW_ID = '__new__';

function ScheduleGrid({ schedule, date, onScheduleUpdate }) {
  const slots = generateTimeSlots();
  const rows = schedule.rows;
  const [pendingSelection, setPendingSelection] = useState(null);

  function handleSelectionComplete(rowId, startIndex, endIndex) {
    const startTime = slots[startIndex].start;
    const endTime = slots[endIndex].end;

    if (rowId === NEW_ROW_ID) {
      setPendingSelection({
        rowId: null,
        rowLabel: 'New assignment',
        teacherId: null,
        classroomId: null,
        startTime,
        endTime,
      });
      return;
    }

    const row = rows.find((r) => r.rowId === rowId);
    if (!row) return;

    setPendingSelection({
      rowId: row.rowId,
      rowLabel: row.rowLabel,
      teacherId: row.teacherId,
      classroomId: row.classroomId,
      startTime,
      endTime,
    });
  }

  const { startDrag, extendDrag, isSlotSelected } = useDragSelect(handleSelectionComplete);

  return (
    <div className="schedule-grid">
      <div className="schedule-grid__header">
        <div className="schedule-row__label" />
        <div className="schedule-row__slots">
          {slots.map((slot) => {
            const isHourMark = slot.start.endsWith(':00');
            return (
              <div
                key={slot.start}
                className={`schedule-grid__slot-label${isHourMark ? ' schedule-grid__slot-label--hour' : ''}`}
              >
                {isHourMark ? formatDisplayTime(slot.start) : ''}
              </div>
            );
          })}
        </div>
      </div>

      {rows.length === 0 && (
        <p className="schedule-grid__empty">No teachers assigned yet — drag below to create the first assignment.</p>
      )}

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

      <ScheduleRow
        rowLabel="+ Add new row"
        blocks={[]}
        slots={slots}
        isPlaceholder
        onSlotMouseDown={(index) => startDrag(NEW_ROW_ID, index)}
        onSlotMouseEnter={(index) => extendDrag(NEW_ROW_ID, index)}
        isSlotSelected={(index) => isSlotSelected(NEW_ROW_ID, index)}
      />

      <AssignmentDropdown
        key={pendingSelection ? `${pendingSelection.rowId}-${pendingSelection.startTime}-${pendingSelection.endTime}` : 'closed'}
        isOpen={Boolean(pendingSelection)}
        selection={pendingSelection}
        date={date}
        rows={rows}
        onScheduleUpdate={onScheduleUpdate}
        onClose={() => setPendingSelection(null)}
      />
    </div>
  );
}

export default ScheduleGrid;
