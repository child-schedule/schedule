import { useCallback, useEffect, useRef, useState } from 'react';

// Tracks a horizontal drag across one row's time slots. Selection is
// restricted to the row where the drag started (per the project plan:
// "drags horizontally across time slot columns within a single row").
export function useDragSelect(onSelectionComplete) {
  const [dragState, setDragState] = useState(null); // { rowId, anchorIndex, currentIndex }
  const dragStateRef = useRef(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const startDrag = useCallback((rowId, index) => {
    setDragState({ rowId, anchorIndex: index, currentIndex: index });
  }, []);

  const extendDrag = useCallback((rowId, index) => {
    setDragState((prev) => (prev && prev.rowId === rowId ? { ...prev, currentIndex: index } : prev));
  }, []);

  useEffect(() => {
    function handleMouseUp() {
      const current = dragStateRef.current;
      if (!current) return;

      setDragState(null);
      const start = Math.min(current.anchorIndex, current.currentIndex);
      const end = Math.max(current.anchorIndex, current.currentIndex);
      onSelectionComplete(current.rowId, start, end);
    }

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [onSelectionComplete]);

  const isSlotSelected = useCallback(
    (rowId, index) => {
      if (!dragState || dragState.rowId !== rowId) return false;
      const start = Math.min(dragState.anchorIndex, dragState.currentIndex);
      const end = Math.max(dragState.anchorIndex, dragState.currentIndex);
      return index >= start && index <= end;
    },
    [dragState]
  );

  return { startDrag, extendDrag, isSlotSelected };
}
