import { useCallback, useEffect, useState } from 'react';
import { copySchedule, fetchSchedule } from '../api/scheduleApi';
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

      setSchedule({ date: dateKey, rows: [] });
      setPreviousDateKey(prevKey);
      setShowCopyModal(Boolean(previous));
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

  return { schedule, isLoading, showCopyModal, previousDateKey, copyFromPrevious, startFresh };
}
