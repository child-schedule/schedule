const express = require('express');
const { checkBlockConflict } = require('../middleware/conflictCheck');
const validateDateParam = require('../middleware/validateDateParam');
const {
  getSchedule,
  createSchedule,
  copySchedule,
  addRow,
  addOrUpdateBlock,
  deleteBlock,
  deleteRow,
  applyDraft,
  updateNotes,
} = require('../controllers/scheduleController');

const router = express.Router();

router.param('date', validateDateParam);

router.get('/:date', getSchedule);
router.post('/:date', createSchedule);
router.post('/:date/copy', copySchedule);
router.post('/:date/apply', applyDraft);
router.patch('/:date/notes', updateNotes);
router.post('/:date/row', addRow);
router.put('/:date/row/:rowId/block', checkBlockConflict, addOrUpdateBlock);
router.delete('/:date/row/:rowId/block/:blockId', deleteBlock);
router.delete('/:date/row/:rowId', deleteRow);

module.exports = router;
