import CalendarDay from './CalendarDay';
import { formatDateKey, getDaysInMonth, getFirstDayOfWeek } from '../../utils/dateHelpers';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarGrid({ year, month, scheduledDates }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const todayKey = formatDateKey(new Date());

  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar-grid">
      <div className="calendar-grid__weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-grid__weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="calendar-grid__days">
        {leadingBlanks.map((_, i) => (
          <div key={`blank-${i}`} className="calendar-day calendar-day--blank" />
        ))}
        {days.map((day) => {
          const dateKey = formatDateKey(new Date(year, month, day));
          return (
            <CalendarDay
              key={dateKey}
              dateKey={dateKey}
              dayNumber={day}
              hasSchedule={scheduledDates.has(dateKey)}
              isToday={dateKey === todayKey}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
