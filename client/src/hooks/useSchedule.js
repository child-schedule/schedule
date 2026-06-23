import { useCallback, useEffect, useMemo, useState } from 'react';
import { applySchedule, copySchedule, fetchSchedule } from '../api/scheduleApi';
import { getPreviousDateKey } from '../utils/dateHelpers';

// Loads the schedule for `dateKey`. If none exists yet, checks the previous
// day and offers to copy it (per the project plan's copy-previous-day flow).
export function useSchedule(dateKey) {
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [previousDateKey, setPreviousDateKey] = useState(null);

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

      const prevKey = getPreviousDateKey(dateKey);
      const previous = await fetchSchedule(prevKey);
      if (isCancelled) return;

      setSchedule({ date: dateKey, rows: [], draftRows: [] });
      setPreviousDateKey(prevKey);
      // Only offer to copy from a day that actually has a *published*
      // schedule — an abandoned, never-applied draft isn't meaningful to copy.
      setShowCopyModal(Boolean(previous) && previous.rows.length > 0);
      setIsLoading(false);
    })();

    return () => {
      isCancelled = true;
    };
  }, [dateKey]);

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
    return JSON.stringify(schedule.draftRows) !== JSON.stringify(schedule.rows);
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
