// Converts a sorted blocks array (from GET /api/schedule/:date/teacher/:teacherId)
// into an array of 22 slot objects covering 07:00–18:00 in 30-min steps.
//
// Each slot: { startTime, endTime, state, label, fullLabel }
// States:
//   1 — Not in center       (before first green/yellow block)
//   2 — In classroom        (green block)
//   3 — Break                (yellow block)
//   4 — Meet Front Office    (orange block, only when not covered by green/yellow)
//   5 — In center            (gap between two green/yellow blocks — a later block exists)
//   6 — Left center          (from last green/yellow block end onwards, inclusive)
//
// Per-slot priority:
//   1. Green or yellow block covering the slot always wins (state 2/3).
//   2. Otherwise, an orange block covering the slot wins (state 4 — the
//      teacher is genuinely idle/at the front office, not scheduled elsewhere).
//   3. Otherwise, fall back to the gap/boundary logic (states 1/5/6), which
//      is defined purely in terms of green/yellow block boundaries — orange
//      blocks never move firstStart/lastEnd, they only claim priority for
//      the specific slots they cover.

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
  4: 'Meet Front Office',
  5: 'In center',
  6: 'Left center',
};

export function buildSlots(blocks) {
  if (!blocks || blocks.length === 0) return [];

  // Green/yellow blocks define both the teacher's actual presence and the
  // arrival/departure boundaries used by the gap logic below.
  const activeBlocks = blocks.filter(b => b.status === 'green' || b.status === 'yellow');
  // Orange blocks only get priority over the gap/boundary fallback (state 4)
  // for the specific slots they cover — they never redefine the boundaries.
  const orangeBlocks = blocks.filter(b => b.status === 'orange');

  if (activeBlocks.length === 0 && orangeBlocks.length === 0) return [];

  const firstStart = activeBlocks.length ? toMin(activeBlocks[0].startTime) : null;
  const lastEnd = activeBlocks.length ? toMin(activeBlocks[activeBlocks.length - 1].endTime) : null;

  const slots = [];

  for (let i = 0; i < SLOT_COUNT; i++) {
    const slotStart = DAY_START + i * 30;
    const slotEnd = slotStart + 30;
    const startTime = toTime(slotStart);
    const endTime = toTime(slotEnd);

    // 1. Find a green/yellow block that covers this slot — always wins.
    const block = activeBlocks.find(
      b => toMin(b.startTime) <= slotStart && toMin(b.endTime) > slotStart
    );

    // 2. Otherwise, find an orange block that covers this slot.
    const orangeBlock = !block && orangeBlocks.find(
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
    } else if (orangeBlock) {
      state = 4;
      label = 'Front Office';
      fullLabel = STATE_LABELS[4];
    } else if (firstStart === null || slotStart < firstStart) {
      // No green/yellow block has started yet (or ever exists for this teacher today).
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
