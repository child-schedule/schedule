const express = require('express');
const { getTeachers, createTeachers } = require('../controllers/teacherController');

const router = express.Router();

router.get('/', getTeachers);
router.post('/', createTeachers);

module.exports = router;
