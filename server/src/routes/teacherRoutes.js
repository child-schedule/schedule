const express = require('express');
const { getTeachers, createTeachers, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.param('id', validateObjectId);

router.get('/', getTeachers);
router.post('/', createTeachers);
router.patch('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
