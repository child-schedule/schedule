import { GROUP_COLORS, ABSENT_COLOR } from '../../utils/classroomScheduleSlots';
import { generateTimeSlots, formatDisplayTime, formatSlotRangeLabel } from '../../utils/timeSlots';

function toMin(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function slotSpan(startTime, endTime) {
  return (toMin(endTime) - toMin(startTime)) / 30;
}

// Read-only horizontal day view for a single classroom, built from `groups`
// (the output of utils/classroomScheduleSlots.groupClassroomSlots). Adapted
// from the archived ClassroomResultPage's grid
// (client/src/_archive/phase2-landing-and-views.archive.jsx) — same grouped
// color-segment rendering, used inside DayDetailModal. Header labels: one
// range label per actual half-hour slot (22 columns), matching the same
// layout convention as TeacherDayGrid — not the old 23-boundary-tick model.
function ClassroomDayGrid({ classroomName, groups }) {
  const hasAnyTeacher = groups?.some((g) => g.teacherNames.length > 0);

  if (!hasAnyTeacher) {
    return <p className="day-detail__empty">No teachers assigned to {classroomName} today.</p>;
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="day-detail__scroll">
      <div className="cdg-grid">
        <div className="cdg-grid__corner" />
        {timeSlots.map((slot) => {
          const { start, end } = formatSlotRangeLabel(slot);
          return (
            <div key={slot.start} className="cdg-grid__time-cell">
              {start}-{end}
            </div>
          );
        })}

        <div className="cdg-grid__label-cell">{classroomName}</div>
        {groups.map((group, i) => {
          const isPresent = group.teacherNames.length > 0;
          const presentIndex = groups.slice(0, i).filter((g) => g.teacherNames.length > 0).length;
          const colors = isPresent ? GROUP_COLORS[presentIndex % GROUP_COLORS.length] : ABSENT_COLOR;
          const span = slotSpan(group.startTime, group.endTime);
          return (
            <div
              key={i}
              className="cdg-grid__cell"
              style={{ gridColumn: `span ${span}`, background: colors.bg, color: colors.color }}
              title={`${formatDisplayTime(group.startTime)}–${formatDisplayTime(group.endTime)}: ${
                isPresent ? group.teacherNames.join(', ') : 'No teacher'
              }`}
            >
              {isPresent ? group.teacherNames.join(', ') : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClassroomDayGrid;
