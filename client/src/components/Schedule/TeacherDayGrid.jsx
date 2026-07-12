import { generateTimeSlots, formatDisplayTime, formatSlotRangeLabel } from '../../utils/timeSlots';

// Color/label conventions adapted from the archived TeacherScheduleRow
// (client/src/_archive/phase2-landing-and-views.archive.jsx) — kept
// identical so the popup reads the same way the old Teachers View did.
const STATE_COLORS = {
  1: { bg: '#64748b', color: '#ffffff' },
  2: { bg: '#16a34a', color: '#ffffff' },
  3: { bg: '#d97706', color: '#ffffff' },
  4: { bg: '#dc2626', color: '#ffffff' },
  5: { bg: '#7c3aed', color: '#ffffff' },
  6: { bg: '#9ca3af', color: '#374151' },
  7: { bg: '#2563eb', color: '#ffffff' },
};

// Short labels for the narrow grid cells — full text lives in the tooltip.
const CELL_LABELS = {
  1: 'Not in',
  3: 'Break',
  4: 'Front Office',
  5: 'In ctr',
  6: 'Left',
  7: 'Lesson Plan',
};

const DEFAULT_COLORS = STATE_COLORS[1];

// Merges consecutive slots that share the same state + label into a single
// spanning cell — same grouping the archived TeacherScheduleRow used.
function groupSlots(slots) {
  const groups = [];
  for (const slot of slots) {
    const last = groups[groups.length - 1];
    if (last && last.state === slot.state && last.label === slot.label) {
      last.count += 1;
      last.endTime = slot.endTime;
    } else {
      groups.push({ ...slot, count: 1 });
    }
  }
  return groups;
}

// Read-only 22-slot day view for a single teacher, built from `slots`
// (the output of utils/teacherScheduleStates.buildSlots). Used inside
// DayDetailModal — the popup opened by clicking a teacher's name in the
// schedule grid.
function TeacherDayGrid({ teacherName, slots }) {
  const timeSlots = generateTimeSlots();

  if (!slots || slots.length === 0) {
    return <p className="day-detail__empty">No schedule for {teacherName} today.</p>;
  }

  const groups = groupSlots(slots);

  return (
    <div className="day-detail__scroll">
      <div className="tdg-grid" role="grid" aria-label={`${teacherName} schedule`}>
        <div className="tdg-grid__corner" role="columnheader" />
        {timeSlots.map((slot) => {
          const { start, end } = formatSlotRangeLabel(slot);
          return (
            <div
              key={slot.start}
              className={`tdg-grid__slot-label${slot.start.endsWith(':00') ? ' tdg-grid__slot-label--hour' : ''}`}
              role="columnheader"
            >
              {start}-{end}
            </div>
          );
        })}

        <div className="tdg-grid__label-cell" role="gridcell">
          <span className="tdg-grid__label-text">{teacherName}</span>
        </div>
        {groups.map((group, i) => {
          const { bg, color } = STATE_COLORS[group.state] ?? DEFAULT_COLORS;
          return (
            <div
              key={i}
              className="tdg-cell"
              style={{
                backgroundColor: bg,
                color,
                gridColumn: `span ${group.count}`,
                '--slot-count': group.count,
              }}
              title={`${formatDisplayTime(group.startTime)}–${formatDisplayTime(group.endTime)}: ${group.fullLabel}`}
              role="gridcell"
              aria-label={`${formatDisplayTime(group.startTime)}–${formatDisplayTime(group.endTime)}: ${group.fullLabel}`}
            >
              <span className="tdg-cell__label">
                {group.state === 2 ? group.label : CELL_LABELS[group.state] ?? group.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherDayGrid;
