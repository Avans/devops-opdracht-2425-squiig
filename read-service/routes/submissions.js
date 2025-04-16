var express = require('express');
var router = express.Router();
const Submission = require('../models/submission');
const Target = require('../models/target');


//TODO: Moet Nog auth op
/** GET all submissions for a given user's target. */
router.get('/get/:id/:uid', async (req, res) => {
  let target = await Target.findOne({ _id: req.params.id })
  if (target == null) {
    res.status(404).send("Target not found.");
    return res;
  }
  if (target.user_id != req.params.uid) {
    res.status(403).send("Not authorized");
    return res;
  }
  let submission = await Submission.find({ targetId: req.params.id })
  res.json(submission)
});

/* GET score of target. */
router.get('/target/:id/user/:uid', async (req, res) => {
  let target = await Target.findOne({ _id: req.params.id })
  if (target == null) {
    res.status(404).send("Target not found.");
    return res;
  }

  let submission = await Submission.findOne({ targetId: req.params.id, createdByUser: req.params.uid })
  if (submission == null) {
    res.status(404).send("No submission found.");
    return res;
  }
  res.json(submission)
});


router.get('/target/:id/top/:value', async (req, res) => {


  try {
    const target = await Target.findOne({ _id: req.params.id });
    if (!target) {
      return res.status(404).send("Target not found.");
    }

    const submissions = await Submission.find({ targetId: req.params.id })
      .sort({ score: -1 })
      .limit(req.params.value); 

    if (!submissions.length) {
      return res.status(404).send("No submissions found for this target.");
    }

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});


module.exports = router;
