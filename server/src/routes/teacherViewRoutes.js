const express = require('express');
const mongoose = require('mongoose');
const Schedule = require('../models/Schedule');
const Teacher = require('../models/Teacher');
const validateDateParam = require('../middleware/validateDateParam');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.param('date', validateDateParam);
router.param('teacherId', validateObjectId);

// GET /api/schedule/:date/teacher/:teacherId
// Returns all published blocks for one teacher on one date, sorted by startTime.
// classroomName is populated for green blocks only; null for yellow/orange.
// Returns empty blocks array (not 404) when no schedule exists for that date.
router.get('/schedule/:date/teacher/:teacherId', async (req, res, next) => {
  try {
    const { date, teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const schedule = await Schedule.findOne({ date }).populate('rows.classroomId');

    if (!schedule || schedule.rows.length === 0) {
      return res.json({ teacherName: teacher.name, date, blocks: [] });
    }

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
    const blocks = [];

    for (const row of schedule.rows) {
      if (!row.teacherId.equals(teacherObjectId)) continue;

      const classroomName = row.classroomId?.name ?? null;

      for (const block of row.blocks) {
        blocks.push({
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          classroomName: block.status === 'green' ? classroomName : null,
        });
      }
    }

    blocks.sort((a, b) => (a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0));

    return res.json({ teacherName: teacher.name, date, blocks });
  } catch (err) {
    next(err);
  }
});

// GET /api/teacher/:teacherId/schedule?start=YYYY-MM-DD&end=YYYY-MM-DD
// Returns all published schedule days for a teacher across all dates (or within
// an optional date range). Used by the Overall View and In-between Dates views.
router.get('/teacher/:teacherId/schedule', async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { start, end } = req.query;

    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    if (start && !DATE_RE.test(start)) {
      return res.status(400).json({ error: 'Invalid start date. Use YYYY-MM-DD.' });
    }
    if (end && !DATE_RE.test(end)) {
      return res.status(400).json({ error: 'Invalid end date. Use YYYY-MM-DD.' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const query = { 'rows.teacherId': teacherObjectId };
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = start;
      if (end) query.date.$lte = end;
    }

    const schedules = await Schedule.find(query)
      .populate('rows.classroomId')
      .sort({ date: 1 });

    const days = [];

    for (const schedule of schedules) {
      const blocks = [];

      for (const row of schedule.rows) {
        if (!row.teacherId.equals(teacherObjectId)) continue;

        const classroomName = row.classroomId?.name ?? null;

        for (const block of row.blocks) {
          blocks.push({
            startTime: block.startTime,
            endTime: block.endTime,
            status: block.status,
            classroomName: block.status === 'green' ? classroomName : null,
          });
        }
      }

      if (blocks.length === 0) continue;

      blocks.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
      days.push({ date: schedule.date, blocks });
    }

    return res.json({ teacherName: teacher.name, days });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
