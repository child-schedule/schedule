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
