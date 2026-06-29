const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Classroom = require('../models/Classroom');
const validateDateParam = require('../middleware/validateDateParam');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.param('date', validateDateParam);
router.param('classroomId', validateObjectId);

// GET /api/schedule/:date/classroom/:classroomId
// Returns all teachers with green (active) blocks in this classroom on this date.
// Yellow/orange blocks are excluded — a teacher on break is not in the classroom.
router.get('/schedule/:date/classroom/:classroomId', async (req, res, next) => {
  try {
    const { date, classroomId } = req.params;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const schedule = await Schedule.findOne({ date }).populate('rows.teacherId');

    if (!schedule || schedule.rows.length === 0) {
      return res.json({ classroomName: classroom.name, date, teachers: [] });
    }

    const classroomObjectId = new mongoose.Types.ObjectId(classroomId);
    const teachers = [];

    for (const row of schedule.rows) {
      if (!row.classroomId.equals(classroomObjectId)) continue;

      const greenBlocks = row.blocks
        .filter(b => b.status === 'green')
        .map(b => ({ startTime: b.startTime, endTime: b.endTime }));

      if (greenBlocks.length === 0) continue;

      greenBlocks.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
      teachers.push({ teacherName: row.teacherId?.name ?? 'Unknown', blocks: greenBlocks });
    }

    return res.json({ classroomName: classroom.name, date, teachers });
  } catch (err) {
    next(err);
  }
});

// GET /api/classroom/:classroomId/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns all published days where this classroom has any green blocks.
// Each day includes teacherNames[] (for the summary table) and teachers[]
// with full block data (used by the print section).
router.get('/classroom/:classroomId/schedule', async (req, res, next) => {
  try {
    const { classroomId } = req.params;
    const { start, end } = req.query;

    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (start && !DATE_RE.test(start)) {
      return res.status(400).json({ error: 'Invalid start date. Use YYYY-MM-DD.' });
    }
    if (end && !DATE_RE.test(end)) {
      return res.status(400).json({ error: 'Invalid end date. Use YYYY-MM-DD.' });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const classroomObjectId = new mongoose.Types.ObjectId(classroomId);

    const query = { 'rows.classroomId': classroomObjectId };
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }

    const schedules = await Schedule.find(query)
      .populate('rows.teacherId')
      .sort({ date: 1 });

    const days = [];

    for (const schedule of schedules) {
      const teacherNames = new Set();
      const teachers = [];

      for (const row of schedule.rows) {
        if (!row.classroomId.equals(classroomObjectId)) continue;

        const greenBlocks = row.blocks
          .filter(b => b.status === 'green')
          .map(b => ({ startTime: b.startTime, endTime: b.endTime }));

        if (greenBlocks.length === 0) continue;

        const name = row.teacherId?.name ?? 'Unknown';
        teacherNames.add(name);
        greenBlocks.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
        teachers.push({ teacherName: name, blocks: greenBlocks });
      }

      if (teacherNames.size === 0) continue;

      days.push({ date: schedule.date, teacherNames: [...teacherNames], teachers });
    }

    return res.json({ classroomName: classroom.name, days });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
