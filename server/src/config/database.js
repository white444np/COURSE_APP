const mongoose = require('mongoose');
const config = require('./env');

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;
