const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json({ limit: "50mb" }))
app.use(express.json());

require('./models/target');

const router = require('./routes/routes.js')

app.use('/', router)

module.exports = app
