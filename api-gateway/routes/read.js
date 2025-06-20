const express = require('express');
const router = express.Router();
const checkRole = require('../auth/authorization');
const User = require('../models/user');

/**
 * @openapi
 * /targets/user:
 *   get:
 *     summary: Retrieve targets by current user id
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A list of targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   starttime:
 *                     type: date
 *                     example: 1/1/2000
 *                   endtime:
 *                     type: date
 *                     example: 1/1/2000
 *                   description:
 *                     type: string
 *                     example: Some description
 *                   imageData:
 *                     type: string
 */
router.get('/targets/user', async function (req, res) {

  const url = `http://readservice:${process.env.PORT}/targets/get/${req.user._id}`;
  await fetch(url, {
    method: 'GET'
  }).then(async (response) => {

    if (!response.ok) {
      const errorData = await response.text();
      return Promise.reject({ status: response.status, data: errorData });
    }

    const data = await response.text();
    return { data, status: 200 };
  })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
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
 * /targets/active:
 *   get:
 *     summary: Retrieve all active targets
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A list of active targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   starttime:
 *                     type: date
 *                     example: 1/1/2000
 *                   endtime:
 *                     type: date
 *                     example: 1/1/2000
 *                   description:
 *                     type: string
 *                     example: Some description
 *                   imageData:
 *                     type: string
 *       404:
 *         description: resource not found
 *       500:
 *         description: An error occurred
 */
router.get('/targets/active', async function (req, res) {
  await fetch("http://readservice:" + process.env.PORT + "/targets/active", {
    method: 'GET'
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      return Promise.reject({ status: response.status, data: errorData });
    }

    const data = await response.text();
    return { data, status: 200 };
  })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
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
 * /submissions/target/{id}:
 *   get:
 *     summary: Retrieve all submissions for a given user's target.
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the target to retrieve submissions for.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b54764421b7156c2"
 *     responses:
 *       200:
 *         description: A list of submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   createdByUser:
 *                     type: string
 *                     example: "5f8d0d55b54764421b7156c2"
 *                   image:
 *                     type: string
 *                   targetId:
 *                     type: string
 *                     example: "5f8d0d55b54764421b7156c2"
 *                   score:
 *                     type: number
 *                     example: 150
 *       404:
 *         description: resource not found
 *       500:
 *         description: An error occurred
 */
router.get('/submissions/target/:id', async function (req, res) {
  await fetch("http://readservice:" + process.env.PORT + "/submissions/get/" + req.params.id + "/" + req.user._id, {
    method: 'GET'
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      return Promise.reject({ status: response.status, data: errorData });
    }

    const data = await response.text();
    return { data, status: 200 };
  })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
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
 * /users:
 *   get:
 *     summary: (admin) Retrieve all users.
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: "test@test.com"
 *                   passwordHash:
 *                     type: string
 *                     example: "Test User"
 *                   role:
 *                     type: string
 *                     example: "user"
 *       500:
 *         description: An error occurred
 */
router.get('/users', checkRole(['admin']), async function (req, res) {
  await User.find({}).exec()
    .then(users => {
      res.status(200).send(users);
    }).catch(err => {
      console.error(err);
      res.status(500).send(err);
    });
});

/**
 * @openapi
 * /targets/inactive:
 *   get:
 *     summary: (admin) Retrieve all inactive targets
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A list of inactive targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   starttime:
 *                     type: date
 *                     example: 1/1/2000
 *                   endtime:
 *                     type: date
 *                     example: 1/1/2000
 *                   description:
 *                     type: string
 *                     example: Some description
 *                   imageData:
 *                     type: string
 *       500:
 *         description: An error occurred
 */
router.get('/targets/inactive', checkRole(['admin']), async function (req, res) {
  await fetch("http://readservice:" + process.env.PORT + "/targets/inactive", {
    method: 'GET'
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.text();
        return Promise.reject({ status: response.status, data: errorData });
      }

      const data = await response.text();
      return { data, status: 200 };
    })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Internal server error.");
    });
});


/**
 * @openapi
 * /targets:
 *   get:
 *     summary: (admin) Retrieve all targets
 *     produces: application/json
 *     responses:
 *       200:
 *         description: A list of targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_id:
 *                     type: integer
 *                     example: 1
 *                   starttime:
 *                     type: date
 *                     example: 1/1/2000
 *                   endtime:
 *                     type: date
 *                     example: 1/1/2000
 *                   description:
 *                     type: string
 *                     example: Some description
 *                   imageData:
 *                     type: string
 *       500:
 *         description: An error occurred
 */
router.get('/targets', checkRole(['admin']), async function (req, res) {
  await fetch("http://readservice:" + process.env.PORT + "/targets", {
    method: 'GET'
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.text();
        return Promise.reject({ status: response.status, data: errorData });
      }

      const data = await response.text();
      return { data, status: 200 };
    })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Internal server error.");
    });
});


