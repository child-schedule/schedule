// Converts a sorted blocks array (from GET /api/schedule/:date/teacher/:teacherId)
// into an array of 22 slot objects covering 07:00–18:00 in 30-min steps.
//
// Each slot: { startTime, endTime, state, label, fullLabel }
// States:
//   1 — Not in center  (before first block)
//   2 — In classroom   (green block)
//   3 — Break          (yellow block)
//   5 — In center      (gap between two blocks — a later block exists)
//   6 — Left center    (from last block end onwards, inclusive)
//
// Orange (Meet Front Office) blocks are intentionally ignored in this view.
// Their time slots are resolved by the gap/boundary logic above.

const SLOT_COUNT = 22;
const DAY_START = 7 * 60; // 07:00 in minutes

function toMin(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const STATUS_TO_STATE = { green: 2, yellow: 3 };

const STATE_LABELS = {
  1: 'Not in center',
  3: 'Break',
  5: 'In center',
  6: 'Left center',
};

export function buildSlots(blocks) {
  if (!blocks || blocks.length === 0) return [];

  // Orange blocks mark "teacher is in another room" — ignore in Teachers View.
  // The gap/boundary logic naturally fills those slots as In center or Left center.
  const activeBlocks = blocks.filter(b => b.status !== 'orange');
  if (activeBlocks.length === 0) return [];

  const firstStart = toMin(activeBlocks[0].startTime);
  const lastEnd = toMin(activeBlocks[activeBlocks.length - 1].endTime);

  const slots = [];

  for (let i = 0; i < SLOT_COUNT; i++) {
    const slotStart = DAY_START + i * 30;
    const slotEnd = slotStart + 30;
    const startTime = toTime(slotStart);
    const endTime = toTime(slotEnd);

    // Find a green/yellow block that covers this slot
    const block = activeBlocks.find(
      b => toMin(b.startTime) <= slotStart && toMin(b.endTime) > slotStart
    );

    let state, label, fullLabel;

    if (block) {
      state = STATUS_TO_STATE[block.status] ?? 2;
      const text = state === 2
        ? (block.classroomName || 'In classroom')
        : STATE_LABELS[state];
      label = text;
      fullLabel = text;
    } else if (slotStart < firstStart) {
      state = 1;
      label = STATE_LABELS[1];
      fullLabel = STATE_LABELS[1];
    } else if (slotStart >= lastEnd) {
      state = 6;
      label = STATE_LABELS[6];
      fullLabel = STATE_LABELS[6];
    } else {
      // Gap between active blocks — a later block exists (slotStart < lastEnd guarantees it)
      state = 5;
      label = STATE_LABELS[5];
      fullLabel = STATE_LABELS[5];
    }

    slots.push({ startTime, endTime, state, label, fullLabel });
  }

  return slots;
}
