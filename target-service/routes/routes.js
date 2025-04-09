const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Target = require('../models/target');
const publisher = require('../mqtt/publisher');

// Connect to MongoDB (replace with your connection string)
const mongoUri = process.env.MONGO_URL || 'mongodb://targetdb:27017/targets';
mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));


router.post('/upload', async (req, res) => {
  if (await Target.findOne({ imageData: req.body.imageData })) {
    return res.status(400).send("Aborting: Target of this image already exists");
  }

  let newTarget = new Target({
    user_id: req.body.user,
    starttime: req.body.additionalString.starttime,
    endtime: req.body.additionalString.endtime,
    description: req.body.additionalString.description,
    imageData: req.body.imageData,
  });
  await newTarget.save()
    .then(savedTarget => {
      publisher.publishDirectExchange({ 'target': savedTarget }, "direct_target", "create")
      res.status(201).send("Created target")
    })
    .catch(error => {
      if (error.name === "ValidationError") {
        let errors = {};

        Object.keys(error.errors).forEach((key) => {
          errors[key] = error.errors[key].message;
        });

        return res.status(400).send(errors);
      }
      res.status(500).send("Saving target failed. Error: " + error);
    });

});

router.delete('/:id/:uid', async (req, res) => {
  let target = await Target.findOne({ _id: req.params.id })
  if (target == null) {
    res.status(404).send("Target not found.");
    return res;
  }
  if (target.user_id != req.params.uid) {
    res.status(403).send("Not authorized");
    return res;
  }
  (await Target.deleteOne({ _id: req.params.id })
    .then(deletedTarget => {
      if (deletedTarget.acknowledged) {
        publisher.publishDirectExchange({ 'id': req.params.id }, "direct_target", "delete")
        res.status(200).send("Target deleted successfully.");
      } else {
        throw new Error("Deleting was not acknowledged");
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send("Deleting target failed.")
    }));

});



/* DELETE all targets for a given user. */
router.delete('/user/:userId', async (req, res) => {
  const targetIds = (await Target.find({ user_id: req.params.userId })).map(target => target._id);
  if (targetIds.length == 0) {
    res.status(200).send("No targets found for user: " + req.params.userId);
    return res;
  }
  await Target.deleteMany({ user_id: req.params.userId }).exec()
    .then((deleteResult) => {
      if (deleteResult.deletedCount == 0) {
        res.status(404).send("No targets deleted for user: " + req.params.userId);
        return;
      }

      for (const targetId of targetIds) {
        publisher.publishDirectExchange({ 'id': targetId }, "direct_target", "delete");
      }

      res.status(200).send(`${deleteResult.deletedCount} targets deleted for user:` + req.params.userId);
    }, (err) => {
      console.error(err);
      res.status(500).send("Removing targets failed.");
    }).catch(e => {
      res.status(404).send("BadRequest - Target not found");
      console.log(e);
      console.log("No targets found for user: " + req.params.userId);
    });
});


module.exports = router;
