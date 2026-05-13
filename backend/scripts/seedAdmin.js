const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    const cloudUri = 'mongodb+srv://ashassauti_db:pict123@cluster0.jogias5.mongodb.net/lostfound?retryWrites=true&w=majority';
    const uri = process.env.MONGODB_URI || cloudUri;
    console.log('Connecting to:', uri.split('@')[1] || uri); // Log only the cluster part for safety
    
    await mongoose.connect(uri);

    const adminEmail = 'admin@pict.edu';
    const adminPass = 'admin123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists. Updating role and password...');
      existingAdmin.password = adminPass;
      existingAdmin.role = 'ADMIN';
      existingAdmin.name = 'System Admin';
      await existingAdmin.save();
      console.log('Admin account updated successfully.');
    } else {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPass,
        role: 'ADMIN'
      });
      console.log('Admin account created successfully.');
    }

    console.log('\n-----------------------------------');
    console.log('Login Credentials:');
    console.log('Email:', adminEmail);
    console.log('Pass:', adminPass);
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
