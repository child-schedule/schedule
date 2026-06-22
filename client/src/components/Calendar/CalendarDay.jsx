import { Link } from 'react-router-dom';

function CalendarDay({ dateKey, dayNumber, hasSchedule, isToday }) {
  return (
    <Link
      to={`/schedule/${dateKey}`}
      className={`calendar-day${isToday ? ' calendar-day--today' : ''}`}
    >
      <span className="calendar-day__number">{dayNumber}</span>
      {hasSchedule && <span className="calendar-day__dot" aria-label="Schedule exists" />}
    </Link>
  );
}

export default CalendarDay;
