import TimeBlock from './TimeBlock';
import { findBlockForSlot } from '../../utils/timeSlots';
import { useTeachers } from '../../context/TeachersContext';
import { useClassrooms } from '../../context/ClassroomsContext';
import { parseRowLabel } from '../../utils/rowLabel';
import { useShrinkToFit } from '../../hooks/useShrinkToFit';

function ScheduleRow({
  rowLabel,
  blocks,
  slots,
  teacherId,
  classroomId,
  isPlaceholder,
  onSlotMouseDown,
  onSlotMouseEnter,
  isSlotSelected,
  onDeleteRow,
  onTeacherClick,
  onClassroomClick,
}) {
  const { teachers } = useTeachers();
  const { classrooms } = useClassrooms();

  // Real rows carry teacherId/classroomId — look up their current display
  // names so each half of the row label can be clicked independently (opens
  // DayDetailModal via onTeacherClick/onClassroomClick).
  //
  // If a live lookup fails (e.g. the teacher/classroom was deleted after
  // this row was created — see PROGRESS.md), fall back to parsing this
  // row's own frozen `rowLabel` string instead of going straight to a
  // plain, non-clickable label. The click handlers still fire with the
  // row's real stored ids either way, so DayDetailModal's aggregation-by-id
  // keeps working even when the name shown is a stale, parsed-from-rowLabel
  // one. Only the placeholder "+ Add" row, or a row whose rowLabel itself
  // is empty/malformed (shouldn't normally happen), falls all the way back
  // to a plain span.
  const liveTeacherName = !isPlaceholder ? teachers.find((t) => t._id === teacherId)?.name : null;
  const liveClassroomName = !isPlaceholder ? classrooms.find((c) => c._id === classroomId)?.name : null;
  const parsedLabel =
    !isPlaceholder && (!liveTeacherName || !liveClassroomName) ? parseRowLabel(rowLabel) : null;

  const teacherName = liveTeacherName || parsedLabel?.teacherName || null;
  const classroomName = liveClassroomName || parsedLabel?.classroomName || null;
  const canSplitLabel = Boolean(teacherName && classroomName);

  // Shrinks the label's font-size to fit the fixed-width column, wrapping
  // only as a last resort — see useShrinkToFit.js. Re-runs whenever the
  // displayed text itself changes.
  const labelRef = useShrinkToFit([teacherName, classroomName, rowLabel, canSplitLabel]);

  return (
    <div className={`schedule-row${isPlaceholder ? ' schedule-row--placeholder' : ''}`}>
      <div className="schedule-row__label">
        {canSplitLabel ? (
          <span className="schedule-row__label-text" ref={labelRef}>
            <button
              type="button"
              className="schedule-row__name-link"
              onClick={() => onClassroomClick(classroomId)}
            >
              {classroomName}
            </button>
            {' - '}
            <button
              type="button"
              className="schedule-row__name-link"
              onClick={() => onTeacherClick(teacherId)}
            >
              {teacherName}
            </button>
          </span>
        ) : (
          <span className="schedule-row__label-text" ref={labelRef}>
            {rowLabel}
          </span>
        )}
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
      </div>
    </div>
  );
}

export default ScheduleRow;
