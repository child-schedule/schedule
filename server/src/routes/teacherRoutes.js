const express = require('express');
const { getTeachers, createTeachers, updateTeacher, deleteTeacher } = require('../controllers/teacherController');

const router = express.Router();

router.get('/', getTeachers);
router.post('/', createTeachers);
router.patch('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
