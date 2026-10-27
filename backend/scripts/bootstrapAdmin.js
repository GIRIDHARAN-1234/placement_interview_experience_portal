const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const bootstrapAdmin = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placement_portal';

  try {
    await mongoose.connect(uri);
    console.log('[Bootstrap] Connected to MongoDB.');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass@2026';
    const adminName = process.env.ADMIN_NAME || 'Placement Cell Administrator';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`[Bootstrap] Admin account already exists: ${admin.email}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        registerNumber: 'ADMIN001',
        department: 'Placement & Training Cell',
        graduationYear: 2020,
        passwordHash,
        role: 'admin',
        accountStatus: 'active',
      });

      console.log(`[Bootstrap] Successfully created Admin account!`);
      console.log(`[Bootstrap] Email: ${admin.email}`);
      console.log(`[Bootstrap] Role: ${admin.role}`);
    }

    await mongoose.disconnect();
    console.log('[Bootstrap] Finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Bootstrap Error] ${error.message}`);
    process.exit(1);
  }
};

bootstrapAdmin();
