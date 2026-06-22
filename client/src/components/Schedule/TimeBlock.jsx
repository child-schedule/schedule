import { getStatusLabel } from '../../utils/colorMap';

function TimeBlock({ status, isSelected, onMouseDown, onMouseEnter }) {
  const resolvedStatus = status || 'white';

  return (
    <div
      className={`time-block time-block--${resolvedStatus}${isSelected ? ' time-block--selected' : ''}`}
      role="gridcell"
      aria-label={getStatusLabel(resolvedStatus)}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    />
  );
}

export default TimeBlock;
