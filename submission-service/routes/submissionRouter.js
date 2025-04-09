const express = require('express');
const publisher = require('../mqtt/publisher');
const Submission = require('../models/submission');
const Target = require('../models/target');
const router = express.Router();

// const checkSimilarity = require('../services/similarity');
const compareImage = require('../services/tagMatcher');
const timeScore = require('../services/timeScore');

router.post('/', async (req, res) => {

  const submission = new Submission({
    targetId: req.body.targetId,
    image: req.body.image,
    createdByUser: req.body.userId,
    score: 0
  });

  await Target.findById(req.body.targetId).exec()
    .then(async (target) => {
      if (!target) throw { message: `Target with id:${req.body.targetId} could not be found.`, code: 404 };

      const time = new Date();
      if (target.endtime < time) {
        throw { message: "Target is already finished", code: 400 };
      }

      //get imagescore and timescore
      return await Promise.all([
        compareImage.compareImage(target, submission.image),
        timeScore(target)
      ]).then(function (resultArray) {
        return resultArray[0] + resultArray[1]
      });
    })
    .then((score) => {
      submission.score = score
    })
    .then(() => submission.save())
    .then(savedSubmision => {
      publisher.publishDirectExchange({ 'submission': savedSubmision }, "direct_submission", "create")
      res.status(201);
      res.send("Created submission")
    })
    .catch(error => {
      if (error.name === "ValidationError") {
        let errors = {};
        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });
        return res.status(400).send(errors);
      }
      console.error(error);
      res.status(500).send("Saving submission failed.");
    });
});

/** DELETE a user's submission on a given target. */
router.delete('/targets/:targetId/user/:user', async (req, res) => {
  await Submission.findOneAndDelete({ targetId: req.params.targetId, createdByUser: req.params.user }).exec()
    .then((submission) => {
      if (submission) {
        publisher.publishDirectExchange({ '_id': submission._id }, "direct_submission", "delete");
      }
      res.status(200).send("Data deleted or not found");
    }).catch((err) => {
      console.error(err);
      res.status(500).send("Removing submission failed.");
    });
});

/** DELETE all submissions for a given target. */
router.delete('/targets/:targetId', async (req, res) => {
  const submissionIds = (await Submission.find({ targetId: req.params.targetId })).map(target => target._id);
  if (submissionIds.length == 0) {
    res.status(200).send("No submissions found for target: " + req.params.targetId);
    return res;
  }
  await Submission.deleteMany({ targetId: req.params.targetId }).exec()
    .then((deleteResult) => {
      if (deleteResult.deletedCount == 0) {
        throw new Error("No submissions deleted for target: " + req.params.targetId);
      }
      for (const submissionId of submissionIds) {
        publisher.publishDirectExchange({ '_id': submissionId }, "direct_submission", "delete");
      }
      res.status(200).send("All target submissions deleted for target id: " + req.params.targetId);
    }).catch((err) => {
      console.error(err);
      res.status(500).send("Removing submissions failed.");
    });
});

/* DELETE all submissions for a given user. */
router.delete('/user/:userId', async (req, res) => {
  const submissionIds = (await Submission.find({ createdByUser: req.params.userId })).map(submission => submission._id);
  if (submissionIds.length == 0) {
    res.status(200).send("No submissions found for user id: " + req.params.userId);
    return res;
  }
  await Submission.deleteMany({ createdByUser: req.params.userId }).exec()
    .then((deleteResult) => {
      if (deleteResult.deletedCount == 0) {
        throw new Error("No submissions deleted for user: " + req.params.userId);
      }
      for (const submissionId of submissionIds) {
        publisher.publishDirectExchange({ '_id': submissionId }, "direct_submission", "delete");
      }
      res.status(200).send("All submissions deleted for user: " + req.params.userId);
    }).catch((err) => {
      console.error(err);
      res.status(500).send("Removing submissions failed.");
    });
});

module.exports = router;
