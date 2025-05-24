const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  // Check for cookies.
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).send('Invalid request');
  }
  // We have a token so validate JWT
  let decode;
  try {
    // Attempt to verify the token.
    decoded = jwt.verify(token, 'ajhs$#@#12)S');
  } catch (err) {
    // If token verification fails, exit gracefully.
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  const { _id } = decoded;

  // Verify if user exists in DB.
  try {
    const user = await User.findById(_id);
    req.user = user;
    if (!user || user.length === 0) {
      return res.status(400).send('Invalid user');
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: 'Something went wrong',
      error: err.message,
    });
  }
  next();
};

module.exports = auth;
