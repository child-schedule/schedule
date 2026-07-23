import { useLayoutEffect, useRef } from 'react';

// Steps the text's font-size down until it fits on one line inside its
// container, checked via scrollWidth vs clientWidth. If it still doesn't fit
// at the smallest step, wraps onto multiple lines instead of ever truncating
// — see ScheduleGrid.css's `.schedule-row__label-text` for the
// `overflow-wrap`/`word-break` backstop that keeps even a single long,
// unbroken word from pushing past the column no matter what.
const FONT_STEPS = ['0.9rem', '0.82rem', '0.75rem', '0.68rem', '0.62rem'];

export function useShrinkToFit(deps) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.whiteSpace = 'nowrap';
    let fits = false;
    for (const size of FONT_STEPS) {
      el.style.fontSize = size;
      if (el.scrollWidth <= el.clientWidth) {
        fits = true;
        break;
      }
    }
    if (!fits) {
      el.style.whiteSpace = 'normal';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
