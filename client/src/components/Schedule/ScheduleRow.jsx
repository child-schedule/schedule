import TimeBlock from './TimeBlock';
import { timeToMinutes } from '../../utils/timeSlots';

function findBlockForSlot(blocks, slot) {
  const slotStart = timeToMinutes(slot.start);
  const slotEnd = timeToMinutes(slot.end);

  return blocks.find((block) => {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    return blockStart < slotEnd && slotStart < blockEnd;
  });
}

function ScheduleRow({ rowLabel, blocks, slots }) {
  return (
    <div className="schedule-row">
      <div className="schedule-row__label">{rowLabel}</div>
      <div className="schedule-row__slots">
        {slots.map((slot) => {
          const block = findBlockForSlot(blocks, slot);
          return <TimeBlock key={slot.start} status={block ? block.status : null} />;
        })}
      </div>
    </div>
  );
}

export default ScheduleRow;
