import { useState, useEffect, useRef } from 'react';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Parse "YYYY-MM-DD" → Date (local midnight) or null if invalid. */
function parseDate(str) {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

/** Build a "YYYY-MM-DD" string from year, 0-based month, day. */
function toDateString(year, month, day) {
  return (
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );
}

/**
 * Combined date input: text field + mini calendar overlay.
 * Props:
 *   value      — "YYYY-MM-DD" string or ""
 *   onChange   — called with "YYYY-MM-DD" string when value changes
 */
export default function DatePickerInput({ value, onChange }) {
  const [textValue, setTextValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const containerRef = useRef(null);

  // Keep text field in sync if parent updates value externally
  useEffect(() => {
    setTextValue(value || '');
  }, [value]);

  // Close calendar on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleTextBlur() {
    const parsed = parseDate(textValue);
    if (parsed) {
      onChange(textValue);
    } else if (textValue !== '') {
      // Invalid input — reset to the last committed value
      setTextValue(value || '');
    }
  }

  function handleCalendarToggle() {
    if (!isOpen) {
      // Navigate to the currently selected month when opening
      const parsed = parseDate(value);
      if (parsed) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
    setIsOpen((v) => !v);
  }

  function handleDayClick(year, month, day) {
    const ds = toDateString(year, month, day);
    setTextValue(ds);
    onChange(ds);
    setIsOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Calendar data
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectedDate = parseDate(value);
  const todayStr = toDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    <div ref={containerRef} className="tv-datepicker">
      <div className="tv-datepicker__row">
        <input
          id="date-input"
          type="text"
          className="tv-datepicker__input"
          placeholder="YYYY-MM-DD"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={handleTextBlur}
        />
        <button
          type="button"
          className="tv-datepicker__cal-btn"
          onClick={handleCalendarToggle}
          aria-label="Open calendar"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {/* Calendar SVG icon */}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="16"
            height="16"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm-2 5h12v8H4V7z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="tv-datepicker__calendar"
          role="dialog"
          aria-label="Date picker"
          aria-modal="false"
        >
          <div className="tv-datepicker__cal-header">
            <button
              type="button"
              className="tv-datepicker__nav"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="tv-datepicker__month-label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className="tv-datepicker__nav"
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="tv-datepicker__day-names" aria-hidden="true">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="tv-datepicker__day-name">
                {d}
              </span>
            ))}
          </div>

          <div className="tv-datepicker__days">
            {/* Empty cells to offset the first day of the month */}
            {Array.from({ length: firstWeekday }, (_, i) => (
              <span
                key={`empty-${i}`}
                className="tv-datepicker__day tv-datepicker__day--empty"
                aria-hidden="true"
              />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ds = toDateString(viewYear, viewMonth, day);
              const isSelected =
                selectedDate !== null &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === day;
              const isToday = ds === todayStr;

              let cls = 'tv-datepicker__day';
              if (isSelected) cls += ' tv-datepicker__day--selected';
              else if (isToday) cls += ' tv-datepicker__day--today';

              return (
                <button
                  key={day}
                  type="button"
                  className={cls}
                  onClick={() => handleDayClick(viewYear, viewMonth, day)}
                  aria-label={ds}
                  aria-pressed={isSelected}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
