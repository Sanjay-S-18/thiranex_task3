const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('Ensure MongoDB is installed and running, or configure a valid MONGO_URI in .env');
    // Don't crash the server immediately, so the user can still see frontend files and receive informative API errors
  }
};

module.exports = connectDB;
