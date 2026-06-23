const Teacher = require('../models/Teacher');

function namesFromBody(body) {
  if (Array.isArray(body.names)) return body.names;
  if (typeof body.name === 'string') return [body.name];
  return [];
}

async function getTeachers(req, res, next) {
  try {
    const teachers = await Teacher.find().sort({ createdAt: 1 });
    res.json(teachers);
  } catch (err) {
    next(err);
  }
}

async function createTeachers(req, res, next) {
  try {
    const names = namesFromBody(req.body)
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({ error: 'At least one teacher name is required' });
    }

    const teachers = await Teacher.insertMany(names.map((name) => ({ name })));
    res.status(201).json(teachers);
  } catch (err) {
    next(err);
  }
}

async function updateTeacher(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ error: 'A teacher name is required' });

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function deleteTeacher(req, res, next) {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getTeachers, createTeachers, updateTeacher, deleteTeacher };
