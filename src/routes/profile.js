const express = require('express');
const profileRouter = express.Router();
const User = require('../models/user');
const auth = require('../middlewares/auth.middleware');


// Get Profile info
profileRouter.get('/profile/view', auth, async (req, res) => {
    const authenticatedUser = req.user;
    if(!authenticatedUser) {
      return res.status(400).json({message: 'Bad request'})
    }
    const userEmail = req.user.emailId;
    try {
        const user = await User.find({ emailId: userEmail });
        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.send(user);
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: 'Something went wrong',
            error: err.message, // or err.errors for detailed Mongoose validations
        });
    }
});

// Edit profile
profileRouter.patch('/profile/edit', auth, async (req, res) => {

  // req.user
  const authenticatedUser = req.user;

  // Only allow certain fields to be updated.
  const { firstName, lastName, emailId } = req.body;
  const updateData = {};

  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (emailId) updateData.emailId = emailId;

  // If the password is changing, hash it before storing.
  // if (password) {
  //   updateData.password = await bcrypt.hash(password, 10);
  // }

  // Check if at least one editable field was provided.
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      message: 'No fields provided for update',
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(authenticatedUser._id, updateData, {returnDocument:'before', runValidators: true});
    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.send(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Something went wrong',
      error: err.message, // or err.errors for detailed Mongoose validations
    });
  }
});

module.exports = profileRouter;