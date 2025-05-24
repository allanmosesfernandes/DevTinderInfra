const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const { nameValidator } = require('../utils/helpers/validations.js');

// Create user schema
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minLength: 3, maxLength: 35, validate: nameValidator },
    lastName: { type: String, required: true, trim: true, minLength: 3, maxLength: 35, validate: nameValidator },
    gender: {
      type: String,
      enum: ['male', 'female', 'others'],
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: validator.isStrongPassword,
      },
    },
    age: { type: Number, min: 18 },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create a compound index on the schema
userSchema.index({firstName: 1, lastName: 1})

// Create model
const User = new mongoose.model('User', userSchema);

module.exports = User;
