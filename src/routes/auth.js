const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');

// Sign up API
authRouter.post('/signup', async (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'emailId', 'password'];

  // Validate all required fields exist
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Missing required field:` });
    }
  }

  // Now destructure and hash after the loop
  const { firstName, lastName, emailId, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const payload = {
    firstName,
    lastName,
    emailId,
    password: passwordHash,
  };

  const user = new User(payload);

  try {
    await user.save();
    res.json({
      message: 'user created successfully',
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Something went wrong',
      error: err.message,
    });
  }
});

// Login API
authRouter.post('/login', async (req, res) => {
  const requiredFields = ['emailId', 'password'];
  // Validate all required fields exist
  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Missing required field:` });
    }
  }

  // Find the user against their email
  const { emailId, password } = req.body;

  try {
    const user = await User.find({ emailId: emailId });
    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }
    const userPassword = user[0].password;
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (isPasswordValid) {
      // Password is valid create JWT token
      const token = await jwt.sign({ _id: user[0]._id }, 'ajhs$#@#12)S', { expiresIn: '1d' });
      res.cookie('token', token);
      req.user = user;
      res.send(user);
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Something went wrong',
      error: err.message, // or err.errors for detailed Mongoose validations
    });
  }
});

// Logout API
authRouter.post('/logout', async (req, res) => {
  res.cookie('token', null, { expires: new Date(Date.now()) });
  res.send('Logout successful');
});

module.exports = authRouter;
