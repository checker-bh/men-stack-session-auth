/* eslint-disable prefer-destructuring */
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');

const router = express.Router();

// Register
router.get('/sign-up', (req, res, next) => {
  res.render('auth/sign-up.ejs');
});

router.post('/sign-up', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  try {
    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return res.send('Ooops Something went wrong');
    }

    if (password !== confirmPassword) {
      return res.send('Password and Confirm Password do not match');
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUNDS));

    // req.body.password = hashedPassword;

    // Alternative way to creating objects from form submission
    const payload = {
      username,
      password: hashedPassword,
    };

    const user = await User.create(payload);

    res.send(`Thanks for signing up ${user.username}`);
  } catch (error) {
    throw new Error('Something went wrong');
  }
});

// Login

router.get('/sign-in', (req, res, next) => {
  res.render('auth/sign-in.ejs');
});

router.post('/sign-in', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await User.findOne({
    username,
  });

  if (!existingUser) {
    return res.send('Invalid username or password');
  }

  const validPassword = await bcrypt.compare(password, existingUser.password);

  if (!validPassword) {
    res.send('Invalid username or password');
  }

  req.session.user = {
    username: existingUser.username,
    _id: existingUser._id,
  };

  res.redirect('/');
});

// Logout
router.get('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;