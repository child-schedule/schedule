import { useCallback } from 'react';
import { timeToMinutes, formatDisplayTime } from '../utils/timeSlots';

function overlaps(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

// Mirrors the backend's checkBlockConflict middleware (server/src/middleware/
// conflictCheck.js) so the same teacher/time overlap can be caught locally
// before hitting the API. A teacher can't have a green, yellow, or blue
// (Lesson Planning) block in two places at once — Lesson Planning counts as
// the teacher being occupied, same as a real shift or a break. Only orange
// (Meet Front Office) is exempt.
export function useConflictCheck() {
  return useCallback((rows, { teacherId, startTime, endTime, status, excludeBlockId }) => {
    if (status === 'orange') return null;

    for (const row of rows) {
      if (row.teacherId !== teacherId) continue;

      for (const block of row.blocks) {
        if (block.blockId === excludeBlockId) continue;
        if (block.status === 'orange') continue;
        if (!overlaps(startTime, endTime, block.startTime, block.endTime)) continue;

        return `Already assigned to ${row.rowLabel} at ${formatDisplayTime(block.startTime)}. A teacher cannot be in two classrooms at the same time.`;
      }
    }

    return null;
  }, []);
}
