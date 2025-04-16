const express = require('express');
const path = require('path');
const logger = require('morgan');

const submissionsRouter = require('./routes/submissions');
const targetsRouter = require('./routes/targets');

const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URL || 'mongodb://readservicedb:27017/read';
mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));


  const app = express();

require('./models/target');
require('./models/submission');

const callbacks = require('./mqtt/subscribeCallbacks')
const subscriber = require('./mqtt/subscriber')
subscriber.subscribe('direct_target', 'create', callbacks.createTarget)
subscriber.subscribe('direct_target', 'delete', callbacks.deleteTarget)
subscriber.subscribe('direct_submission', 'create', callbacks.createSubmission)
subscriber.subscribe('direct_submission', 'delete', callbacks.deleteSubmission)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/submissions', submissionsRouter);
app.use('/targets', targetsRouter);

module.exports = app;
