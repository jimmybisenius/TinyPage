const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const md5 = require('md5');

const User = mongoose.model('User');
const Profile = mongoose.model('Profile');

module.exports = (req, res) => {
  if (!req.body.email) return res.status(400).send('Missing email');
  if (!req.body.password) return res.status(400).send('Missing password');
  User.findOne({email: req.body.email}, function (err, user) {
    if (err) return res.status(500).send(err);
    if (user) return res.status(400).send('User with that email address already exists');
    bcrypt.hash(req.body.password, 10, function (err, hash) {
      if (err) return res.status(500).send(err);
      new User({
        name: req.body.name || null,
        email: req.body.email || null,
        password: hash,
        hash: md5(req.body.email)
      }).save(async function (err, user) {
        let profile = await new Profile({
		parent: user._id,
		handle: req.body.handle || user._id
	}).save();
	  //new Profile({parent: user._id, handle: req.body.handle || user._id}).save(function (err, profile) {
          user.active_profile = profile._id;
          user.save(function (err, user) {
            if (err) return res.send(err);
            return res.status(201).json({
              user: user,
              active_profile: profile,
              token: jwt.sign(
                {
                  email: user.email,
                }, config.secret, {
                  expiresIn: '168h'
                }
              )
            });
          });
        //});
      });
    });
  });};