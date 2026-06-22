const express = require('express');
const { getClassrooms, createClassrooms } = require('../controllers/classroomController');

const router = express.Router();

router.get('/', getClassrooms);
router.post('/', createClassrooms);

module.exports = router;
