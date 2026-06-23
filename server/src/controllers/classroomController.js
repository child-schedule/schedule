const Classroom = require('../models/Classroom');

function namesFromBody(body) {
  if (Array.isArray(body.names)) return body.names;
  if (typeof body.name === 'string') return [body.name];
  return [];
}

async function getClassrooms(req, res, next) {
  try {
    const classrooms = await Classroom.find().sort({ createdAt: 1 });
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
}

async function createClassrooms(req, res, next) {
  try {
    const names = namesFromBody(req.body)
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({ error: 'At least one classroom name is required' });
    }

    const classrooms = await Classroom.insertMany(names.map((name) => ({ name })));
    res.status(201).json(classrooms);
  } catch (err) {
    next(err);
  }
}

async function updateClassroom(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    if (!name) return res.status(400).json({ error: 'A classroom name is required' });

    const classroom = await Classroom.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.json(classroom);
  } catch (err) {
    next(err);
  }
}

async function deleteClassroom(req, res, next) {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);
    if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getClassrooms, createClassrooms, updateClassroom, deleteClassroom };
