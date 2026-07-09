// Every schedule row's `rowLabel` is frozen server-side at creation time as
// `${classroom.name} - ${teacher.name}` (see server/src/controllers/
// scheduleController.js `addRow`). It never gets rewritten if the teacher or
// classroom is later renamed or deleted, which makes it a useful fallback
// source of truth when a live id lookup against TeachersContext/
// ClassroomsContext fails (e.g. the referenced document no longer exists).
//
// Split on the FIRST " - " occurrence: everything before it is the
// classroom name, everything after is the teacher name. Either name could
// itself legitimately contain a hyphen (just not the exact " - " separator
// with spaces on both sides), so this is a reasonable, if not airtight,
// heuristic — good enough for a fallback display path.
export function parseRowLabel(rowLabel) {
  if (!rowLabel) return null;
  const separatorIndex = rowLabel.indexOf(' - ');
  if (separatorIndex === -1) return null;

  const classroomName = rowLabel.slice(0, separatorIndex).trim();
  const teacherName = rowLabel.slice(separatorIndex + 3).trim();
  if (!classroomName || !teacherName) return null;

  return { classroomName, teacherName };
}
