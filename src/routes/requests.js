const express = require('express');
const requestsRouter = express.Router();
const Requests = require('../models/connections');
const auth = require('../middlewares/auth.middleware');
const ConnectionRequest = require('../models/connections');
const User = require('../models/user');
const Connections = require('../models/connections');

// Sending connection request
// POST /request/send/interested/:userId
requestsRouter.post('/request/send/:status/:toUserId', auth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const authenticatedUser = req.user;
    const fromUserId = authenticatedUser._id.toString();

    // Cant send connection request to self
    if (fromUserId === toUserId) {
      return res.status(400).send('Invalid request!');
    }

    // Can only send interested or ignored
    const allowedStatus = ['interested', 'ignored'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send('Invalid connection request');
    }

    // Check if toUser exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(400).send('User not found');
    }

    // Check if connection already exists
    const exisitingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (exisitingConnectionRequest) {
      return res.status(400).send('Duplicate request');
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      message: 'Connection sent successfully',
      data,
    });
  } catch (error) {
    res.status(404).send('Unknown error' + error.message);
  }
});

// Reviewing Requests
requestsRouter.post('/request/review/:status/:requestId', auth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const authenticatedUser = req.user;

    // Ensure status is valid
    const validStatus = ['accepted', 'rejected']
    if(!validStatus.includes(status)) {
      return res.status(400).json({message: 'Invalid Request'})
    }

    // Check if requestId belongs to Roshal and if the status is interested
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      status: 'interested',
      toUserId: authenticatedUser.id,
    })

    if(!connectionRequest) {
      return res.status(400).json({message: 'Invalid connection request'})
    }

    connectionRequest.status = status;
    const updatedData = await connectionRequest.save();

    res.status(200).json({
      message: 'Connection' +status,
      data: updatedData
    })

  } catch (error) {
    res.status(400).send('Unknown error' + error.message)
  }
})

module.exports = requestsRouter;
