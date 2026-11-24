const bcrypt = require('bcryptjs');

const User = require('../models/User');

// Bootstrap only. This creates the initial Headmaster account and nothing else:
// news, gallery, announcements, admissions and contacts are real records that
// must come from the school, never from seed/mock content. Destructive resets
// belong in scripts/resetDatabase.js, which is run explicitly.
const seedDatabase = async () => {
  const email = (process.env.SEED_HEADMASTER_EMAIL || 'admin@essa.rw').toLowerCase();
  const existing = await User.findOne({ $or: [{ email }, { role: 'headmaster' }] });
  if (existing) {
    console.log('ℹ️  Headmaster account already exists; skipping bootstrap seed.');
    return;
  }

  console.log('\n🌱 Bootstrapping Headmaster account...');
  const password = process.env.SEED_HEADMASTER_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    fullName: process.env.SEED_HEADMASTER_NAME || 'Head Master',
    email,
    password: hashedPassword,
    role: 'headmaster',
    phone: process.env.SEED_HEADMASTER_PHONE || '+250788123456',
    isActive: true
  });

  console.log(`✅ Headmaster created: ${email}`);
  if (!process.env.SEED_HEADMASTER_PASSWORD) {
    console.log('⚠️  Default password used. Set SEED_HEADMASTER_PASSWORD and change it after first login.');
  }
  console.log('🎉 Bootstrap done!\n');
};

module.exports = seedDatabase;
