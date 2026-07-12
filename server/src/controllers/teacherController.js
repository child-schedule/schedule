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

// Same first name alone (e.g. two teachers both named "Isabel") makes them
// indistinguishable in every picker across the app and silently breaks
// conflict detection (it's scoped by teacher id, not name — two same-named
// teachers just look like two different people to the system). Blocked here
// rather than allowed and cleaned up later.
function duplicateNameError(name) {
  return `A teacher named "${name}" already exists. Use a different name (e.g. add a last name) to tell them apart.`;
}

async function createTeachers(req, res, next) {
  try {
    const names = namesFromBody(req.body)
      .map((name) => name.trim())
      .filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({ error: 'At least one teacher name is required' });
    }

    const existing = await Teacher.find({}, 'name');
    const existingLower = new Set(existing.map((t) => t.name.toLowerCase()));
    const seenInBatch = new Set();

    for (const name of names) {
      const lower = name.toLowerCase();
      if (existingLower.has(lower) || seenInBatch.has(lower)) {
        return res.status(409).json({ error: duplicateNameError(name) });
      }
      seenInBatch.add(lower);
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

    const others = await Teacher.find({ _id: { $ne: req.params.id } }, 'name');
    if (others.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: duplicateNameError(name) });
    }

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
