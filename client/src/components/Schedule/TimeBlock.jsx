import { getStatusLabel } from '../../utils/colorMap';

function TimeBlock({ status }) {
  const resolvedStatus = status || 'white';

  return (
    <div
      className={`time-block time-block--${resolvedStatus}`}
      role="gridcell"
      aria-label={getStatusLabel(resolvedStatus)}
    />
  );
}

export default TimeBlock;
