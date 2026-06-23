import { useState } from 'react';
import ScheduleRow from './ScheduleRow';
import AssignmentDropdown from '../Dropdown/AssignmentDropdown';
import BlockContextMenu from '../Block/BlockContextMenu';
import { useDragSelect } from '../../hooks/useDragSelect';
import { generateTimeSlots, formatDisplayTime, findBlockForSlot } from '../../utils/timeSlots';
import { deleteRow } from '../../api/scheduleApi';
import './ScheduleGrid.css';

// Virtual row id for the trailing "add new row" affordance. The grid starts
// with zero real rows, and rows are only ever created via the Teacher +
// Classroom dropdown choice — so this placeholder is the entry point for the
// very first assignment (not explicitly described in the project plan; see
// PROGRESS.md for the reasoning).
const NEW_ROW_ID = '__new__';

// Short label shown above every half-hour column. AM/PM is only spelled out
// at the very first slot and at the noon flip, otherwise it'd be repeated on
// every single column.
function formatSlotLabel(time, index) {
  const full = formatDisplayTime(time);
  if (index === 0 || time === '12:00') return full;
  return full.replace(/ (AM|PM)$/, '');
}

function ScheduleGrid({ schedule, date, onScheduleUpdate }) {
  const slots = generateTimeSlots();
  // The grid always edits the working draft, never the published schedule
  // directly — nothing here is visible elsewhere until Apply is clicked.
  const rows = schedule.draftRows;
  const [pendingSelection, setPendingSelection] = useState(null);
  const [pendingBlockMenu, setPendingBlockMenu] = useState(null);

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

    // A single click (no drag) on a slot that's already part of a block opens
    // the edit/delete context menu instead of starting a new assignment.
    if (startIndex === endIndex) {
      const existingBlock = findBlockForSlot(row.blocks, slots[startIndex]);
      if (existingBlock) {
        setPendingBlockMenu({
          ...existingBlock,
          rowId: row.rowId,
          rowLabel: row.rowLabel,
          teacherId: row.teacherId,
          classroomId: row.classroomId,
        });
        return;
      }
    }

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

  async function handleDeleteRow(rowId) {
    const updated = await deleteRow(date, rowId);
    onScheduleUpdate(updated);
  }

  function handleEditBlock(block) {
    setPendingBlockMenu(null);
    setPendingSelection({
      rowId: block.rowId,
      rowLabel: block.rowLabel,
      teacherId: block.teacherId,
      classroomId: block.classroomId,
      startTime: block.startTime,
      endTime: block.endTime,
      blockId: block.blockId,
      status: block.status,
    });
  }

  return (
    <div className="schedule-grid">
      <div className="schedule-grid__header">
        <div className="schedule-row__label" />
        <div className="schedule-row__slots">
          {slots.map((slot, index) => {
            const isHourMark = slot.start.endsWith(':00');
            return (
              <div
                key={slot.start}
                className={`schedule-grid__slot-label${isHourMark ? ' schedule-grid__slot-label--hour' : ''}`}
              >
                {formatSlotLabel(slot.start, index)}
              </div>
            );
          })}
          <div className="schedule-grid__end-cap schedule-grid__end-cap--label">
            {formatDisplayTime(slots[slots.length - 1].end)}
          </div>
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
          onDeleteRow={() => handleDeleteRow(row.rowId)}
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
        key={
          pendingSelection
            ? `${pendingSelection.rowId}-${pendingSelection.blockId || ''}-${pendingSelection.startTime}-${pendingSelection.endTime}`
            : 'closed'
        }
        isOpen={Boolean(pendingSelection)}
        selection={pendingSelection}
        date={date}
        rows={rows}
        onScheduleUpdate={onScheduleUpdate}
        onClose={() => setPendingSelection(null)}
      />

      <BlockContextMenu
        isOpen={Boolean(pendingBlockMenu)}
        block={pendingBlockMenu}
        date={date}
        onEdit={handleEditBlock}
        onScheduleUpdate={onScheduleUpdate}
        onClose={() => setPendingBlockMenu(null)}
      />
    </div>
  );
}

export default ScheduleGrid;