/**
 * @openapi
 * /submissions/target/{id}/user:
 *   get:
 *     summary: Retrieve current user's submission for a given target.
 *     produces: application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the target to retrieve the submission for.
 *         schema:
 *           type: string
 *           example: "5f8d0d55b54764421b7156c2"
 *     responses:
 *       200:
 *         description: A submission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 createdByUser:
 *                   type: string
 *                   example: "5f8d0d55b54764421b7156c2"
 *                 image:
 *                   type: string
 *                 targetId:
 *                   type: string
 *                   example: "5f8d0d55b54764421b7156c2"
 *                 score:
 *                   type: number
 *                   example: 150
 *       404:
 *         description: resource not found
 *       500:
 *         description: An error occurred
 */
router.get('/submission/target/:id/user', async function (req, res) {
  return fetch("http://readservice:" + process.env.PORT + "/submissions/target/" + req.params.id + "/user/" + req.user._id, {
    method: 'GET'
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.text();
        return Promise.reject({ status: response.status, data: errorData });
      }

      const data = await response.text();
      return { data, status: 200 };
    })
    .then(response => {
      res.status(response.status).send(response.data);
    })
    .catch(err => {
      if (err.status === 404) {
        res.status(404).send(err.data);
      } else {
        console.error(err);
        res.status(500).send("Internal server error.");
      }
    });
});


/// Broken OpenAPI documentation and can't be bothered to fix right now.
// /**
//  * @openapi
//  * /submissions/target/{id}/submission:
//  *   get:
//  *     summary: Retrieve x top scores of given target.
//  *     produces: application/json
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: The ID of the target to retrieve the submissions for.
//  *         schema:
//  *           type: string
//  *           example: "5f8d0d55b54764421b7156c2"
//  *       - amount: top
//  *         required: true
//  *         description: Top amount of submissions to retrieve.
//  *         schema:
//  *           type: int
//  *           example: "3"
//  *     responses:
//  *       200:
//  *         description: A submission
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 createdByUser:
//  *                   type: string
//  *                   example: "5f8d0d55b54764421b7156c2"
//  *                 image:
//  *                   type: string
//  *                 targetId:
//  *                   type: string
//  *                   example: "5f8d0d55b54764421b7156c2"
//  *                 score:
//  *                   type: number
//  *                   example: 150
//  *       404:
//  *         description: resource not found
//  *       500:
//  *         description: An error occurred
//  */

// router.get('/target/:id/submission', async function (req, res) {
//   const top = parseInt(req.query.top)

//   if (isNaN(top) || top <= 0) {
//     return res.status(400).send({ message: "Invalid top filter: must be a positive integer" });
//   }

//   await fetch("http://readservice:" + process.env.PORT + "/submissions/target/" + req.params.id + "/top/" + top, {
//     method: 'GET'
//   })
//     .then(async (response) => {
//       if (!response.ok) {
//         const errorData = await response.text();
//         return Promise.reject({ status: response.status, data: errorData });
//       }

//       const data = await response.text();
//       return { data, status: 200 };
//     })
//     .then(response => {
//       res.status(response.status).send(response.data);
//     })
//     .catch(err => {
//       if (err.status === 404) {
//         res.status(404).send(err.data);
//       } else {
//         console.error(err);
//         res.status(500).send("Internal server error.");
//       }
//     });
// });

module.exports = router;
