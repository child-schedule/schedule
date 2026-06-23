const SLOT_MINUTES = 30;
const START_HOUR = 7; // 7:00 AM
const END_HOUR = 18; // 6:00 PM

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// 22 half-hour slots from 7:00 AM to 6:00 PM.
export function generateTimeSlots() {
  const slots = [];
  for (let m = START_HOUR * 60; m < END_HOUR * 60; m += SLOT_MINUTES) {
    slots.push({ start: minutesToTime(m), end: minutesToTime(m + SLOT_MINUTES) });
  }
  return slots;
}

// Display-only 12-hour formatting (e.g. "13:00" -> "1 PM", "13:30" -> "1:30 PM").
// Storage/comparison everywhere else stays 24-hour "HH:MM" per the schema.
export function formatDisplayTime(time) {
  const [hoursStr, minutes] = time.split(':');
  let hours = Number(hoursStr) % 12;
  if (hours === 0) hours = 12;
  const period = Number(hoursStr) >= 12 ? 'PM' : 'AM';
  return minutes === '00' ? `${hours} ${period}` : `${hours}:${minutes} ${period}`;
}

// Shared by the grid header (only the start/noon AM-PM marker) and rows.
export function findBlockForSlot(blocks, slot) {
  const slotStart = timeToMinutes(slot.start);
  const slotEnd = timeToMinutes(slot.end);

  return blocks.find((block) => {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    return blockStart < slotEnd && slotStart < blockEnd;
  });
}
