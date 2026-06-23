const express = require('express');
const { getTeachers, createTeachers, deleteTeacher } = require('../controllers/teacherController');

const router = express.Router();

router.get('/', getTeachers);
router.post('/', createTeachers);
router.delete('/:id', deleteTeacher);

module.exports = router;
