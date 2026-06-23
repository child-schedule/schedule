const express = require('express');
const { getClassrooms, createClassrooms, updateClassroom, deleteClassroom } = require('../controllers/classroomController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.param('id', validateObjectId);

router.get('/', getClassrooms);
router.post('/', createClassrooms);
router.patch('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);

module.exports = router;
