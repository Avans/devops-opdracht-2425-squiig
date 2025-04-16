const express = require('express');
const router = express.Router();
const Target = require('../models/target');


/* GET targets listing by id. */
router.get('/get/:id', async (req, res) => {
  const targets = await Target.find({ user_id: req.params.id })
  res.json(targets)
});

/* GET active targets listing. */
router.get('/active', async function (req, res) {
  console.log(new Date())
  const targets = await Target.find({
    "starttime": {
      $lte: new Date()
    },
    "endtime": {
      $gt: new Date()
    }
  });

  res.json(targets);
});

/* GET inactive targets listing. */
router.get('/inactive', async function (req, res) {
  const targets = await Target.find({
    "$or": [
      {
        "starttime": {
          $gt: new Date()
        }
      },
      {
        "endtime": {
          $lt: new Date()
        }
      }
    ]
  });

  res.json(targets);
});

/* GET all targets. */
router.get('/', async function (req, res) {
  const targets = await Target.find({});
  res.json(targets);
});


module.exports = router;
