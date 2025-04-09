const passportJwt = require('passport-jwt');
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const passport = require('passport');
const mongoose = require('mongoose')
const User = require('../models/user');

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.PRIVATE_KEY || "SECRET"



passport.use(new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    const user = await User.findById(jwt_payload.userId);
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    console.error(err);
    done(err, false);
  }
}));

module.exports = passport
