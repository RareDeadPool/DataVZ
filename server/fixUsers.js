const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dataviz';

mongoose.connect(uri)
  .then(async () => {
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Remove username field from all documents
    await users.updateMany({}, { $unset: { username: "" } });
    console.log('Removed username field from all users.');

    // Try to drop the username index if it exists
    try {
      await users.dropIndex('username_1');
      console.log('Dropped username_1 index.');
    } catch (err) {
      console.log('username_1 index not found or already removed.');
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  }); 