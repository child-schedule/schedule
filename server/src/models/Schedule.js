const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const blockSchema = new mongoose.Schema({
  blockId: { type: String, default: uuidv4 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, enum: ['green', 'yellow', 'orange'], required: true },
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
  rows: { type: [rowSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
