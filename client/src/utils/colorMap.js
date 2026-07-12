const STATUS_LABELS = {
  green: 'Active Shift',
  yellow: 'Break',
  orange: 'Meet Front Office',
  blue: 'Lesson Planning',
  white: 'Empty',
};

export function getStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS.white;
}
