const express = require('express');
const { getClassrooms, createClassrooms, deleteClassroom } = require('../controllers/classroomController');

const router = express.Router();

router.get('/', getClassrooms);
router.post('/', createClassrooms);
router.delete('/:id', deleteClassroom);

module.exports = router;
