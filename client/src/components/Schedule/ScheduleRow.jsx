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
}) {
  return (
    <div className={`schedule-row${isPlaceholder ? ' schedule-row--placeholder' : ''}`}>
      <div className="schedule-row__label">{rowLabel}</div>
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
      </div>
    </div>
  );
}

export default ScheduleRow;
