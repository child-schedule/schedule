const express = require('express');
const { checkBlockConflict } = require('../middleware/conflictCheck');
const {
  getSchedule,
  createSchedule,
  copySchedule,
  addRow,
  addOrUpdateBlock,
  deleteBlock,
  deleteRow,
} = require('../controllers/scheduleController');

const router = express.Router();

router.get('/:date', getSchedule);
router.post('/:date', createSchedule);
router.post('/:date/copy', copySchedule);
router.post('/:date/row', addRow);
router.put('/:date/row/:rowId/block', checkBlockConflict, addOrUpdateBlock);
router.delete('/:date/row/:rowId/block/:blockId', deleteBlock);
router.delete('/:date/row/:rowId', deleteRow);

module.exports = router;
