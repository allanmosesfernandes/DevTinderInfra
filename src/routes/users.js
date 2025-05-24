const express = require('express');
const userRouter = express.Router();
const auth = require('../middlewares/auth.middleware');
const User = require('../models/user');
const ConnectionRequest = require('../models/connections');

userRouter.get('/requests', auth, async (req, res) => {
  if (!req.user) {
    res.send('User is not authorized');
  }
});

// Feed API
/* Query connections to find users with current user */
userRouter.get('/feed', auth, async (req, res) => {
  try {
    const authenticatedUser = req.user;
    const currentUserId = authenticatedUser._id;

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    /*
        /feed?page=1&limit=10 => 1-10
        /feed?page=2&limit=10 => 11-20
        */
    if (!authenticatedUser) return res.status(401).json({ message: 'Unauthorized user' });

    // Query accepted/rejected users first
    const connectionsToConsider = await ConnectionRequest.find({
      $or: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
      status: { $in: ['accepted', 'rejected'] },
    })
      .select('fromUserId toUserId')
      .lean();

    const excludedUserIds = new Set();
    excludedUserIds.add(currentUserId);

    connectionsToConsider.forEach(conn => {
      if (conn.fromUserId.equals(currentUserId)) {
        excludedUserIds.add(conn.toUserId);
      } else {
        excludedUserIds.add(conn.fromUserId);
      }
    });

    // Exclude rejected and self ids
    const exclusionQuery = { _id: { $nin: Array.from(excludedUserIds) } };

    // Get total of potential users
    const totalFeedUsers = await User.countDocuments(exclusionQuery);

    const feedUsers = await User.find({
      _id: { $nin: Array.from(excludedUserIds) },
    })
      .select('-password')
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalFeedUsers / limit);

    if (feedUsers && feedUsers.length > 0) {
      res.status(200).json({
        message: 'Users reterived successfully',
        data: feedUsers,
        pagination: {
          currentPage: page,
          totalPages,
          totalFeedUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } else {
      res.status(400).json({ message: 'Feed empty' });
    }
  } catch (err) {
    console.log(err);
    res.status(400).send('Something went wrong');
  }
});

// Delete a user
userRouter.delete('/user', async (req, res) => {
  // First get the ID using email
  const userEmail = req.body.emailId;

  try {
    const user = await User.findOne({ emailId: userEmail });
    const userID = user._id;
    await User.deleteOne(userID);
    res.send('User deleted successfully!');
  } catch (err) {
    console.log(err);
  }
});

// Update a user
userRouter.patch('/user', async (req, res) => {
  const userEmail = req.body.emailId;
  const userObj = req.body;
  // First get the ID using email
  try {
    const user = await User.findOne({ emailId: userEmail });
    const userId = user._id;
    await User.findByIdAndUpdate(userId, userObj);
    res.status(200).json({
      data: user,
      message: `User ${userId} updated successfully!`,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send('Something went wrong!');
  }
});

// Get all pending connection requests for the user
userRouter.get('/user/requests', auth, async (req, res) => {
  try {
    const authenticatedUser = req.user;
    if (!authenticatedUser) {
      return res.status(400).json({ message: 'Unauthorized user' });
    }
    // Query the collections table
    const getAllConnections = await ConnectionRequest.find({
      toUserId: authenticatedUser._id,
      status: 'interested',
    }).populate('fromUserId', ['firstName', 'lastName']);

    // Find all collections where toUserId = req.user.id
    if (getAllConnections && getAllConnections.length > 0) {
      res.status(200).json({
        message: 'Connections received successfully',
        data: getAllConnections,
      });
    } else {
      res.status(400).json({
        message: 'No connections found',
      });
    }
  } catch (err) {
    res.status(400).send('Something went wrong' + err.message);
  }
});

// Get all active connections
userRouter.get('/user/connections', auth, async (req, res) => {
  try {
    const authenticatedUser = req.user;
    const userId = authenticatedUser._id;

    if (!authenticatedUser) return res.status(401).json({ message: 'Unauthorized user' });

    // Fetch all connections for user
    const userConnections = await ConnectionRequest.find({
      $or: [
        { toUserId: userId, status: 'accepted' },
        { fromUserId: userId, status: 'accepted' },
      ],
    })
      .populate('fromUserId', ['firstName', 'lastName'])
      .populate('toUserId', ['firstName', 'lastName']);

    if (!userConnections || userConnections.length === 0) {
      res.status(404).json({ message: 'No connections' });
    }

    // Map connections
    const connectionsWithOtherUser = userConnections.map(conn => {
      let otherUser;
      if (conn.fromUserId._id.equals(userId)) {
        otherUser = conn.toUserId;
      } else {
        otherUser = conn.fromUserId;
      }
      return {
        connectionId: conn._id,
        status: conn.status,
        connectedWith: {
          _id: otherUser._id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
        },
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt,
      };
    });

    res.status(200).json({
      message: 'Connections retrieved successfully',
      data: connectionsWithOtherUser,
    });
  } catch (err) {
    res.status(400).json({ message: 'Unknown error' + err });
  }
});
module.exports = userRouter;
