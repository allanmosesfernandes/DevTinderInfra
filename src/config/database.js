const mongoose = require('mongoose');
const uri = 'mongodb+srv://admin:admin@devtindercluster.rnb4xhp.mongodb.net/?appName=DevTinderCluster';

async function connectDB() {
  await mongoose.connect(uri);
}

module.exports = connectDB;
