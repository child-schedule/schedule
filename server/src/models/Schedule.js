const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const blockSchema = new mongoose.Schema({
  blockId: { type: String, default: uuidv4 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['green', 'yellow', 'orange', 'blue'], required: true },
}, { _id: false });

const rowSchema = new mongoose.Schema({
  rowId: { type: String, default: uuidv4 },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  rowLabel: { type: String, required: true },
  blocks: { type: [blockSchema], default: [] },
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true },
  // `rows` is the published/live schedule (what the rest of the app — and,
  // eventually, the dashboard — would read). `draftRows` is the working copy
  // every edit applies to; nothing reaches `rows` until an explicit "apply"
  // (see /apply route + applyDraft controller), which copies draftRows over
  // rows. Schedules created before this existed only have `rows` — getSchedule
  // backfills draftRows = rows the first time such a document is read.
  rows: { type: [rowSchema], default: [] },
  draftRows: { type: [rowSchema], default: [] },
  // Free-text note for the day, shown at the bottom of the printed schedule.
  // One overwritable note per date, independent of the draft/apply workflow.
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
