import { useCallback, useEffect, useMemo, useState } from 'react';
import { applySchedule, copySchedule, fetchSchedule } from '../api/scheduleApi';
import { getPreviousDateKey } from '../utils/dateHelpers';

// The server serializes `rows` (manually rebuilt by /apply, key order
// rowId-first) and `draftRows` (a Mongoose subdocument, schema key order)
// differently even when the content is identical — so comparing them with
// plain JSON.stringify is unreliable. This rebuilds both sides with a fixed
// key order before comparing.
function canonicalizeRows(rows) {
  return JSON.stringify(
    rows.map((row) => ({
      rowId: row.rowId,
      teacherId: row.teacherId,
      classroomId: row.classroomId,
      rowLabel: row.rowLabel,
      blocks: row.blocks.map((block) => ({
        blockId: block.blockId,
        startTime: block.startTime,
        endTime: block.endTime,
        status: block.status,
      })),
    }))
  );
}

// Loads the schedule for `dateKey`. If none exists yet, checks the previous
// day and offers to copy it (per the project plan's copy-previous-day flow).
export function useSchedule(dateKey) {
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Pure function of dateKey — available unconditionally (not just on a
  // fresh date) so the always-on "Copy Previous Day" button works any time.
  const previousDateKey = useMemo(() => getPreviousDateKey(dateKey), [dateKey]);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      const current = await fetchSchedule(dateKey);
      if (isCancelled) return;

      if (current) {
        setSchedule(current);
        setShowCopyModal(false);
        setIsLoading(false);
        return;
      }

      const previous = await fetchSchedule(previousDateKey);
      if (isCancelled) return;

      setSchedule({ date: dateKey, rows: [], draftRows: [] });
      // Only offer to copy from a day that actually has a *published*
      // schedule — an abandoned, never-applied draft isn't meaningful to copy.
      setShowCopyModal(Boolean(previous) && previous.rows.length > 0);
      setIsLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [dateKey, previousDateKey]);

  const copyFromPrevious = useCallback(async () => {
    const copied = await copySchedule(dateKey);
    setSchedule(copied);
    setShowCopyModal(false);
  }, [dateKey]);

  const startFresh = useCallback(() => {
    setShowCopyModal(false);
  }, []);

  // Lets callers (e.g. the assignment dropdown) sync local state after a
  // row/block mutation without refetching from the server. Every mutation
  // affects draftRows on the server, never the published rows directly.
  const applyScheduleUpdate = useCallback((updated) => {
    setSchedule(updated);
  }, []);

  // True once anything has ever been published for this date — distinguishes
  // a first-time save (nothing to overwrite) from a re-save (needs confirmation).
  const isPublished = Boolean(schedule && schedule.rows.length > 0);

  // True when the working draft differs from what's currently published.
  const isDirty = useMemo(() => {
    if (!schedule) return false;
    return canonicalizeRows(schedule.draftRows) !== canonicalizeRows(schedule.rows);
  }, [schedule]);

  const applyAndSave = useCallback(async () => {
    const updated = await applySchedule(dateKey);
    setSchedule(updated);
  }, [dateKey]);

  return {
    schedule,
    isLoading,
    showCopyModal,
    previousDateKey,
    copyFromPrevious,
    startFresh,
    applyScheduleUpdate,
    isPublished,
    isDirty,
    applyAndSave,
  };
}
