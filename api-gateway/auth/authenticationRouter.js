import express from 'express';
const router = express.Router();
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const saltRounds = 10;

router.post('/register', async function (req, res) {
  try {

    const hash = await bcrypt.hash(req.body.password, saltRounds);

    const user = new User({
      email: req.body.email,
      passwordHash: hash
    })

    await user.save()

    res.status(200).send({
      token: generateToken(user)
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      error: "Internal server error"
    });
  }
});


router.post('/login', async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send("Invalid email or password");
      return;
    }
    const match = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!match) {
      res.status(400).send("Invalid email or password");
      return;
    }

    res.status(200).send({
      token: generateToken(user)
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("An error occurred during authentication.");
  }
});

function generateToken(user) {
  const payload = {
    email: user.email,
    userId: user.id
  }
  const privateKey = process.env.PRIVATE_KEY || "SECRET"
  return jwt.sign(payload, privateKey, { expiresIn: '1h' })
}

export default router;
