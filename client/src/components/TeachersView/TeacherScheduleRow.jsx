/**
 * Data row for the teacher schedule grid.
 *
 * Returns a React Fragment — cells are direct children of the parent CSS Grid
 * defined in TeacherScheduleGrid. Using grid-column: span N (not flex) so
 * column widths are shared with the header row and alignment is exact.
 *
 * Props:
 *   teacherName — string label for the left column
 *   slots       — array of 22 slot objects from buildSlots():
 *                 { startTime, endTime, state, label, fullLabel }
 *
 * State → colour:
 *   1  Not in center  #64748b / white
 *   2  In classroom   #16a34a / white  (label = classroom name)
 *   3  Break          #d97706 / white
 *   5  In center      #7c3aed / white
 *   6  Left center    #9ca3af / #374151
 */

const STATE_COLORS = {
  1: { bg: '#64748b', color: '#ffffff' },
  2: { bg: '#16a34a', color: '#ffffff' },
  3: { bg: '#d97706', color: '#ffffff' },
  5: { bg: '#7c3aed', color: '#ffffff' },
  6: { bg: '#9ca3af', color: '#374151' },
};

const DEFAULT_COLORS = STATE_COLORS[1];

function groupSlots(slots) {
  const groups = [];
  for (const slot of slots) {
    const last = groups[groups.length - 1];
    if (last && last.state === slot.state && last.label === slot.label) {
      last.count++;
      last.endTime = slot.endTime;
    } else {
      groups.push({
        state: slot.state,
        label: slot.label,
        fullLabel: slot.fullLabel,
        startTime: slot.startTime,
        endTime: slot.endTime,
        count: 1,
      });
    }
  }
  return groups;
}

export default function TeacherScheduleRow({ teacherName, slots }) {
  const groups = groupSlots(slots);
  const lastGroup = groups[groups.length - 1] ?? null;
  const lastColors = lastGroup ? (STATE_COLORS[lastGroup.state] ?? DEFAULT_COLORS) : DEFAULT_COLORS;

  return (
    <>
      {/* Label cell — column 1 of the shared grid */}
      <div className="tv-grid__label-cell" role="gridcell">
        <span className="tv-grid__label-text">{teacherName}</span>
      </div>

      {/* Merged colour blocks — each spans N columns of the shared grid */}
      {groups.map((group, i) => {
        const { bg, color } = STATE_COLORS[group.state] ?? DEFAULT_COLORS;
        return (
          <div
            key={i}
            className="tv-cell"
            style={{
              backgroundColor: bg,
              color,
              gridColumn: `span ${group.count}`,
              '--slot-count': group.count,
            }}
            title={`${group.startTime}–${group.endTime}: ${group.fullLabel}`}
            role="gridcell"
            aria-label={`${group.startTime}–${group.endTime}: ${group.fullLabel}`}
          >
            <span className="tv-cell__label">{group.label}</span>
          </div>
        );
      })}

      {/* End-cap — column 24, matches the header's "6 PM" end-cap */}
      <div
        className="tv-grid__end-cap"
        style={{ backgroundColor: lastColors.bg }}
        aria-hidden="true"
      />
    </>
  );
}
