import express from "express";
const router = express.Router();
import multer from "multer";
const upload = multer();
import checkRole from "../auth/authorization.js";
import mongoose from "mongoose";
import User from "../models/user.js";

/**
 * @openapi
 * /:
 *   post:
 *     summary: Create a new submission for a given target by a given user.
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: An error occurred
 */
router.post("/", upload.single("image"), async function (req, res) {

  if (!req.body) return res.status(400).send("Cannot POST empty body");
  if (!req.file) return res.status(400).send("No File found");

  let dataToSend = {
    image: req.file.buffer.toString("base64"),
    targetId: req.body.targetId,
    userId: req.user._id,
  };

  const jsonData = JSON.stringify(dataToSend);

  const url = `http://submissionservice:${process.env.PORT}/`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: jsonData,
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      return Promise.reject({ status: response.status, data: errorData });
    }

    const data = await response.text();
    return { data, status: 200 };
  })
  .then((response) => {
    res.status(response.status).send(response.data);
  })
  .catch((err) => {
    if (err.status === 400) {
      res.status(400).send(err.data);
    } else {
      console.error(err);
      res.status(500).send("Internal server error.");
    }
  });
});

/**
 * @openapi
 * /target/{targetId}/user:
 *   delete:
 *     summary: Delete submission of a given target for currently authenticated user.
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         description: The ID of the target to delete the submission for.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b54764421b7156c2"
 *     responses:
 *       200:
 *         description: A message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: resource not found
 *       500:
 *         description: An error occurred
 */
router.delete("/target/:targetId/user", async function (req, res) {
  const url = `http://submissionservice:${process.env.PORT}/targets/${req.params.targetId}/user/${req.user._id}`;
  await fetch(url, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.text();
        return Promise.reject({ status: response.status, data: errorData });
      }

      const data = await response.text();
      return { data, status: 200 };
    })
    .then((response) => {
      res.status(response.status).send(response.data);
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send(err.data);
      } else {
        console.error(err);
        res.status(500).send("Internal server error.");
      }
    });
});

/**
 * @openapi
 * /target/{targetId}:
 *   delete:
 *     summary: (admin) Delete all submissions for a given target.
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         description: The ID of the target to delete the submissions for.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b54764421b7156c2"
 *     responses:
 *       200:
 *         description: A message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: resource not found
 *       500:
 *         description: An error occurred
 */
router.delete(
  "/target/:targetId",
  checkRole(["admin"]),
  async function (req, res) {
    const url = `http://submissionservice:${process.env.PORT}/targets/${req.params.targetId}`;
    await fetch(url, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.text();
          return Promise.reject({ status: response.status, data: errorData });
        }

        const data = await response.text();
        return { data, status: 200 };
      })
      .then((response) => {
        res.status(response.status).send(response.data);
      })
      .catch((err) => {
        if (err.status === 404) {
          res.status(404).send(err.data);
        } else {
          console.error(err);
          res.status(500).send("Internal server error.");
        }
      });
  }
);

/**
 * @openapi
 * /user/{userId}:
 *   delete:
 *     summary: (admin) Delete all submissions for a given user.
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to delete the submissions for.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b54764421b7156c2"
 *     responses:
 *       200:
 *         description: A message
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: An error occurred
 */
router.delete("/user/:user", checkRole(["admin"]), async function (req, res) {
  let userId;
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.user)) {
      userId = req.params.user;
    } else {
      await User.findOne({ email: req.params.user }).then((user) => {
        userId = user._id;
      });
    }
  } catch (_err) {
    res
      .status(404)
      .send("User not found. Please supply a valid user id or email.");
    return;
  }

  if (!userId) {
    res.status(404).send("User not found.");
    return;
  }

  const url = `http://submissionservice:${process.env.PORT}/user/${userId}`;
  await fetch(url, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.text();
        return Promise.reject({ status: response.status, data: errorData });
      }

      const data = await response.text();
      return { data, status: 200 };
    })
    .then((response) => {
      res.status(response.status).send(response.data);
    })
    .catch((err) => {
      if (err.status === 404) {
        res.status(404).send(err.data);
      } else {
        console.error(err);
        res.status(500).send("Internal server error.");
      }
    });
});

export default router;
