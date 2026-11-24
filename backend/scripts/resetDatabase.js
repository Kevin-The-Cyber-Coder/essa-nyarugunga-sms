// Full local reset: drops every collection and leaves only the bootstrap
// Headmaster account. This is intentionally explicit — never call it from the
// application startup path.
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');

const EMAIL = 'admin@essa.rw';
const PASSWORD = 'admin123';

const resetDatabase = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.drop();
    console.log(`Dropped collection: ${collection.collectionName}`);
  }

  await User.create({
    fullName: 'Head Master',
    email: EMAIL,
    password: await bcrypt.hash(PASSWORD, 10),
    role: 'headmaster',
    phone: '+250788123456',
    isActive: true
  });

  console.log(`✅ Headmaster created: ${EMAIL} / ${PASSWORD}`);
  console.log('🎉 Reset complete. No other users or records remain.');
};

resetDatabase()
  .catch((error) => {
    console.error('❌ Reset failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
