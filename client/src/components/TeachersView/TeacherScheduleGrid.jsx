import { generateTimeSlots, formatDisplayTime } from '../../utils/timeSlots';
import TeacherScheduleRow from './TeacherScheduleRow';

function formatSlotLabel(time, index) {
  const full = formatDisplayTime(time);
  if (index === 0 || time === '12:00') return full;
  return full.replace(/ (AM|PM)$/, '');
}

/**
 * Read-only schedule grid for a single teacher.
 *
 * Layout: one CSS Grid with columns [label 180px] [22 × 1fr] [end-cap 36px].
 * Header cells (row 1) and data cells (row 2) share the SAME column definitions,
 * guaranteeing pixel-perfect alignment between time labels and coloured blocks.
 *
 * Props:
 *   teacherName — string
 *   slots       — array of 22 slot objects from buildSlots()
 */
export default function TeacherScheduleGrid({ teacherName, slots }) {
  const timeSlots = generateTimeSlots();

  return (
    <div className="tv-grid" role="grid" aria-label={`${teacherName} schedule`}>

      {/* ── Row 1: column headers (direct grid children) ── */}
      <div className="tv-grid__label-cell tv-grid__corner" role="columnheader" aria-label="Teacher" />

      {timeSlots.map((slot, index) => (
        <div
          key={slot.start}
          className={`tv-grid__slot-label${slot.start.endsWith(':00') ? ' tv-grid__slot-label--hour' : ''}`}
          role="columnheader"
        >
          {formatSlotLabel(slot.start, index)}
        </div>
      ))}

      <div className="tv-grid__end-cap tv-grid__end-cap--label" role="columnheader">
        {formatDisplayTime(timeSlots[timeSlots.length - 1].end)}
      </div>

      {/* ── Row 2: data cells (from TeacherScheduleRow as a Fragment) ── */}
      <TeacherScheduleRow teacherName={teacherName} slots={slots} />

    </div>
  );
}
