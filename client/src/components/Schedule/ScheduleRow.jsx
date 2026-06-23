import TimeBlock from './TimeBlock';
import { findBlockForSlot } from '../../utils/timeSlots';

function ScheduleRow({
  rowLabel,
  blocks,
  slots,
  isPlaceholder,
  onSlotMouseDown,
  onSlotMouseEnter,
  isSlotSelected,
  onDeleteRow,
}) {
  return (
    <div className={`schedule-row${isPlaceholder ? ' schedule-row--placeholder' : ''}`}>
      <div className="schedule-row__label">
        <span className="schedule-row__label-text">{rowLabel}</span>
        {!isPlaceholder && (
          <button
            type="button"
            className="schedule-row__delete"
            aria-label={`Delete row ${rowLabel}`}
            title="Delete this row"
            onClick={onDeleteRow}
          >
            ×
          </button>
        )}
      </div>
      <div className="schedule-row__slots">
        {slots.map((slot, index) => {
          const block = findBlockForSlot(blocks, slot);
          return (
            <TimeBlock
              key={slot.start}
              status={block ? block.status : null}
              isSelected={isSlotSelected(index)}
              onMouseDown={() => onSlotMouseDown(index)}
              onMouseEnter={() => onSlotMouseEnter(index)}
            />
          );
        })}
        <div className="schedule-grid__end-cap" />
      </div>
    </div>
  );
}

export default ScheduleRow;
