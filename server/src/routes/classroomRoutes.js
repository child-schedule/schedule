const express = require('express');
const { getClassrooms, createClassrooms, updateClassroom, deleteClassroom } = require('../controllers/classroomController');

const router = express.Router();

router.get('/', getClassrooms);
router.post('/', createClassrooms);
router.patch('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);

module.exports = router;
