const Schedule = require('../models/Schedule');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(startA, endA, startB, endB) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

// A teacher cannot have a Green, Yellow, or Blue (Lesson Planning) block in
// two different rows (or twice in the same row) at the same time slot —
// Lesson Planning counts as the teacher being occupied, just like a real
// shift or a break, so it blocks other assignments the same way. Only
// Orange (Meet Front Office) is exempt.
async function checkBlockConflict(req, res, next) {
  try {
    const { date, rowId } = req.params;
    const { startTime, endTime, status, blockId } = req.body;

    const schedule = await Schedule.findOne({ date });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found for this date' });

    const currentRow = schedule.draftRows.find((r) => r.rowId === rowId);
    if (!currentRow) return res.status(404).json({ error: 'Row not found' });

    if (status !== 'orange') {
      for (const row of schedule.draftRows) {
        if (row.teacherId.toString() !== currentRow.teacherId.toString()) continue;

        for (const block of row.blocks) {
          if (block.blockId === blockId) continue;
          if (block.status === 'orange') continue;
          if (!overlaps(startTime, endTime, block.startTime, block.endTime)) continue;

          const [teacher, classroom] = await Promise.all([
            Teacher.findById(currentRow.teacherId),
            Classroom.findById(row.classroomId),
          ]);
          return res.status(409).json({
            error: `${teacher ? teacher.name : 'This teacher'} is already assigned to ${
              classroom ? classroom.name : 'another classroom'
            } at ${block.startTime}. A teacher cannot be in two classrooms at the same time.`,
          });
        }
      }
    }

    req.schedule = schedule;
    req.currentRow = currentRow;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { checkBlockConflict, timeToMinutes, overlaps };
