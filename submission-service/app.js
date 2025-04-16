const express = require('express');

const logger = require('morgan');

const submissionsRouter = require('./routes/submissionRouter');

const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URL || 'mongodb://submissiondb:27017/submissions';
mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const app = express();

require('./models/target');
require('./models/submission');
const callbacks = require('./mqtt/subscribeCallback')
const subscriber = require('./mqtt/subscriber')
subscriber.subscribe('direct_target', 'create', callbacks.createTarget)
subscriber.subscribe('direct_target', 'delete', callbacks.deleteTarget)


app.use(logger('dev'));
app.use(express.json({ limit: "50mb" }));
app.use(express.json());

app.use('/', submissionsRouter);

module.exports = app;
