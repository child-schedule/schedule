const SLOT_COUNT = 22;
const DAY_START = 7 * 60;

function toMin(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Time labels for horizontal grid header: "7:00 AM" … "5:30 PM" … "6:00 PM"
// 23 labels — the 23rd (6:00 PM) is the closing boundary marker, not a data column.
export const SLOT_LABELS = Array.from({ length: SLOT_COUNT + 1 }, (_, i) => {
  const mins = DAY_START + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h;
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
});

// Returns 22-slot array with the set of teacher names present at each slot.
// Used for the print grouped output.
export function buildClassroomSlots(teachers) {
  if (!teachers || teachers.length === 0) {
    return Array.from({ length: SLOT_COUNT }, (_, i) => ({
      startTime: toTime(DAY_START + i * 30),
      endTime: toTime(DAY_START + i * 30 + 30),
      teacherNames: [],
    }));
  }

  return Array.from({ length: SLOT_COUNT }, (_, i) => {
    const slotStart = DAY_START + i * 30;
    const present = teachers
      .filter(t => t.blocks.some(b => toMin(b.startTime) <= slotStart && toMin(b.endTime) > slotStart))
      .map(t => t.teacherName);

    return {
      startTime: toTime(slotStart),
      endTime: toTime(slotStart + 30),
      teacherNames: present,
    };
  });
}

// Shared color palette — imported by both ClassroomResultPage and ClassroomSummaryPage
export const GROUP_COLORS = [
  { bg: '#dcfce7', color: '#15803d' },
  { bg: '#bbf7d0', color: '#166534' },
  { bg: '#86efac', color: '#14532d' },
  { bg: '#4ade80', color: '#166534' },
];
export const ABSENT_COLOR = { bg: '#c4c9d4', color: '#4b5563' };

// Groups consecutive slots where the EXACT same set of teachers is present.
// A teacher joining OR leaving triggers a new group.
// Drives compressed print rows: "7:00 AM – 9:00 AM: Jenifer"
export function groupClassroomSlots(slots) {
  if (!slots || slots.length === 0) return [];

  const key = names => [...names].sort().join('|');

  const groups = [];
  let cur = {
    startTime: slots[0].startTime,
    endTime: slots[0].endTime,
    teacherNames: slots[0].teacherNames,
  };

  for (let i = 1; i < slots.length; i++) {
    if (key(slots[i].teacherNames) === key(cur.teacherNames)) {
      cur.endTime = slots[i].endTime;
    } else {
      groups.push({ ...cur });
      cur = {
        startTime: slots[i].startTime,
        endTime: slots[i].endTime,
        teacherNames: slots[i].teacherNames,
      };
    }
  }
  groups.push({ ...cur });
  return groups;
}

// For the horizontal grid: returns merged presence segments for ONE teacher in this classroom.
// Each segment: { start (slot index), end (slot index), present (bool) }
export function buildTeacherPresenceGroups(teacher) {
  const presence = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const slotStart = DAY_START + i * 30;
    return teacher.blocks.some(b => toMin(b.startTime) <= slotStart && toMin(b.endTime) > slotStart);
  });

  const groups = [];
  let start = 0;
  while (start < SLOT_COUNT) {
    let end = start;
    while (end + 1 < SLOT_COUNT && presence[end + 1] === presence[start]) end++;
    groups.push({ start, end, present: presence[start] });
    start = end + 1;
  }
  return groups;
}
