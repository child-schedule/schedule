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

module.exports = { getTeachers, createTeachers };
