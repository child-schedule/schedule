const Schedule = require('../models/Schedule');
const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');

function previousDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

async function getSchedule(req, res, next) {
  try {
    const schedule = await Schedule.findOne({ date: req.params.date });
    if (!schedule) return res.status(404).json({ error: 'No schedule found for this date' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
}

async function createSchedule(req, res, next) {
  try {
    const { date } = req.params;
    const existing = await Schedule.findOne({ date });
    if (existing) return res.status(200).json(existing);

    const schedule = await Schedule.create({ date, rows: [] });
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function copySchedule(req, res, next) {
  try {
    const { date } = req.params;
    const prevDate = previousDateString(date);
    const prevSchedule = await Schedule.findOne({ date: prevDate });
    if (!prevSchedule) {
      return res.status(404).json({ error: `No schedule found for previous date ${prevDate}` });
    }

    const rows = prevSchedule.rows.map((row) => ({
      teacherId: row.teacherId,
      classroomId: row.classroomId,
      rowLabel: row.rowLabel,
      blocks: row.blocks.map((block) => ({
        startTime: block.startTime,
        endTime: block.endTime,
        status: block.status,
      })),
    }));

    let schedule = await Schedule.findOne({ date });
    if (schedule) {
      schedule.rows = rows;
    } else {
      schedule = new Schedule({ date, rows });
    }
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function addRow(req, res, next) {
  try {
    const { date } = req.params;
    const { teacherId, classroomId } = req.body;
    if (!teacherId || !classroomId) {
      return res.status(400).json({ error: 'teacherId and classroomId are required' });
    }

    const [teacher, classroom] = await Promise.all([
      Teacher.findById(teacherId),
      Classroom.findById(classroomId),
    ]);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

    let schedule = await Schedule.findOne({ date });
    if (!schedule) schedule = new Schedule({ date, rows: [] });

    const existingRow = schedule.rows.find(
      (r) => r.teacherId.toString() === teacherId && r.classroomId.toString() === classroomId
    );
    if (existingRow) return res.status(200).json(schedule);

    schedule.rows.push({
      teacherId,
      classroomId,
      rowLabel: `${classroom.name} - ${teacher.name}`,
      blocks: [],
    });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
}

// Conflict middleware has already loaded the schedule and the target row
// onto req — addOrUpdateBlock mutates and saves it.
async function addOrUpdateBlock(req, res, next) {
  try {
    const { blockId, startTime, endTime, status } = req.body;
    if (!startTime || !endTime || !status) {
      return res.status(400).json({ error: 'startTime, endTime and status are required' });
    }
    if (!['green', 'yellow', 'orange'].includes(status)) {
      return res.status(400).json({ error: 'status must be green, yellow, or orange' });
    }

    const { schedule, currentRow } = req;

    if (blockId) {
      const block = currentRow.blocks.find((b) => b.blockId === blockId);
      if (!block) return res.status(404).json({ error: 'Block not found' });
      block.startTime = startTime;
      block.endTime = endTime;
      block.status = status;
    } else {
      currentRow.blocks.push({ startTime, endTime, status });
    }

    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function deleteBlock(req, res, next) {
  try {
    const { date, rowId, blockId } = req.params;
    const schedule = await Schedule.findOne({ date });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    const row = schedule.rows.find((r) => r.rowId === rowId);
    if (!row) return res.status(404).json({ error: 'Row not found' });

    row.blocks = row.blocks.filter((b) => b.blockId !== blockId);
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}

async function deleteRow(req, res, next) {
  try {
    const { date, rowId } = req.params;
    const schedule = await Schedule.findOne({ date });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    schedule.rows = schedule.rows.filter((r) => r.rowId !== rowId);
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSchedule,
  createSchedule,
  copySchedule,
  addRow,
  addOrUpdateBlock,
  deleteBlock,
  deleteRow,
};
