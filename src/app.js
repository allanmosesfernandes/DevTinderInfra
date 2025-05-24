const express = require('express');
const connectDB = require('./config/database');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const auth = require('./middlewares/auth.middleware');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestsRouter = require('./routes/requests');
const userRouter = require('./routes/users');
const cors = require('cors');

const corsOptions = {
  origin: 'http://13.53.143.156:3000',
  credentials: true, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestsRouter);
app.use('/', userRouter);

// Connect to DB and ONLY then start the server.
connectDB()
  .then(res => {
    console.log('Database connection established');
    app.listen('3000', () => {
      console.log('Listening on port 3000');
    });
  })
  .catch(err => {
    console.log(err);
  });

// Profile
app.get('/profile', auth, async (req, res) => {
  const _id = req.user.id;

  try {
    const user = await User.findById(_id);
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

// Send connection request
app.post('/sendConnectionRequest', auth, async (req, res) => {
  // Sending connection request

  try {
    if (req.user) {
      console.log('Sending connection request');
      res.send('Connection request sent!!');
    } else {
      res.status(401).send('Invalid user');
    }
  } catch (error) {
    res.status(401).send({
      error: error,
      message: 'Invalid user',
    });
  }
});
