const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');

// Create connections schema
const connectionsSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['ignored', 'interested', 'accepted', 'rejected'],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Creating compound index on from and to user
connectionsSchema.index({ fromUserId: 1, toUserId: 1 });

// Create model
const Connections = new mongoose.model('Connections', connectionsSchema);

module.exports = Connections;