const express = require('express');
const cors = require('cors');
const teacherRoutes = require('./routes/teacherRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const teacherViewRoutes = require('./routes/teacherViewRoutes');
const classroomViewRoutes = require('./routes/classroomViewRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.use('/api/teachers', teacherRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api', teacherViewRoutes);
app.use('/api', classroomViewRoutes);

app.use(errorHandler);

module.exports = app;
